// SFU configuration — all values come from environment variables.
// The SFU runs on a VPS with a public IP and an open UDP port range (media);
// the API + frontend stay on Railway and connect here only for live signaling.

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    // TCP port that serves HTTP + the Socket.IO signaling endpoint.
    port: parseInt(process.env.SFU_PORT) || 4000,

    // JWT secret — MUST match the main API server's JWT_SECRET so we can verify
    // the same tokens the browser already holds in localStorage.
    jwtSecret: process.env.JWT_SECRET || '',

    // Frontend origin allowed to connect (CORS for signaling).
    // Comma-separated list supported, e.g. "https://app.com,http://localhost:5173".
    clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),

    mediasoup: {
        // Number of mediasoup workers to spawn (≈ one per CPU core for production).
        numWorkers: parseInt(process.env.SFU_NUM_WORKERS) || 1,

        worker: {
            // Bounded UDP/TCP media port range. Open these on the VPS firewall.
            rtcMinPort: parseInt(process.env.RTC_MIN_PORT) || 40000,
            rtcMaxPort: parseInt(process.env.RTC_MAX_PORT) || 40100,
            logLevel: process.env.SFU_LOG_LEVEL || 'warn',
            logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
        },

        // Media codecs offered by every room Router.
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: { 'x-google-start-bitrate': 1000 }
                },
                {
                    kind: 'video',
                    mimeType: 'video/H264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '42e01f',
                        'level-asymmetry-allowed': 1,
                        'x-google-start-bitrate': 1000
                    }
                }
            ]
        },

        // WebRtcTransport listen settings.
        // listenIp:   0.0.0.0 binds all interfaces on the VPS.
        // announcedIp: the PUBLIC IP browsers must reach (set to the VPS public IP
        //              in production; leave empty for localhost testing).
        webRtcTransport: {
            listenIps: [
                {
                    ip: process.env.SFU_LISTEN_IP || '0.0.0.0',
                    announcedIp: process.env.ANNOUNCED_IP || null
                }
            ],
            initialAvailableOutgoingBitrate: 1000000,
            maxIncomingBitrate: 1500000
        }
    }
};

export default config;
