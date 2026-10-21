# Orderrite Plan A: Phases

We work on one phase at a time. Each phase starts with a short plan that the owner approves, and ends with: the app running, tests passing, a secret scan, and a commit.

Status key: ⬜ not started · 🟨 in progress · ✅ done

| # | Phase | Status |
|---|---|---|
| 1 | Project setup and database (local only) | ✅ |
| 2 | Phone login | ✅ |
| 2b | Deploy a test environment | 🟨 |
| 3 | Design system | ⬜ |
| 4 | Admin panel, vendor dashboard and seed data | ⬜ |
| 5 | Customer browsing and cart | ⬜ |
| 6 | Checkout, Paystack test payments and order statuses | ⬜ |
| 7 | Rider flow and live tracking | ⬜ |
| 8 | Testing, polish, demo and portfolio polish | ⬜ |

---

## Phase 1: Project setup and database (local only)
- `.gitignore` first (no `.env` files, no `node_modules`)
- pnpm monorepo: `apps/api` (NestJS), `apps/web` (Next.js + Tailwind), `apps/mobile` (Expo + Expo Router), `packages/shared`. TypeScript strict everywhere.
- Prisma schema for all categories and cities: Country, City, CityFeeSettings, User (with role), Rider, Vendor, MenuItem, Address, Order (vendor optional for package delivery), OrderItem, Payment. Money as integer minor units plus a currency code.
- Seed script: Nigeria, Akure (active, with fee settings), and the first admin from `ADMIN_PHONE`
- `.env.example` files with fake values
- API health check, hello page in web and mobile
- Secret scan script (`pnpm check-secrets`)
- Nothing is deployed in this phase.

## Phase 2: Phone login
- Phone number + OTP login for every role. Any country dialling code, +234 by default.
- Fixed test OTP printed in the server log, behind an `SmsProvider` interface
- JWT access and refresh tokens
- Roles: CUSTOMER by default. Nobody can choose ADMIN or VENDOR. Admin comes from the seed, vendors are created by the admin.
- Login rate limiting (per phone number and per IP address)
- Login screens in mobile and web

## Phase 2b: Deploy a test environment
Goal: the app works without the owner's laptop, for a remote testing partner and for employers.

