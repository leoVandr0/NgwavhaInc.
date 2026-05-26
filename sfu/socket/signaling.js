// Socket.IO signaling for the SFU. One socket == one peer in one room.
// Auth: every join-room must carry the same JWT the browser already stores in
// localStorage (verified against the shared JWT_SECRET). Media never flows here —
// only SDP/ICE/control. Media goes directly to the mediasoup UDP ports.

import jwt from 'jsonwebtoken';
import config from '../config.js';
import { getOrCreateRoom, getRoom } from '../mediasoup/room.js';

// Module-level handle to the /live namespace, set on registerSignaling. The
// HTTP admin endpoint (closeRoomFromAdmin) reuses it to broadcast session-ended
// before tearing down the mediasoup Router.
let liveNamespace = null;

// Close a room from outside the socket loop (HTTP admin -> SFU). Sends
// session-ended to everyone in the room so their clients clean up locally,
// then tears down the Router. Returns true if the room existed.
export function closeRoomFromAdmin(meetingId) {
    const room = getRoom(meetingId);
    if (!room) return false;
    if (liveNamespace) liveNamespace.to(meetingId).emit('session-ended');
    room.close();
    return true;
}

function verifyToken(token, displayName) {
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, config.jwtSecret);
    // The API signs tokens as { userId, role } (and some flows as { id } only).
    // The token is the AUTHORITY for identity + role. The display name is not in
    // the token, so the client passes it as a label only — never trusted for auth.
    return {
        userId: decoded.userId || decoded.id,
        role: decoded.role || 'student',
        name: (displayName && String(displayName).slice(0, 80)) || 'Participant'
    };
}

