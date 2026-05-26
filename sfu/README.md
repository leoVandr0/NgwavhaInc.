# Ngwavha SFU (mediasoup)

Self-hosted WebRTC media server for live lessons. Replaces the former Daily.co
integration. The browser sends/receives audio, video and screen share through
this server (an SFU — Selective Forwarding Unit), so everyone in a class can be
on camera and it scales far past peer-to-peer mesh.

## Why it runs on a VPS (not Railway)

mediasoup receives media over a **range of raw UDP ports** at a **publicly
reachable IP** — there is no STUN/TURN fallback. Railway's proxy only exposes
HTTP/TCP, so this service must run on a host that gives you UDP + a public IP
(Hetzner, DigitalOcean, AWS EC2, etc.). The main API + frontend stay on Railway
and reach this server only for **signaling** (SDP/ICE over Socket.IO).

```
Railway: frontend + API (Express/Socket.IO) + MySQL/MongoDB
            |  WSS signaling (this server's /live namespace)
            v
VPS (public IP, UDP 40000-40100 open):  mediasoup SFU  <-- media (UDP/SRTP) direct from each browser
```

## Local development (two browsers, one machine)

```bash
cd sfu
cp .env.example .env          # set JWT_SECRET to the SAME value as server/.env
#                               leave ANNOUNCED_IP empty for localhost
npm install
npm run dev
```

Then set the client env (`client/.env`):

```
VITE_SFU_URL=http://localhost:4000
```

Open the app in two browser profiles (instructor + enrolled student), start a
live lesson as the instructor, and join as the student.

### Smoke-test checklist

Once the SFU prints `🚀 SFU signaling on port 4000`, walk through these in
order. Anything that fails points at a real problem before you hit it with
real users.

1. **Health check** — `curl http://localhost:4000/health` returns
   `{"status":"ok","service":"sfu"}`.
2. **Admin auth gate** — `curl -X POST http://localhost:4000/admin/rooms/x/close`
   with no `Authorization` header returns `401 {"error":"Missing bearer token"}`.
   With a token that lacks `aud:"sfu-admin"`, it returns
   `401 {"error":"Invalid admin token"}`.
3. **Two-tab join** — instructor profile starts the lesson, student profile
   joins from the dashboard link. Both see each other's video tiles within a
   few seconds. The participants panel shows two names.
4. **Mic / camera toggle propagates** — student toggles the mic off. On the
   instructor side, the student tile shows a `MicOff Muted` pill in the label
   badge; toggling the camera off swaps the student tile for an avatar
   placeholder + "Camera off". Toggle back on — both indicators disappear.
5. **Screen share** — instructor clicks Share Screen, picks a window. Student
   sees a large screen tile labelled "screen". Stop from the browser's native
   "Stop sharing" button — the tile disappears on the student side.
6. **Chat** — both participants exchange a message; `socketId === socket.id`
   correctly tags only the sender's bubble as "You".
7. **Mid-session disconnect** — temporarily disable the SFU process while the
   lesson is running. Both clients should show
   *"Connection lost. Refresh the page to rejoin the live room."* — they
   should **not** silently auto-reconnect into a broken state.
8. **End session** — instructor clicks "End Session for All". Student is
   auto-navigated out (`status === 'ended'` is observed by `LiveRoom`). Boot
   log on the SFU shows `🔴 Room closed: ngwavha-…`.
9. **Admin teardown** — instructor *deletes* a scheduled session that's
   currently live (or marks status=ended from the API). The SFU should log
   `🔴 Room closed: …` for that meetingId, driven by the API's
   `closeSfuRoom()` HTTP call.

## Production deployment (VPS)

1. Provision a VPS with a public IPv4 (1–2 vCPU is fine for v1).
2. Open the firewall / security group:
   - **TCP** `SFU_PORT` (default 4000) — signaling
   - **UDP** `40000-40100` — media
3. Install Node 22 and build tools:
   ```bash
   sudo apt-get update && sudo apt-get install -y python3 build-essential
   ```
4. Configure and run:
   ```bash
   cd sfu
   cp .env.example .env
   #   JWT_SECRET   = same as the API server
   #   ANNOUNCED_IP = this VPS's public IPv4
   #   CLIENT_URL   = your deployed frontend origin(s)
   npm install --omit=dev
   npm start          # or run under pm2 / systemd
   ```
   Or build the container: `docker build -t ngwavha-sfu . && docker run --env-file .env -p 4000:4000 -p 40000-40100:40000-40100/udp ngwavha-sfu`
5. **TLS:** browsers need a secure context (HTTPS) for `getUserMedia` and a
   secure WebSocket (WSS). Put a reverse proxy (Caddy or nginx) in front of the
   signaling port to terminate TLS, then point the client at the https URL:
   ```
   VITE_SFU_URL=https://sfu.yourdomain.com
   ```

## Environment variables

See `.env.example`. Critical ones: `JWT_SECRET` (must match the API),
`ANNOUNCED_IP` (the VPS public IP), `CLIENT_URL` (allowed frontend origin),
`RTC_MIN_PORT`/`RTC_MAX_PORT` (must match the firewall UDP range).

## Architecture

- `server.js` — boots workers, HTTP health, admin endpoints, Socket.IO `/live`
  namespace.
- `config.js` — env-driven config (ports, codecs, transport, JWT secret).
- `mediasoup/worker.js` — spawns mediasoup workers (one per CPU core).
- `mediasoup/room.js` — one Router per `meetingId`; tracks peers/transports/
  producers/consumers; lazy create, auto-close when empty.
- `socket/signaling.js` — JWT-verified Socket.IO signaling (join, transports,
  produce/consume, chat, end-session, leave).

## Admin endpoints (API → SFU)

The main API calls these when a `LiveSession` is ended or deleted so the
mediasoup room doesn't linger. Auth is a JWT signed with the same `JWT_SECRET`
and `aud: 'sfu-admin'` (short-lived, minted per call):

- `POST /admin/rooms/:meetingId/close` — broadcast `session-ended` to everyone
  in the room and tear down the Router. Returns `{ closed: boolean, meetingId }`.
  Returns `{ closed: false }` if the room never existed (safe to retry).
