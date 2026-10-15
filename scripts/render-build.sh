#!/usr/bin/env bash
# Build steps for the API on Render (see render.yaml).
set -euo pipefail

# Render's machines don't have pnpm, so fetch the exact version this project uses.
PNPM="npx --yes pnpm@12.11.2"

# Install only the API and the shared package (not the web or mobile apps).
# NODE_ENV=development here so build tools (Nest CLI, TypeScript, tsx) are installed.
NODE_ENV=development $PNPM install --frozen-lockfile --filter "api..."

$PNPM --filter shared build
$PNPM --filter api build

# Bring the demo database up to date, then (re)create the demo data.
# Both steps are safe to repeat on every deploy.
$PNPM --filter api db:deploy
$PNPM --filter api db:seed
