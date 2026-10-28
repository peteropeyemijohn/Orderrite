# Later

Ideas and features that are **not** in Plan A. When something new comes up during Plan A, it goes here and we keep going.

## Sign-in and account (suggested in Phase 3)
- Google and Apple sign-in
- Sign-in codes by WhatsApp
- Terms of Service and Privacy Policy pages (linked from the login screen)

## Customer experience (suggested in Phase 3)
- Delivery address picker on the home screen ("Delivering to …", change address)
- Replace the app icon and splash screen with the chosen icon (`assets/brand/icon.svg`, tick inside the "o") and wordmark (native change: next planned EAS build)

## Moved out of Plan A
- Push notifications for order updates (Firebase Cloud Messaging)
- Rating of the rider and vendor after delivery
- Reorder from order history

## Technical improvements for later
- Deploy the API on Render with Docker (the image in `apps/api/Dockerfile` already builds and runs in CI). Today Render builds with `scripts/render-build.sh` instead.
- **At the next planned EAS build:** update `expo` and `expo-router` to the latest SDK 57 patch versions (`pnpm exec expo install --fix` in apps/mobile). Held back in Phase 3 because it changes the native fingerprint, so it can't ship as an EAS Update. expo-doctor reports this until then.
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
