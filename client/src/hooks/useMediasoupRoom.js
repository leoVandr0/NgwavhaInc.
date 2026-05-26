// useMediasoupRoom — owns the full mediasoup-client lifecycle for one live room:
// connect signaling -> load Device -> create send/recv transports -> publish
// mic/cam (+ optional screen) -> consume everyone else's streams. Keeps LiveRoom
// presentational. Signaling rides a dedicated Socket.IO connection to the SFU
// (VITE_SFU_URL); media flows directly to the SFU's UDP ports.

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const SFU_URL = import.meta.env.VITE_SFU_URL || 'http://localhost:4000';

// Wrap a callback-style socket emit in a promise and reject on signaling errors.
function request(socket, event, payload = {}) {
    return new Promise((resolve, reject) => {
        socket.emit(event, payload, (response) => {
            if (response && response.error) reject(new Error(response.error));
            else resolve(response);
        });
    });
}

export default function useMediasoupRoom({ meetingId, displayName, role, enabled = true }) {
    const [status, setStatus] = useState('connecting'); // connecting | connected | ended | error
    const [error, setError] = useState(null);
    const [peers, setPeers] = useState([]); // [{ socketId, name, role }]
    const [remoteStreams, setRemoteStreams] = useState([]); // [{ producerId, socketId, name, role, kind, screen, stream }]
    const [localStream, setLocalStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [messages, setMessages] = useState([]); // [{ name, role, text, timestamp, self }]

    const socketRef = useRef(null);
    const deviceRef = useRef(null);
    const sendTransportRef = useRef(null);
    const recvTransportRef = useRef(null);
    const producersRef = useRef({ audio: null, video: null, screen: null });
    const consumersRef = useRef(new Map()); // consumerId -> consumer
    // True once we've moved past `start()` successfully. Used so that a
    // transient `connect_error` after we were already connected doesn't tear
    // down an active session UI — only an initial connect failure is fatal.
    const startedRef = useRef(false);

    // --- Consume a single remote producer --------------------------------------
    // Racey path: a `new-producer` event can fire moments before the user
    // leaves, so this function may await the SFU only to find recvTransport
    // closed on return. We check `closed` after every await and bail out
    // cleanly rather than throwing into the catch.
    const consumeProducer = useCallback(async ({ producerId, socketId, name, role: pRole, kind, appData, paused = false }) => {
        const socket = socketRef.current;
        const recvTransport = recvTransportRef.current;
        const device = deviceRef.current;
        if (!socket || !recvTransport || !device || recvTransport.closed) return;

        try {
            const params = await request(socket, 'consume', {
                transportId: recvTransport.id,
                producerId,
                rtpCapabilities: device.rtpCapabilities
            });
            if (params.error || recvTransport.closed) return;

            const consumer = await recvTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            });
            if (recvTransport.closed) { consumer.close(); return; }
            consumersRef.current.set(consumer.id, consumer);

            await request(socket, 'resume-consumer', { consumerId: consumer.id });

            const stream = new MediaStream([consumer.track]);
            const isScreen = appData?.screen === true;

            setRemoteStreams((prev) => [
                ...prev.filter((s) => s.producerId !== producerId),
                { producerId, consumerId: consumer.id, socketId, name, role: pRole, kind, screen: isScreen, stream, paused }
            ]);
        } catch (e) {
            console.warn('consume failed:', e.message);
        }
    }, []);

    // --- Main lifecycle --------------------------------------------------------
    useEffect(() => {
        if (!enabled || !meetingId) return;
        let cancelled = false;

        const socket = io(`${SFU_URL}/live`, {
            transports: ['websocket', 'polling'],
            reconnection: true
        });
        socketRef.current = socket;

        async function start() {
            try {
                // 1. Join + authenticate (JWT from localStorage; name is a label).
                const token = localStorage.getItem('token');
                const joinRes = await request(socket, 'join-room', { meetingId, token, displayName });
                if (joinRes.error) throw new Error(joinRes.error);
                if (cancelled) return;

                setPeers(joinRes.peers || []);

                // 2. Load the mediasoup Device with the router's capabilities.
                const device = new Device();
                await device.load({ routerRtpCapabilities: joinRes.rtpCapabilities });
                deviceRef.current = device;

                // 3. Create send + recv transports.
                await createSendTransport(socket, device);
                await createRecvTransport(socket, device);
                if (cancelled) return;

                // 4. Publish local mic + camera.
                await publishLocalMedia();
                if (cancelled) return;

                // 5. Consume everyone already publishing.
                for (const p of joinRes.producers || []) {
                    await consumeProducer(p);
                }

                startedRef.current = true;
                setStatus('connected');
            } catch (e) {
                if (cancelled) return;
                console.error('useMediasoupRoom start failed:', e);
                setError(e.message || 'Failed to join the live room');
                setStatus('error');
            }
        }

        // Surface unrecoverable ICE/DTLS failure as a connection error so the
        // UI doesn't sit on a frozen tile. 'failed' is the terminal state for
        // a WebRTC transport — no signaling reconnect will fix it without
        // rebuilding the transport (which we don't try to do here).
        function watchTransportFailure(transport) {
            transport.on('connectionstatechange', (state) => {
                if (cancelled || !startedRef.current) return;
                if (state === 'failed') {
                    setError('Media connection failed. Please check your network and refresh.');
                    setStatus('error');
                }
            });
        }

        async function createSendTransport(socket, device) {
            const params = await request(socket, 'create-transport', { direction: 'send' });
            const transport = device.createSendTransport(params);

            transport.on('connect', ({ dtlsParameters }, cb, errback) => {
                request(socket, 'connect-transport', { transportId: transport.id, dtlsParameters })
                    .then(() => cb())
                    .catch(errback);
            });
            transport.on('produce', ({ kind, rtpParameters, appData }, cb, errback) => {
                request(socket, 'produce', { transportId: transport.id, kind, rtpParameters, appData })
                    .then(({ id }) => cb({ id }))
                    .catch(errback);
            });
            watchTransportFailure(transport);
            sendTransportRef.current = transport;
        }

        async function createRecvTransport(socket, device) {
            const params = await request(socket, 'create-transport', { direction: 'recv' });
            const transport = device.createRecvTransport(params);
            transport.on('connect', ({ dtlsParameters }, cb, errback) => {
                request(socket, 'connect-transport', { transportId: transport.id, dtlsParameters })
                    .then(() => cb())
                    .catch(errback);
            });
            watchTransportFailure(transport);
            recvTransportRef.current = transport;
        }

        async function publishLocalMedia() {
            const sendTransport = sendTransportRef.current;
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } catch (e) {
                // Allow joining without devices (e.g. a viewer with no camera).
                console.warn('getUserMedia failed — joining without local media:', e.message);
                return;
            }
            if (cancelled) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }
            setLocalStream(stream);

            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];
            if (audioTrack) {
                producersRef.current.audio = await sendTransport.produce({
                    track: audioTrack,
                    appData: { source: 'mic' }
                });
            }
            if (videoTrack) {
                producersRef.current.video = await sendTransport.produce({
                    track: videoTrack,
                    appData: { source: 'webcam' }
                });
            }
        }

        // --- Signaling events from other peers ---------------------------------
        socket.on('new-producer', (p) => consumeProducer(p));

        socket.on('peer-joined', (peer) => {
            setPeers((prev) => [...prev.filter((x) => x.socketId !== peer.socketId), peer]);
        });

        socket.on('peer-left', ({ socketId, closedProducerIds = [] }) => {
            setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
            setRemoteStreams((prev) =>
                prev.filter((s) => s.socketId !== socketId && !closedProducerIds.includes(s.producerId))
            );
        });

        socket.on('producer-closed', ({ producerId }) => {
            setRemoteStreams((prev) => prev.filter((s) => s.producerId !== producerId));
        });

        // Remote peer paused/resumed a track (mic mute, camera off). The SFU
        // stops forwarding RTP, so we only need to flip a UI flag — the tile
        // shows a "muted" / "camera off" indicator instead of looking frozen.
        socket.on('producer-paused', ({ producerId }) => {
            setRemoteStreams((prev) =>
                prev.map((s) => (s.producerId === producerId ? { ...s, paused: true } : s))
            );
        });
        socket.on('producer-resumed', ({ producerId }) => {
            setRemoteStreams((prev) =>
                prev.map((s) => (s.producerId === producerId ? { ...s, paused: false } : s))
            );
        });

        socket.on('consumer-closed', ({ consumerId }) => {
            const consumer = consumersRef.current.get(consumerId);
            if (consumer) consumer.close();
            consumersRef.current.delete(consumerId);
            setRemoteStreams((prev) => prev.filter((s) => s.consumerId !== consumerId));
        });

        socket.on('chat-message', (msg) => {
            setMessages((prev) => [...prev, { ...msg, self: msg.socketId === socket.id }]);
        });

        socket.on('session-ended', () => {
            setStatus('ended');
        });

        // connect_error fires for both the initial dial AND any failed
        // reconnect attempt. Only the initial failure is fatal — once we've
        // joined, transient drops are surfaced via the 'disconnect' handler
        // below (which then keeps reconnection off to avoid silent confusion).
        socket.on('connect_error', () => {
            if (cancelled || startedRef.current) return;
            setError('Could not reach the live server. Please try again.');
            setStatus('error');
        });

        // If we lose the socket *after* a successful join, the SFU treats our
        // next socket as a brand-new peer (mediasoup state is per-socket).
        // Honest UX: tell the user to refresh, and stop the client trying to
        // silently reconnect into a session that wouldn't actually be restored.
        socket.on('disconnect', (reason) => {
            if (cancelled || !startedRef.current) return;
            // 'io client disconnect' = we initiated it (cleanup) — ignore.
            if (reason === 'io client disconnect') return;
            socket.io.opts.reconnection = false;
            setError('Connection lost. Refresh the page to rejoin the live room.');
            setStatus('error');
        });

        start();

        // --- Cleanup -----------------------------------------------------------
        // Idempotent: React 18 StrictMode runs effect cleanups twice in dev,
        // so a second call must be a no-op rather than re-closing already-closed
        // resources (which is harmless but noisy in the console).
        let cleanedUp = false;
        return () => {
            if (cleanedUp) return;
            cleanedUp = true;
            cancelled = true;
            if (socket.connected) {
                try { socket.emit('leave-room'); } catch (_) { /* ignore */ }
            }
            consumersRef.current.forEach((c) => c.close());
            consumersRef.current.clear();
            Object.values(producersRef.current).forEach((p) => p && p.close());
            producersRef.current = { audio: null, video: null, screen: null };
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            sendTransportRef.current = null;
            recvTransportRef.current = null;
            deviceRef.current = null;
            startedRef.current = false;
            setLocalStream((s) => {
                s?.getTracks().forEach((t) => t.stop());
                return null;
            });
            setScreenStream((s) => {
                s?.getTracks().forEach((t) => t.stop());
                return null;
            });
            socket.disconnect();
            socketRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingId, enabled]);

    // --- Public controls -------------------------------------------------------
    // Toggle helpers do two things on every flip:
    //   1. local: set track.enabled so the browser stops capturing (mutes mic
    //      indicator, releases the camera-on LED on most OSes).
    //   2. server: pause/resume the matching mediasoup producer so the SFU
    //      stops forwarding the (silent/black) RTP to other peers and they
    //      can show a "muted" indicator instead of a frozen tile.
    const setProducerPaused = useCallback((producer, paused) => {
        const socket = socketRef.current;
        if (!producer || !socket) return;
        // Optimistically update the local mediasoup-client side; the round-trip
        // to the SFU is just so it can broadcast the state to other peers.
        if (paused) producer.pause(); else producer.resume();
        socket.emit(paused ? 'pause-producer' : 'resume-producer', { producerId: producer.id });
    }, []);

    const toggleMic = useCallback(() => {
        const track = localStream?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
        setProducerPaused(producersRef.current.audio, !track.enabled);
    }, [localStream, setProducerPaused]);

    const toggleCam = useCallback(() => {
        const track = localStream?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCamOn(track.enabled);
        setProducerPaused(producersRef.current.video, !track.enabled);
    }, [localStream, setProducerPaused]);

    const startScreenShare = useCallback(async () => {
        const sendTransport = sendTransportRef.current;
        if (!sendTransport || producersRef.current.screen) return;
        let stream;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        } catch (e) {
            return; // user cancelled the picker
        }
        const track = stream.getVideoTracks()[0];
        setScreenStream(stream);
        producersRef.current.screen = await sendTransport.produce({
            track,
            appData: { source: 'screen', screen: true }
        });
        // Stop sharing when the user clicks the browser's native "Stop sharing".
        track.onended = () => stopScreenShare();
    }, []);

    const stopScreenShare = useCallback(() => {
        const producer = producersRef.current.screen;
        if (producer) {
            socketRef.current?.emit('close-producer', { producerId: producer.id });
            producer.close();
            producersRef.current.screen = null;
        }
        setScreenStream((s) => {
            s?.getTracks().forEach((t) => t.stop());
            return null;
        });
    }, []);

    const sendChat = useCallback((text) => {
        if (!text?.trim()) return;
        const socket = socketRef.current;
        if (!socket || !socket.connected) return;
        socket.emit('chat-message', { text: text.trim() });
    }, []);

    const endSession = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) return Promise.resolve();
        return request(socket, 'end-session').catch((e) => {
            console.warn('end-session failed:', e.message);
        });
    }, []);

    return {
        status,
        error,
        peers,
        localStream,
        screenStream,
        remoteStreams,
        messages,
        micOn,
        camOn,
        isScreenSharing: !!screenStream,
        toggleMic,
        toggleCam,
        startScreenShare,
        stopScreenShare,
        sendChat,
        endSession
    };
}
