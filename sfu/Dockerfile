# mediasoup compiles a native worker binary, so the build stage needs a C/C++
# toolchain + python3. Use the Debian-based node image (not alpine) for fewer
# native-build surprises.
FROM node:22-bookworm-slim

# Build dependencies for mediasoup's native worker.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

# Signaling (TCP). Media uses the UDP range below.
EXPOSE 4000/tcp
# Bounded media port range — keep in sync with RTC_MIN_PORT/RTC_MAX_PORT.
EXPOSE 40000-40100/udp

CMD ["node", "server.js"]
