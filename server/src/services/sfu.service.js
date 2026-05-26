// SFU admin client — the API calls these helpers to tell the self-hosted
// mediasoup SFU about lifecycle events (e.g. "the instructor ended this
// session, tear down the room"). The SFU sits on a different host (VPS),
// reached over HTTPS; auth is a short-lived JWT signed with the same
// JWT_SECRET, scoped via aud='sfu-admin' so user tokens can't be replayed
// against the admin endpoints.

import axios from 'axios';
import jwt from 'jsonwebtoken';

const SFU_URL = process.env.SFU_URL || '';
const ADMIN_AUDIENCE = 'sfu-admin';
const ADMIN_TOKEN_TTL = '60s'; // short-lived; we mint a new one per call

function signAdminToken(meetingId) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not set — cannot sign SFU admin token');
    }
    return jwt.sign({ meetingId }, process.env.JWT_SECRET, {
        audience: ADMIN_AUDIENCE,
        expiresIn: ADMIN_TOKEN_TTL
    });
}

// Tear down a room on the SFU. Best-effort: DB state is authoritative, so we
// log failures and return rather than throwing. Common no-ops:
//   - SFU_URL not configured (dev without SFU): skip silently
//   - Room never existed or already closed (SFU returns { closed: false }): fine
export async function closeSfuRoom(meetingId) {
    if (!SFU_URL) return { skipped: 'SFU_URL not configured' };
    if (!meetingId) return { skipped: 'no meetingId' };

    try {
        const token = signAdminToken(meetingId);
        const { data } = await axios.post(
            `${SFU_URL.replace(/\/$/, '')}/admin/rooms/${encodeURIComponent(meetingId)}/close`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            }
        );
        return data;
    } catch (e) {
        // Don't surface to the caller — the DB write must still succeed.
        console.warn(
            `[sfu] closeRoom(${meetingId}) failed:`,
            e.response?.data?.error || e.message
        );
        return { error: e.message };
    }
}

export default { closeSfuRoom };
