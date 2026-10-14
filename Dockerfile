# ════════════════════════════════════════════════════════════
# Stage 1: Dependencies
# Install ALL deps including devDependencies needed to build
# ════════════════════════════════════════════════════════════
FROM node:20-slim AS deps

# Install system libraries required by @resvg/resvg-js and sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps needed for prisma generate + tsc)
RUN npm ci

# Generate Prisma client for the target platform
RUN npx prisma generate


# ════════════════════════════════════════════════════════════
# Stage 2: Build
# Compile TypeScript backend + Vite React frontend
# ════════════════════════════════════════════════════════════
FROM deps AS builder

WORKDIR /app

# Copy full source
COPY . .

# Build React frontend with Vite
RUN npx vite build

# Compile TypeScript backend
RUN npx tsc --project tsconfig.json


# ════════════════════════════════════════════════════════════
# Stage 3: Production Runtime
# Lean image — only runtime deps + compiled output
# ════════════════════════════════════════════════════════════
FROM node:20-slim AS runner

# Install runtime system libraries
# - ca-certificates: needed for HTTPS font downloads (Noto fonts CDN)
# - openssl: required by Prisma ORM for encrypted connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user for Cloud Run security best practice
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs appuser

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled backend from builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema + migrations (required for `prisma migrate deploy` at startup)
COPY --from=builder /app/prisma ./prisma

# Copy compiled React frontend static assets
COPY --from=builder /app/dist/client ./dist/client

# Copy package.json (needed by Prisma CLI for engine resolution)
COPY package.json ./

# Create tmp directory for uploads and font cache (owned by appuser)
RUN mkdir -p tmp/uploads tmp/fonts && chown -R appuser:nodejs tmp

# Switch to non-root user
USER appuser

# Cloud Run listens on $PORT (default 8080); our app reads process.env.PORT
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# ─────────────────────────────────────────────────────────────
# CRITICAL: Cloud Run Startup Command
#
# 1. `npx prisma migrate deploy`
#    Applies any pending Prisma migrations to the connected database.
#    This ensures the DB schema is always up to date without manual intervention.
#    Uses DATABASE_URL from Cloud Run environment variables / Secret Manager.
#    Safe to run on every container startup — idempotent by design.
#
# 2. `node dist/server.js`
#    Starts the Express server serving the React SPA + REST API.
#
# The `&&` ensures the app only starts if migrations succeed.
# If DATABASE_URL is not set, the container will fail fast with a clear error.
# ─────────────────────────────────────────────────────────────
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
