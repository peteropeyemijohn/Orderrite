# CLAUDE.md

## Project
A multi-category delivery platform for Akure, Nigeria (food, shops, pharmacy, beauty, package delivery), similar to Glovo and Chowdeck. The full product details are in `docs/PRD.md`. **Read it before starting any phase.**

App name: **Orderrite**

Launch city is Akure, Nigeria, but the product will expand to other Nigerian cities and later other countries. See "Built to grow" below.

## Current stage: Plan A (private test version, deployed online as a demo)
- Scope is FOOD only, in Akure only, for now. See section 9 of `docs/PRD.md`. Build the data model for all categories and cities, but only switch on food and Akure.
- The phase list and status live in `docs/PHASES.md`. Work on one phase at a time.
- Paystack runs in **test mode only**. Never use live keys.
- Use a **fixed test OTP** (printed in the server log) instead of a real SMS provider. Keep the SMS code behind an interface so a real provider can be added later.
- The test version is **deployed online** (from Phase 2b), so remote testers and employers can use it without my laptop: API on Render (free tier), web on Vercel, Android test builds through EAS Build. Phase 1 stays local.
- The repo may become **public** (portfolio project). All configuration goes in environment variables. **Before every commit, scan the staged files for keys and secrets** (`pnpm check-secrets`) and stop if anything is found.
- `DEMO_MODE` is ON only in the demo deployment: demo accounts (customer, rider, vendor, admin) with a published fixed login code, plus seeded test vendors and menus. Login is rate limited. **Never enable DEMO_MODE in a real launch.**
- Roles: nobody can choose the ADMIN or VENDOR role themselves. The first admin is created by the seed script from `ADMIN_PHONE`. Vendors are created by the admin.
- No store submission yet. Android test builds only (iOS needs a paid Apple account).
- Do not add features outside the Plan A scope. If I suggest something new, add it to `docs/LATER.md` and keep going.

## How to work with me
- I am new to building apps. Explain what you are doing in simple words.
- Work on **one phase at a time**, and only the phase I ask for.
- **Before writing code, show a short plan** (files you will create or change) and wait for my approval.
- After finishing, tell me in plain language: what was built, how to run it, and how to test it.
- If you need a decision from me, ask one clear question and recommend an option.
- Never invent API keys or secrets. Tell me which accounts or keys I need to create.

## Tech stack (do not substitute without asking)
- Monorepo layout:
  - `/apps/mobile`: customer and rider app (React Native, Expo, Expo Router, TypeScript)
  - `/apps/web`: vendor dashboard and admin panel (Next.js App Router, Tailwind CSS, TypeScript)
  - `/apps/api`: backend (NestJS, TypeScript, REST plus Socket.IO for realtime)
  - `/packages/shared`: shared types and constants
- Database: PostgreSQL with Prisma ORM
- Auth: phone number plus OTP, JWT access and refresh tokens
- Payments: Paystack (initialize, verify, webhooks, refunds)
- Maps and location: Google Maps Platform
- Push notifications: Firebase Cloud Messaging
- Image uploads: Cloudinary
- Package manager: pnpm only (never npm or yarn)
- Hosting (test version): Render free tier (API), Vercel (web), Neon (database, AWS Europe West 2 / London), EAS Build (Android test builds)

## Core rules
- Currency is Naira. Store all money as integers in **kobo**.
- **Never trust the client for prices, totals or fees.** Calculate them on the server.
- Validate all input on the API. Check permissions on every endpoint (customer, rider, vendor and admin each see only what they should).
- Verify the Paystack webhook signature. Make payment handling idempotent (the same webhook must never be processed twice).
- All secrets live in `.env` files. Keep a `.env.example` with fake values. Never commit real keys.
- Order statuses: PENDING_PAYMENT, PLACED, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED, REJECTED.
- Categories: FOOD, SHOPS, PHARMACY, BEAUTY, PACKAGE. Package delivery has no vendor.
- Pharmacy: over-the-counter products only in v1, and only approved pharmacies.

## Built to grow (cities and countries)
- **Never hard-code** "Akure", "Nigeria", "NGN", "₦", "+234" or Naira-specific logic inside screens or business logic. Read them from data.
- The database has `Country` (currency code, dialling code, timezone, language) and `City` (service area, delivery fee rules, commission rates, active flag). Vendors, riders, addresses, orders and fee rules all belong to a city.
- Store money as integer minor units **plus a currency code**. Format amounts through one shared helper.
- Payments go through a `PaymentProvider` interface. Paystack is the only implementation for now. Order logic must not call Paystack directly.
- Put all user-facing text in one translations file (i18n-ready). English only for now.
- Phone login accepts any country's dialling code, with +234 as the default.
- The admin can add or switch on a city without code changes. Seed only Akure as active at launch.
- Delivery fees, commission and service fees are settings per city, not constants in code.

