# Later

Ideas and features that are **not** in Plan A. When something new comes up during Plan A, it goes here and we keep going.

## Sign-in and account (suggested in Phase 3)
- Google and Apple sign-in
- Sign-in codes by WhatsApp
- Terms of Service and Privacy Policy pages (linked from the login screen)

## Customer experience (suggested in Phase 3)
- Delivery address picker on the home screen ("Delivering to …", change address)
- After the violet splash, a white loading screen showed while the app started. Fix on branch `smooth-startup` (`src/startup/StartupScreen.tsx`: the splash stays until the first screen is ready, then a violet screen with the waking-up hint; fades into the app). Open until verified on the APK.

## Moved out of Plan A
- Push notifications for order updates (Firebase Cloud Messaging)
- Rating of the rider and vendor after delivery
- Reorder from order history

## Technical improvements for later
- Orbit does not react to Reduce Motion changes while the app is open; only on restart.
- Deploy the API on Render with Docker (the image in `apps/api/Dockerfile` already builds and runs in CI). Today Render builds with `scripts/render-build.sh` instead.
- **Use `expo-blur`** (already installed in the SDK 58 build, not used yet; ships as an EAS Update) for true frosted glass: the photo behind a Glass chip is blurred, not just tinted, so the tint can be lighter and the chips feel deeper. Keep today's no-blur Glass as the fallback on slow Android phones (Android blur is experimental and costs performance) and with Reduce Transparency. Glass gains a `blur` option; no screen changes.
- Shared rate-limit storage (e.g. Redis) when the API runs on more than one server. Per-IP limits are kept in memory today; per-phone limits are already in the database.
- "Log out of all devices" and a list of signed-in devices
- Clean up old sign-in codes and expired refresh tokens on a schedule

## Plan B (public launch in Akure)
- Shops, beauty and package delivery categories (switch on)
- Pharmacy (after the PCN and NAFDAC licensing checks)
- Real Paystack payments (business verification)
- Real SMS OTP provider
- Security review
- Play Store and App Store submission
- iOS test builds (needs an Apple Developer account)

## From the PRD "not in version 1" list
- Vendor self-signup
- Cash on delivery and wallet
- Scheduled orders
- Promo codes and loyalty rewards
- Launching in more cities and countries
- Extra languages and extra payment providers
- Dark mode
- Chat between customer and rider
- Prescription drug orders
