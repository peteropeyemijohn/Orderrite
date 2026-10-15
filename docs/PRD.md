# Product Requirements Document (PRD)

**App name:** Orderrite
**Version:** 1.0 (MVP)
**Launch city:** Akure, Ondo State, Nigeria
**Long-term vision:** expand to other Nigerian cities, then to other countries
**Current stage:** Plan A, a private test version in 3 to 4 weeks (see section 9). Public launch is decided afterward.

---

## 1. What we are building

Orderrite is an on-demand delivery app, starting in Akure and similar to Glovo and Chowdeck. It is built from day one so that new cities, and later new countries, can be added without rebuilding the app (see section 6). A customer opens one app and can order from restaurants, shops, pharmacies and beauty stores, or send a package to someone. Independent riders pick up and deliver the order.

**Goal:** a customer can order something and get it delivered in under about 45 minutes, with a smooth, simple, premium-feeling experience.

## 2. Who uses it

| User | What they do |
|---|---|
| **Customer** | Browses categories and vendors, orders, pays, tracks the delivery, can send packages |
| **Rider** (independent) | Signs up, gets approved, accepts delivery jobs, shares live location, confirms delivery, sees earnings |
| **Vendor** | At launch the owner adds vendors manually. Vendors manage their menu or products and accept or reject orders |
| **Admin** (the owner) | Adds and approves vendors and riders, sees all orders, sets fees, handles problems |

## 3. Categories (all in version 1)

1. **Food** (restaurants)
2. **Shops** (supermarkets, general stores)
3. **Pharmacy** (see the rules below)
4. **Beauty** (beauty and cosmetics stores)
5. **Package delivery** (send an item from A to B)

**Pharmacy rules (important):** only licensed pharmacies are onboarded. At launch, sell only over-the-counter products and do not support prescription-only drugs. The owner must check the legal requirements (for example PCN and NAFDAC rules) before going live with this category.

**Package delivery in v1:** the customer enters pickup and drop-off addresses, package size, and receiver name and phone. The price is calculated by distance. The flow is simple and has no vendor.

## 4. Core features for version 1

### Customer app
- Sign up and log in with phone number and OTP
- Home screen with large category tiles, a search bar, and nearby vendors
- Vendor page with a menu or product list, photos, prices and opening hours
- Cart, delivery address (map pin and saved addresses), and an order summary showing the delivery fee
- Payment with **Paystack only** (card and bank transfer). No cash on delivery.
- Live order tracking with clear statuses and rider location on a map
- Order history and reorder (reorder is not in Plan A)
- Push notifications for order updates (not in Plan A)
- Rating of the rider and vendor after delivery (not in Plan A)

### Rider app
- Sign up with name, phone, vehicle type and ID photo, then wait for admin approval
- Online and offline toggle
- Receive a delivery request and accept or decline it
- Step-by-step delivery flow: go to the vendor, picked up, on the way, delivered
- Navigation link to Google Maps
- Earnings screen and a simple history

### Vendor dashboard (web, works on a phone browser)
- Log in, add and edit items (name, price, photo, available or sold out)
- See new orders, accept or reject, mark preparing and ready
- Open and closed toggle

### Admin panel (web)
- Add, approve and suspend vendors and riders
- See all orders and their statuses
- Set delivery fee rules and the platform commission
- View basic totals: orders, revenue, active riders

## 5. Business rules

- **Currency:** Naira. Store all amounts as whole numbers in kobo.
- **Prices and totals are always calculated on the server,** never trusted from the app.
- **Delivery fee:** a base fee plus a charge per kilometre. The admin can change the values.
- **Platform earnings:** a percentage commission on each vendor order, plus the delivery fee and a small service fee. The admin sets all of these.
- **Rider pay:** a share of the delivery fee. The exact split is set by the admin.
- **Rider assignment:** when an order is ready, send the request to the nearest online rider. If they do not accept within the time limit, send it to the next one.
- **Order statuses:** PENDING_PAYMENT, PLACED, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERED. Also CANCELLED and REJECTED.
- **Vendor onboarding:** at launch only the admin adds vendors. Self-signup comes in a later version, but build the data model so it is easy to add.
- **Refunds:** if a vendor rejects an order or it is cancelled before pickup, the customer is refunded through Paystack.

## 6. Built to grow: cities and countries

Version 1 launches in **Akure only**, but nothing in the code may assume Akure or Nigeria. The goal is that adding a new city is an admin task, not a coding task.

- **Country** and **City** are real records in the database. Every vendor, rider, customer address, order and fee rule belongs to a city.
- Each **country** stores its own currency code, phone dialling code, timezone and language.
- Each **city** stores its own delivery fee rules, commission rates, service area (map boundary) and open or closed status.
- The admin can add or switch on a new city from the admin panel. At launch only Akure is switched on.
- **Money** is stored as whole minor units (kobo for Naira) together with a currency code, so other currencies can be added later.
- **Payments** go through one "payment provider" interface. Paystack is the only provider in v1, but another provider can be added for other countries without rewriting the order logic. Before launching in a new country, confirm which payment providers support it.
- **Text on screen** is kept in one translations file instead of being typed into each screen, so other languages can be added later.
- **Phone login** must accept any country's dialling code, with +234 as the default for now.
- **Legal and licensing rules** differ by country and by category (especially pharmacy). Each new market needs its own check before launch.