export function registerSignaling(io) {
    const live = io.of('/live');
    liveNamespace = live;

    live.on('connection', (socket) => {
        // Per-socket state set on successful join.
        socket.data.meetingId = null;
        socket.data.user = null;

        // --- Join / auth -----------------------------------------------------
        socket.on('join-room', async ({ meetingId, token, displayName }, callback) => {
            try {
                if (!meetingId) throw new Error('meetingId required');
                const user = verifyToken(token, displayName);

                const room = await getOrCreateRoom(meetingId);
                room.addPeer(socket.id, user);

                socket.data.meetingId = meetingId;
                socket.data.user = user;
                socket.join(meetingId);

                // Tell others someone joined (for the participant list).
                socket.to(meetingId).emit('peer-joined', {
                    socketId: socket.id,
                    userId: user.userId,
                    name: user.name,
                    role: user.role
                });

                callback({
                    rtpCapabilities: room.router.rtpCapabilities,
                    peers: room.listPeers().filter((p) => p.socketId !== socket.id),
                    producers: room.getOtherProducers(socket.id)
                });
            } catch (err) {
                console.warn('join-room rejected:', err.message);
                callback({ error: err.message });
            }
        });

        // --- Transport creation ---------------------------------------------
        socket.on('create-transport', async ({ direction }, callback) => {
            try {
                const room = requireRoom(socket);
                const { params } = await room.createWebRtcTransport(socket.id);
                callback({ ...params, direction });
            } catch (err) {
                callback({ error: err.message });
            }
        });

        socket.on('connect-transport', async ({ transportId, dtlsParameters }, callback) => {
            try {
                const room = requireRoom(socket);
                const peer = room.getPeer(socket.id);
                const transport = peer?.transports.get(transportId);
                if (!transport) throw new Error('Transport not found');
                await transport.connect({ dtlsParameters });
                callback({ ok: true });
            } catch (err) {
                callback({ error: err.message });
            }
        });

        // --- Producing (send mic/cam/screen) --------------------------------
        socket.on('produce', async ({ transportId, kind, rtpParameters, appData }, callback) => {
            try {
                const room = requireRoom(socket);
                const peer = room.getPeer(socket.id);
                const transport = peer?.transports.get(transportId);
                if (!transport) throw new Error('Transport not found');

                const producer = await transport.produce({ kind, rtpParameters, appData });
                peer.producers.set(producer.id, producer);

                producer.on('transportclose', () => {
                    producer.close();
                    peer.producers.delete(producer.id);
                });

                // Notify everyone else so they can consume the new stream.
                socket.to(room.meetingId).emit('new-producer', {
                    producerId: producer.id,
                    socketId: socket.id,
                    name: peer.name,
                    role: peer.role,
                    kind: producer.kind,
                    appData: producer.appData
                });

                callback({ id: producer.id });
            } catch (err) {
                callback({ error: err.message });
            }
        });

        // --- Consuming (receive others' streams) ----------------------------
        socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
            try {
                const room = requireRoom(socket);
                const peer = room.getPeer(socket.id);

                if (!room.router.canConsume({ producerId, rtpCapabilities })) {
                    throw new Error('Cannot consume this producer');
                }

                const transport = peer?.transports.get(transportId);
                if (!transport) throw new Error('Transport not found');

                const consumer = await transport.consume({
                    producerId,
                    rtpCapabilities,
                    paused: true // start paused; client resumes once ready
                });
                peer.consumers.set(consumer.id, consumer);

                consumer.on('transportclose', () => {
                    consumer.close();
                    peer.consumers.delete(consumer.id);
                });
                consumer.on('producerclose', () => {
                    consumer.close();
                    peer.consumers.delete(consumer.id);
                    socket.emit('consumer-closed', { consumerId: consumer.id });
                });

                callback({
                    id: consumer.id,
                    producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    appData: consumer.appData
                });
            } catch (err) {
                callback({ error: err.message });
            }
        });

        socket.on('resume-consumer', async ({ consumerId }, callback) => {
            try {
                const room = requireRoom(socket);
                const consumer = room.getPeer(socket.id)?.consumers.get(consumerId);
                if (!consumer) throw new Error('Consumer not found');
                await consumer.resume();
                callback?.({ ok: true });
            } catch (err) {
                callback?.({ error: err.message });
            }
        });

        // --- Producer teardown (e.g. stop screen share / camera) ------------
        socket.on('close-producer', ({ producerId }) => {
            const room = getRoom(socket.data.meetingId);
            const peer = room?.getPeer(socket.id);
            const producer = peer?.producers.get(producerId);
            if (producer) {
                producer.close();
                peer.producers.delete(producerId);
                socket.to(room.meetingId).emit('producer-closed', {
                    producerId,
                    socketId: socket.id
                });
            }
        });

        // --- Producer pause / resume (mic mute, camera off, etc.) -----------
        // Pausing on the server stops forwarding the stream to consumers, so we
        // don't waste bandwidth on muted tracks. We also broadcast the state
        // change so remote UIs can show a "muted" indicator instead of a
        // frozen-looking video tile.
        socket.on('pause-producer', async ({ producerId }, callback) => {
            try {
                const room = requireRoom(socket);
                const producer = room.getPeer(socket.id)?.producers.get(producerId);
                if (!producer) throw new Error('Producer not found');
                await producer.pause();
                socket.to(room.meetingId).emit('producer-paused', {
                    producerId,
                    socketId: socket.id
                });
                callback?.({ ok: true });
            } catch (err) {
                callback?.({ error: err.message });
            }
        });

        socket.on('resume-producer', async ({ producerId }, callback) => {
            try {
                const room = requireRoom(socket);
                const producer = room.getPeer(socket.id)?.producers.get(producerId);
                if (!producer) throw new Error('Producer not found');
                await producer.resume();
                socket.to(room.meetingId).emit('producer-resumed', {
                    producerId,
                    socketId: socket.id
                });
                callback?.({ ok: true });
            } catch (err) {
                callback?.({ error: err.message });
            }
        });

        // --- In-room text chat ----------------------------------------------
        socket.on('chat-message', ({ text }) => {
            const room = getRoom(socket.data.meetingId);
            const user = socket.data.user;
            if (!room || !user || !text) return;
            live.to(room.meetingId).emit('chat-message', {
                socketId: socket.id,
                name: user.name,
                role: user.role,
                text: String(text).slice(0, 2000),
                timestamp: Date.now()
            });
        });

        // --- Instructor ends the session for everyone -----------------------
        socket.on('end-session', (_, callback) => {
            const room = getRoom(socket.data.meetingId);
            const user = socket.data.user;
            if (!room) return callback?.({ error: 'No room' });
            if (user?.role !== 'instructor' && user?.role !== 'admin') {
                return callback?.({ error: 'Not authorized' });
            }
            live.to(room.meetingId).emit('session-ended');
            room.close();
            callback?.({ ok: true });
        });

        // --- Leave / disconnect ---------------------------------------------
        const leave = () => {
            const room = getRoom(socket.data.meetingId);
            if (!room) return;
            const closedProducerIds = room.removePeer(socket.id);
            socket.to(room.meetingId).emit('peer-left', {
                socketId: socket.id,
                closedProducerIds
            });
            room.maybeClose();
            socket.data.meetingId = null;
        };

        socket.on('leave-room', leave);
        socket.on('disconnect', leave);
    });
}

function requireRoom(socket) {
    const room = getRoom(socket.data.meetingId);
    if (!room) throw new Error('Not in a room — join first');
    return room;
}