**Recommended setup**
- **API on Render (free web service).** Render builds from GitHub on every push to `main`. Region: Frankfurt (the closest Render region to the London database). It sleeps after about 15 minutes idle, so the first request can take about a minute. Database migrations run during each deploy.
- **Web on Vercel (free Hobby plan).** It also builds from GitHub. The vendor dashboard and admin panel get a public `*.vercel.app` address.
- **Database: Neon.** One separate Neon branch (a copy of the database) for the demo, so local experiments never break the live demo.
- ⚠️ **The public demo must use its own separate database** (for example a separate Neon branch with its own connection strings). Demo visitors must never touch the owner's private test data, and the private database must never have `DEMO_MODE` data seeded into it. Render's `DATABASE_URL` / `DIRECT_URL` must point at the demo branch only.
- **Mobile: Android APK via EAS Build** (Expo's cloud build service, free plan). The API address for the build is set in `apps/mobile/eas.json`, so the laptop's `apps/mobile/.env` keeps working for local development. We make a "preview" build that points at the Render API. EAS gives a download link and QR code, and testers install the APK directly (they allow "install unknown apps" once). There is no Play Store account and no laptop involved. iOS testers are not possible without a paid Apple account, so iOS is out of scope for Plan A.
- Small changes to screens can later be pushed to installed apps with EAS Update, without a new APK.
- The public Render address is used as the Paystack webhook URL, so no ngrok is needed.

**Deploy guide (step by step)**

*Files:* `render.yaml` (Render Blueprint), `scripts/render-build.sh`, `apps/web/vercel.json`, `apps/mobile/eas.json`, `scripts/demo-db.mjs`, `scripts/check-ip-limit.mjs`.

1. **History scan before the first push:** `pnpm check-secrets --history` must pass. Then `git push -u origin main`.
2. **Demo database branch.** Neon → Branches → New branch `demo` (parent `main`). It starts as a copy of main, so wipe it: put the demo branch's pooled and direct strings in `apps/api/.env.demo` (git-ignored) as `DATABASE_URL` and `DIRECT_URL`, then run `pnpm demo:db:reset` (type `demo` to confirm). The script refuses to run against the private database, forces `DEMO_MODE=true`, and never seeds a real `ADMIN_PHONE`.
3. **Render** → New → Blueprint → the repo. Paste the `sync: false` values. Use **fresh** secrets (`openssl rand -base64 48 | pbcopy`, a new run per secret), and use the same `WEB_PROXY_SECRET` value on Vercel. Set `CORS_ORIGINS=https://example.invalid` until the Vercel address exists. Every deploy runs `prisma migrate deploy` and the seed (both safe to repeat).
   - Check: `https://<api>.onrender.com/health` → `{"status":"ok","database":"ok"}`. Logs show `Sign-in codes: demo`.
4. **Vercel** → Add New → Project → the repo, **Root Directory `apps/web`**. Environment Variables: `API_URL` = the Render address, and `WEB_PROXY_SECRET`. Then set Render's `CORS_ORIGINS` to the exact Vercel address.
   - Check: the login page shows the DEMO banner. Admin demo account + `123456` → "Welcome, Admin".
5. **IP check** (Render has `IP_DEBUG=true` for now): run `pnpm check-ip https://<api>.onrender.com`. *Measured on the first deploy (2026-10-20): X-Forwarded-For arrives as `visitor, Cloudflare 172.x, Render 10.x`, so `TRUST_PROXY_HOPS=3`. A faked X-Forwarded-For entry stays at the start (ignored), a faked True-Client-IP is overwritten by the edge, and a faked CF-Connecting-IP is blocked. Re-run this check if Render's setup ever changes.* *Web logins: confirmed with the `IP check` log line (`source: web server; web server forward: accepted`). That needs the same `WEB_PROXY_SECRET` on Render and Vercel. Vercel hides saved "Sensitive" values (the edit box looks empty), so to change it, paste one fresh value into both places, then redeploy both.* Steps 1–2 must pass. If step 1 shows a Render internal IP, raise `TRUST_PROXY_HOPS` by one and re-check (or use `CLIENT_IP_HEADER` if the output shows a header that the edge sets and that ignores the fake value). Then `pnpm check-ip … --burst` and confirm a phone on mobile data can still request a code. **Afterwards set `IP_DEBUG=false` in `render.yaml` (done 2026-10-20).**
6. **Android build:** put the Render address in `apps/mobile/eas.json` (`EXPO_PUBLIC_API_URL`, not a secret). In `apps/mobile`: `pnpm dlx eas-cli@24.14.0 login`, `pnpm dlx eas-cli@24.14.0 init`, then `pnpm dlx eas-cli@24.14.0 build -p android --profile preview` (let EAS create and keep the signing key). Share the link it prints.
7. **README:** fill in the live links. Secret scan, commit, push.

**Mobile updates without a new build (EAS Update, set up 2026-10-21)**
- Test first in Expo Go against the live demo API: `pnpm --filter mobile start:demo` (iPhone and Android, same Wi-Fi as the Mac).
- Ship a screen or text change to installed APKs: from the repo root, `pnpm --filter mobile update:demo` (channel `preview`). People get it the next time they fully close and reopen the app, sometimes on the second reopen.
- Updates only reach builds with the same native "fingerprint" (`runtimeVersion.policy: fingerprint`). After adding or upgrading a native package (anything installed with `expo install` that has native code), a **new EAS build** is needed. If `update:demo` says no compatible build exists, that's the reason.
- `update:demo` sets the live API address itself, so the laptop's `apps/mobile/.env` never leaks into an update.
- Each preview build gets a higher version code automatically (`autoIncrement`).

**Which Neon string goes where**

| Neon string | Laptop `apps/api/.env` | `apps/api/.env.demo` | Render |
|---|---|---|---|
| main, pooled | `DATABASE_URL` | ✗ | ✗ |
| main, direct | `DIRECT_URL` | ✗ | ✗ |
| demo, pooled | ✗ | `DATABASE_URL` | `DATABASE_URL` |
| demo, direct | ✗ | `DIRECT_URL` | `DIRECT_URL` |

**Demo admin:** Render has **no** `ADMIN_PHONE`, so the public demo has no real phone numbers at all. The seed skips the real-admin step when `DEMO_MODE=true` and `ADMIN_PHONE` is empty. The demo admin (+234 000 000 0004) is the admin on the demo. The owner's real admin exists only on the private branch.

**DEMO_MODE (demo deployment only)**
- `DEMO_MODE=true` only in the Render demo service. It defaults to false.
- Creates demo accounts (customer, rider, vendor, admin) with a published fixed login code, plus seeded test vendors and menus.
- Demo accounts can be reset with `pnpm demo:db:reset` (wipes the demo branch) or refreshed with `pnpm demo:db:seed`.
- Rate limiting stays on, even in demo mode.
- The API refuses to start with `DEMO_MODE=true` together with live Paystack keys.
- **Never enable DEMO_MODE in a real launch.**

**Before deploying: restrict keys and set spending limits**
- **Google Maps:** in Google Cloud Console → APIs & Services → Credentials, create separate keys:
  - Android key: restrict to "Android apps" with the app's package name and SHA-1 fingerprint (EAS shows it), and only the Maps SDK for Android.
  - Web/browser key: restrict to "Websites" with the Vercel domain (and `localhost` for development), and only the Maps JavaScript API.
  - Server key (API distance and geocoding): restrict by API (Distance Matrix / Routes, Geocoding). Render free has no fixed IP, so it relies on the API restriction and quotas. This key lives only in Render's environment variables and never in the app.
  - Set daily **quotas** per API (APIs & Services → each API → Quotas) and a **budget with alerts** (Billing → Budgets & alerts). Note that a budget only sends alerts. It does not stop spending by itself, so quotas are the real cap.
- **Paystack:** test keys only. The secret key lives only on Render. The public key is safe in the apps.
- **Cloudinary:** use signed uploads made through the API (the secret stays on Render). Free plan limits act as the cap.
- **Firebase:** not needed in Plan A (push notifications are in LATER.md).
- **Neon / Render / Vercel:** free plans with no card, or a card with spending limits switched on.
- Anything with `NEXT_PUBLIC_` or `EXPO_PUBLIC_` in its name is visible to everyone, so only restricted public keys may go there.

## Phase 3: Design system
- Show 3 colour options first (not Glovo's yellow or green). The owner picks one.
- One theme file for each app: colours, fonts, spacing, radius (about 16px), shadows, buttons, cards, inputs
- Shared money formatting helper and translations file in use
- Loading, empty and error state components

## Phase 4: Admin panel, vendor dashboard and seed data
- Admin: add, approve and suspend vendors and riders. See orders. Edit city fee settings. Basic totals.
- Vendor dashboard (works on a phone browser): items (name, price, photo, sold out), open/closed toggle
- Cloudinary image uploads
- Seed data: 3 test vendors in Akure with realistic menus

## Phase 5: Customer browsing and cart
- Home with category tiles (only Food switched on), search, nearby vendors
- Vendor page with menu, cart, delivery address (map pin and saved addresses)

## Phase 6: Checkout, Paystack test payments and order statuses
- Server-calculated totals using the city fee settings
- `PaymentProvider` interface with Paystack (test mode): initialize, verify, signed and idempotent webhook, refunds
- Vendor accepts or rejects, preparing, ready. Realtime status updates (Socket.IO).
- Tests for pricing, order and payment logic

## Phase 7: Rider flow and live tracking
- Rider screens in their own folder (`apps/mobile/app/(rider)` + `src/rider`) so they can be split out later
- Rider signup and approval, online/offline, nearest-rider assignment with timeout
- Step-by-step delivery, Google Maps navigation link, live location on the customer's map, earnings

## Phase 8: Testing, polish, demo and portfolio polish
- End-to-end test order on real phones using the deployed version. Work towards 20 clean test orders.
- Bug fixes and polish
- **Portfolio README:** what it is, screenshots, architecture diagram, tech stack, live links (web, API, APK download), demo logins and the fixed code, Paystack test card details, a note that the first load can take about a minute (Render free tier), and how to run it locally
- Final secret scan of the whole repository and its history before making it public