## 7. Design direction

**Inspiration:** Glovo's style, meaning clean, bold and friendly with big tappable category tiles. We take the *feel*, not the look. **Do not copy Glovo's logo, exact colours, icons or layout.** The app needs its own identity.

**Design principles**
- Simple. A new user should order within about 3 taps from the home screen.
- Premium. Generous spacing, one strong accent colour, soft rounded cards, and large, appetizing photos.
- Map-first for tracking. Show the rider moving on a clean map.
- Bright, clean light mode first. Dark mode comes later.

**Starting style (can be changed once we pick the name)**
- One bold accent colour with a neutral white and soft-grey base, plus a dark text colour
- Rounded corners (about 16px on cards), soft shadows
- One friendly modern font family
- Bottom navigation: Home, Orders, Cart, Account
- Smooth loading states, friendly empty states, and clear error messages in plain English

## 8. Not in version 1 (later)

- Vendor self-signup
- Cash on delivery and wallet
- Scheduled orders
- Promo codes and loyalty rewards (a simple promo code may come at the end if time allows)
- Actually launching in more cities and countries (the app is built for it, but v1 switches on Akure only)
- Extra languages and extra payment providers
- Dark mode
- Chat between customer and rider
- Prescription drug orders

## 9. Delivery plan

### Plan A (current): private test version, about 3 to 4 weeks
**Scope:** FOOD category only. Customer app, admin-managed vendors (the vendor dashboard can be basic), a basic rider flow, and the admin panel. The data model still supports all five categories and multiple cities (sections 3 and 6), but only food and Akure are switched on.

**How it runs**
- **Deployed online**, so it does not depend on the owner's laptop. A testing partner in another location can use it, and it is also a public portfolio project with live links that employers can try.
  - API: Render free tier (it sleeps when idle, so the first request can take about a minute)
  - Web (vendor dashboard and admin panel): Vercel
  - Database: Neon (AWS Europe West 2, London)
  - Mobile: Android test builds (APK) made with EAS Build and shared by link. Expo Go during development. Not in the App Store or Play Store.
- **Paystack in test mode only.** Test cards, no real money, no business verification. The public API address receives Paystack webhooks, so no tunnel tool is needed.
- **Fixed test OTP** for login (printed in the server log), so no SMS cost.
- **DEMO_MODE** (demo deployment only): ready-made demo accounts for customer, rider, vendor and admin with a published fixed login code, and seeded test vendors and menus. Login is rate limited. DEMO_MODE must never be on in a real launch.
- All configuration lives in environment variables. No secrets in the repository, because it may become public.
- Free tiers for database, hosting, images and Firebase. Google Maps may need a billing card, so restrict the keys and set budget alerts before deploying.
- No Apple ($99/year) or Google Play ($25 one-time) developer accounts needed yet.

**Phases** (details and status in `docs/PHASES.md`)
1. Project setup and database (local only)
2. Phone login (OTP, JWT, roles)
2b. Deploy a test environment (Render, Vercel, Android test build, DEMO_MODE)
3. Design system
4. Admin panel, vendor dashboard and seed data (3 test vendors with menus)
5. Customer browsing and cart
6. Checkout, Paystack test payments and order statuses
7. Rider flow and live tracking
8. Testing, polish, demo, and portfolio polish (README, screenshots, architecture diagram, demo logins, live links)

**Rough schedule**
1. Week 1: Phases 1, 2, 2b and 3
2. Week 2: Phase 4
3. Week 3: Phases 5 and 6
4. Week 4: Phases 7 and 8. **First full demo.**

**Starting fee settings for Akure** (stored per city, editable in the admin panel): base delivery fee ₦500, ₦100 per km, vendor commission 15%, service fee ₦100, rider gets 80% of the delivery fee.

**Not in Plan A:** push notifications, ratings and reorder (see `docs/LATER.md`).

**Plan A is done when** one test order goes through the entire flow on real phones, using the deployed version: order, test payment, vendor accepts, rider delivers, delivered.

### Plan B (later): public launch in Akure, about 8 to 10 weeks in total
Adds shops, beauty and package delivery, real Paystack payments (business verification), real SMS OTP, a pilot with real vendors and riders, a security review, and store submission. Pharmacy is added last, after the licensing checks. Decide on Plan B once Plan A works.

## 10. Success measures

**Plan A**
- One complete test order works end to end on real phones
- 3 or more test vendors with real-looking menus, and 2 or more test riders
- 20 test orders completed with no payment or status errors in Paystack test mode

**Plan B (later)**
- At least 5 real vendors and 5 real riders onboarded in Akure
- Real payments verified and refunds tested
- The app is approved in the Google Play Store (and the App Store)

## 11. Risks to watch

- **Scope creep:** during Plan A, do not add features outside the list above. New ideas go on a "later" list.
- **If time runs short in Plan A**, the priority order is: customer ordering and payment, then vendor flow, then rider flow.
- **Payments:** webhook verification and refunds must be tested carefully in Paystack test mode before any real money is used.
- **Plan B account delays:** Paystack live verification, Apple enrolment and review, and Google Play testing requirements can take days or weeks. Start them early in Plan B, and check each provider's current rules.
- **Akure map accuracy:** addresses can be inconsistent, so use a map pin as well as a typed address.
