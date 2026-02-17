# --------------------------
# Stage 1: Build Client
# --------------------------
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Copy client package.json and package-lock.json for caching
COPY client/package*.json ./

# Install all dependencies (dev + prod) for build
RUN npm ci

# Copy rest of client source
COPY client/ ./

# Build the client
RUN npm run build

# --------------------------
# Stage 2: Build Server
# --------------------------
FROM node:22-alpine AS server-builder
WORKDIR /app/server

# Copy server package.json and package-lock.json for caching
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy server source
COPY server/ ./

# --------------------------
# Stage 3: Production Runner
# --------------------------
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy server build from previous stage
COPY --from=server-builder /app/server /app/server

# Copy built client assets to server public folder
COPY --from=client-builder /app/client/dist /app/server/public

# Set permissions for uploads folder (with error handling)
RUN mkdir -p /app/server/uploads && \
    chown -R nextjs:nodejs /app/server || \
    echo "Permission setup completed with warnings"

# Set environment and user
ENV NODE_ENV=production
USER nextjs

EXPOSE 5001

# Optional: Healthcheck for Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start server
WORKDIR /app/server
CMD ["npm", "start"]
