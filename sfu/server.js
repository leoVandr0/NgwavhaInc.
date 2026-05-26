// Ngwavha SFU — self-hosted WebRTC media server (mediasoup) for live lessons.
// Runs on a VPS with a public IP and an open UDP media-port range. The main API
// and frontend stay on Railway; the browser connects here only for live signaling.

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';

import config from './config.js';
import { createWorkers } from './mediasoup/worker.js';
import { registerSignaling, closeRoomFromAdmin } from './socket/signaling.js';

// Admin endpoints (API server -> SFU) are gated by a JWT signed with the same
// JWT_SECRET as user tokens, but with aud='sfu-admin'. This keeps user tokens
// from being replayable here and avoids inventing a second shared secret.
const ADMIN_AUDIENCE = 'sfu-admin';

function requireAdminToken(req, res, next) {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });
    try {
        const decoded = jwt.verify(token, config.jwtSecret, { audience: ADMIN_AUDIENCE });
        req.adminClaims = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid admin token' });
    }
}

async function main() {
    if (!config.jwtSecret) {
        console.warn('⚠️  JWT_SECRET is not set — join-room will reject every client.');
    }

    await createWorkers();

    const app = express();
    app.use(cors({ origin: config.clientUrl, credentials: true }));
    app.use(express.json());

    // Health check for the process manager / load balancer.
    app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sfu' }));

    // Admin: tear down a room when the API marks the LiveSession as ended or
    // deletes it. Returns 200/{closed} so the API can log it but doesn't have
    // to treat "room never existed" as an error.
    app.post('/admin/rooms/:meetingId/close', requireAdminToken, (req, res) => {
        const { meetingId } = req.params;
        // Defence-in-depth: if the caller bound the token to a specific room,
        // make sure the URL matches. Tokens that don't bind a room are accepted
        // (covers blanket admin operations).
        if (req.adminClaims.meetingId && req.adminClaims.meetingId !== meetingId) {
            return res.status(403).json({ error: 'Token meetingId does not match URL' });
        }
        const closed = closeRoomFromAdmin(meetingId);
        res.json({ closed, meetingId });
    });

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: { origin: config.clientUrl, methods: ['GET', 'POST'], credentials: true },
        transports: ['websocket', 'polling']
    });

    registerSignaling(io);

    httpServer.listen(config.port, () => {
        console.log(`🚀 SFU signaling on port ${config.port} (namespace /live)`);
        console.log(
            `   announcedIp: ${config.mediasoup.webRtcTransport.listenIps[0].announcedIp || '(none — localhost only)'}`
        );
    });
}

main().catch((err) => {
    console.error('❌ SFU failed to start:', err);
    process.exit(1);
});
