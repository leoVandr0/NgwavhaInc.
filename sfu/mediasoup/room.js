// A Room wraps one mediasoup Router (one per live-session meetingId) and tracks
// the peers inside it, their transports, producers and consumers. Rooms are
// created lazily on the first join and destroyed when the last peer leaves or
// the instructor ends the session.

import config from '../config.js';
import { getNextWorker } from './worker.js';

const rooms = new Map(); // meetingId -> Room

export async function getOrCreateRoom(meetingId) {
    let room = rooms.get(meetingId);
    if (room) return room;

    const worker = getNextWorker();
    const router = await worker.createRouter({
        mediaCodecs: config.mediasoup.router.mediaCodecs
    });

    room = new Room(meetingId, router);
    rooms.set(meetingId, room);
    console.log(`🟢 Room created: ${meetingId}`);
    return room;
}

export function getRoom(meetingId) {
    return rooms.get(meetingId);
}

export class Room {
    constructor(meetingId, router) {
        this.meetingId = meetingId;
        this.router = router;
        this.peers = new Map(); // socketId -> Peer
    }

    addPeer(socketId, user) {
        const peer = {
            socketId,
            userId: user.userId,
            name: user.name,
            role: user.role,
            transports: new Map(), // transportId -> WebRtcTransport
            producers: new Map(), // producerId -> Producer
            consumers: new Map() // consumerId -> Consumer
        };
        this.peers.set(socketId, peer);
        return peer;
    }

    getPeer(socketId) {
        return this.peers.get(socketId);
    }

    // Lightweight peer info for the participant list (no mediasoup objects).
    listPeers() {
        return Array.from(this.peers.values()).map((p) => ({
            socketId: p.socketId,
            userId: p.userId,
            name: p.name,
            role: p.role
        }));
    }

    // Every producer currently published in the room, except the requester's own.
    getOtherProducers(exceptSocketId) {
        const list = [];
        for (const peer of this.peers.values()) {
            if (peer.socketId === exceptSocketId) continue;
            for (const producer of peer.producers.values()) {
                list.push({
                    producerId: producer.id,
                    socketId: peer.socketId,
                    name: peer.name,
                    role: peer.role,
                    kind: producer.kind,
                    appData: producer.appData,
                    paused: producer.paused
                });
            }
        }
        return list;
    }

    async createWebRtcTransport(socketId) {
        const { webRtcTransport } = config.mediasoup;
        const transport = await this.router.createWebRtcTransport({
            listenIps: webRtcTransport.listenIps,
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: webRtcTransport.initialAvailableOutgoingBitrate
        });

        if (webRtcTransport.maxIncomingBitrate) {
            try {
                await transport.setMaxIncomingBitrate(webRtcTransport.maxIncomingBitrate);
            } catch (e) {
                // Non-fatal — bitrate cap is best-effort.
            }
        }

        const peer = this.getPeer(socketId);
        if (peer) peer.transports.set(transport.id, transport);

        return {
            transport,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        };
    }

    // Remove a peer and close all of its mediasoup objects. Returns the producer
    // ids that were closed so the caller can tell other peers to drop them.
    removePeer(socketId) {
        const peer = this.peers.get(socketId);
        if (!peer) return [];

        const closedProducerIds = Array.from(peer.producers.keys());

        for (const consumer of peer.consumers.values()) consumer.close();
        for (const producer of peer.producers.values()) producer.close();
        for (const transport of peer.transports.values()) transport.close();

        this.peers.delete(socketId);
        return closedProducerIds;
    }

    isEmpty() {
        return this.peers.size === 0;
    }

    close() {
        for (const socketId of Array.from(this.peers.keys())) {
            this.removePeer(socketId);
        }
        this.router.close();
        rooms.delete(this.meetingId);
        console.log(`🔴 Room closed: ${this.meetingId}`);
    }

    maybeClose() {
        if (this.isEmpty()) this.close();
    }
}
