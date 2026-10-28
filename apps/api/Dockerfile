# Orderrite API as a container image.
# Build from the REPO ROOT (the API needs packages/shared from the monorepo):
#   docker build -f apps/api/Dockerfile -t orderrite-api .
# Or run everything (API + a local Postgres) with: docker compose up --build
#
# Two stages: "build" has all the tools and source code; "runtime" gets only
# the compiled app and its production packages, so the final image is small
# and holds no compilers, tests or source.

# ---------- Stage 1: build ----------
# Node 24 (matches "engines" in package.json and .nvmrc). Exact version and
# Debian release pinned so every build starts from the same base.
FROM node:24.22.1-trixie-slim AS build

# Prisma's migration engine (used by the "migrate" job in docker-compose.yml)
# needs OpenSSL, which slim images leave out. ca-certificates lets it check
# HTTPS certificates. The running API does not need either (see stage 2).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# The exact pnpm version from package.json ("packageManager").
RUN npm install -g pnpm@12.11.2

# CI=true: pnpm never stops to ask questions during the build.
ENV CI=true
WORKDIR /repo

# Copy only what the install step needs first. Docker caches each step, so
# while these files are unchanged, the slow install is reused on rebuilds.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY apps/api/package.json apps/api/prisma.config.ts apps/api/
COPY apps/api/prisma/ apps/api/prisma/

# Install the API and the shared package only (not web or mobile), exactly
# as locked in pnpm-lock.yaml. This also generates the Prisma client and
# downloads Prisma's migration engine for Linux.
RUN pnpm install --frozen-lockfile --filter "api..."

# Now the API source code, then compile shared and the API to JavaScript.
COPY apps/api/ apps/api/
RUN pnpm --filter shared build && pnpm --filter api build

# Make a self-contained copy of the API in /out with production packages only
# (no TypeScript, test tools or Prisma CLI). The compiled Prisma client is
# already inside dist/, so install scripts are skipped.
RUN pnpm --filter api deploy --prod --ignore-scripts /out

# ---------- Stage 2: runtime ----------
# A fresh, clean base: nothing from stage 1 comes along unless copied below.
FROM node:24.22.1-trixie-slim AS runtime

# Production by default: sign-in codes are never printed in logs.
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

# Only the three things the API needs to run. They stay owned by root, so the
# app (which runs as a normal user) can read its code but never change it.
COPY --from=build /out/package.json ./package.json
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist

# Run as the built-in unprivileged "node" user, not as root.
USER node

# Documents the port the API listens on (docker-compose.yml publishes it).
EXPOSE 4000

# Docker checks every 30 s that the API answers. /health/live does not touch
# the database, so a slow database never makes Docker restart a healthy API.
# Uses Node's own fetch because slim images have no curl.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

# Settings (database URL, secrets) are given when the container starts,
# never baked into the image.
CMD ["node", "dist/main.js"]