## Design rules
- Style inspired by Glovo: clean, bold, friendly, big category tiles. **Do not copy their logo, exact colours, icons or layout.**
- Define a design system first (colours, fonts, spacing, buttons, cards) in one theme file and reuse it everywhere. Do not hard-code colours or sizes in screens.
- Keep screens simple: one main action per screen, generous spacing, rounded cards (about 16px), soft shadows, large photos.
- Every screen needs a loading state, an empty state and a friendly error state.
- Light mode first.

## Code quality
- TypeScript everywhere, with strict mode on.
- Small, clearly named files and a consistent folder structure. Comment non-obvious logic.
- Add basic tests for order, pricing and payment logic.
- After each phase: run the app, run the tests, and fix errors before telling me it is done.

## Git
- Commit after each completed phase with a clear message.
- Do not commit `.env` files or `node_modules`.

## Commands (update as the project grows)
- Install: `pnpm install` (also builds `packages/shared` and turns on the secret-scan git hook)
- API dev: `pnpm --filter api dev` (http://localhost:4000, health check at `/health`)
- Web dev: `pnpm --filter web dev` (http://localhost:3000)
- Mobile dev: `pnpm --filter mobile start` (scan the QR code with Expo Go)
- Tests: `pnpm test`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`
- Database: `pnpm db:migrate` (create/apply migrations), `pnpm db:seed`, `pnpm --filter api db:studio`
- Secret scan: `pnpm check-secrets` (staged files), `pnpm check-secrets --all` (working tree), `pnpm check-secrets --history` (every commit; must pass before any push)
- Demo database (Neon `demo` branch, via `apps/api/.env.demo`): `pnpm demo:db:reset` / `pnpm demo:db:seed`
- Live IP rate-limit check: `pnpm check-ip https://<api>.onrender.com [--burst]` (needs `IP_DEBUG=true` on Render)
- After changing `packages/shared`, rebuild it: `pnpm build:shared`

## Project notes
- API is NestJS 12 (ESM, Vitest). Prisma 7 with the `pg` driver adapter; the generated client lives in `apps/api/src/generated/prisma` (git-ignored, rebuilt on install).
- Prisma reads `DIRECT_URL` (migrations, seed); the running API uses the pooled `DATABASE_URL`. Both use `sslmode=verify-full`.
- `packages/shared` is compiled to `dist/` (CommonJS) and imported as `shared` by all apps.
- Mobile on a real phone needs `EXPO_PUBLIC_API_URL` set to the Mac's Wi-Fi address, not localhost.
- Prisma migrations get `connect_timeout=30` added in `prisma.config.ts` (the owner's connection to London can be slow).
- Auth (Phase 2): every API endpoint requires sign-in unless marked `@Public()`. Restrict by role with `@Roles('ADMIN')`; read the user with `@CurrentUser()`. Errors use `ApiError` with a stable `code`; apps translate codes via `authErrorMessage` in `packages/shared`.
- Sign-in codes are printed in logs ONLY in development or DEMO_MODE (`otp-provider.factory.ts`). NODE_ENV defaults to production; `pnpm --filter api dev` sets development.
- The demo code (123456) never works for real (non-demo) ADMIN, VENDOR or RIDER accounts.
- Web session: httpOnly cookies set by the Next.js server (server actions); `src/proxy.ts` refreshes tokens before dashboard pages. The browser never sees tokens. Web needs `API_URL` (server-only).
- Mobile session: refresh token in expo-secure-store, access token in memory (`src/auth/AuthProvider.tsx`). Screen groups are guarded by role with `Stack.Protected` in `src/app/_layout.tsx`. Rider code lives in `src/rider` and `src/app/(rider)`.
- Tests use in-memory fakes (`apps/api/src/test-utils/fakes.ts`), not the real database.

## Deployment (Phase 2b)
- Public demo only: API on Render (`render.yaml`, Frankfurt, free), web on Vercel (`apps/web/vercel.json`, root dir `apps/web`, region fra1), Android APK via EAS (`apps/mobile/eas.json`, profile `preview`). All use `DEMO_MODE=true` and the Neon **demo** branch, never the private branch.
- Render: health check `/health/live` (no database), builds with `scripts/render-build.sh`, runs migrations + seed on every deploy. No `ADMIN_PHONE` on Render (no real phone numbers on the demo).
- Build servers fetch pnpm with `npx --yes pnpm@12.11.2` (they don't have pnpm); everything else uses pnpm.
- Visitor IP for rate limiting: `TRUST_PROXY_HOPS` / `CLIENT_IP_HEADER`, verified live with `/health/ip` while `IP_DEBUG=true`. Keep `IP_DEBUG=false` otherwise.
- Free tier sleeps: apps show a "waking up" hint after 5 s and wait up to 70 s.
