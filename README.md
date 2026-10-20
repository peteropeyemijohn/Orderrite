# Orderrite

Orderrite is a multi-category delivery app (food, shops, pharmacy, beauty and package delivery), starting in Akure, Nigeria, in the style of Glovo and Chowdeck. Customers order and track deliveries in a mobile app, independent riders deliver, vendors manage orders in a web dashboard, and an admin runs the platform.

It is built to grow: countries, cities, currencies and fees are data, not code.

> **Status:** private test version (Plan A). Food in Akure only. Payments run in Paystack **test mode**, so no real money is involved.

## Try the live demo

| | Link |
|---|---|
| Web dashboard (admin / vendor) | https://orderrite-apps.vercel.app |
| Android app (APK) | _coming soon_ |
| API health check | https://orderrite-api.onrender.com/health |

⏳ **The first load can take about a minute.** The demo runs on free hosting that sleeps when nobody is using it. After it wakes up, it is fast.

### Demo logins

Everything on the demo uses the sign-in code **`123456`**.

| Role | Phone number | Where |
|---|---|---|
| Customer | `+234 000 000 0001` | Android app |
| Rider | `+234 000 000 0002` | Android app |
| Vendor | `+234 000 000 0003` | Web dashboard |
| Admin | `+234 000 000 0004` | Web dashboard |

The app and the dashboard show one-tap buttons for these accounts. You can also sign in with any new phone number using `123456`. New numbers become customer accounts. The demo uses its own database and contains no real people's data.

Installing the Android app: open the APK link on an Android phone, download it, and allow "install unknown apps" when asked.

## Tech stack

- **Mobile (customer + rider):** React Native, Expo, Expo Router, TypeScript
- **Web (vendor dashboard + admin panel):** Next.js (App Router), Tailwind CSS
- **API:** NestJS (REST), Prisma, PostgreSQL (Neon)
- **Auth:** phone number + one-time code, short-lived JWT access tokens and rotating refresh tokens
- **Hosting (demo):** Render (API), Vercel (web), Neon (database), EAS Build (Android)
- **Monorepo:** pnpm workspaces (`apps/api`, `apps/web`, `apps/mobile`, `packages/shared`)

## Run it locally

You need Node.js 24, pnpm, a free [Neon](https://neon.tech) PostgreSQL database and, for the phone app, [Expo Go](https://expo.dev/go).

```bash
pnpm install

# 1. Settings: copy the examples and fill in your own values (never commit them)
cp apps/api/.env.example apps/api/.env          # database strings, secrets, ADMIN_PHONE
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env    # your computer's Wi-Fi address

# 2. Database
pnpm db:migrate
pnpm db:seed

# 3. Run (one terminal each)
pnpm --filter api dev       # http://localhost:4000/health
pnpm --filter web dev       # http://localhost:3000
pnpm --filter mobile start  # scan the QR code with Expo Go
```

Locally, sign-in codes are printed in the API terminal. Nothing is sent by SMS.

```bash
pnpm test            # all tests
pnpm typecheck
pnpm lint
pnpm check-secrets   # scan for keys before committing (runs automatically on commit)
```

## Security notes

- No keys or secrets are stored in this repository. All settings come from environment variables, and every commit is scanned automatically.
- Prices and totals are calculated on the server. Every API endpoint checks who is signed in and their role.
- Sign-in codes and refresh tokens are stored only as hashes. Login is rate limited per phone number and per IP address.
