# Backend Implementation Plan for Eternal E-commerce

Every section of the original plan is now implemented. Markers: **[done]**.

## Stack

Node.js + Express 5, Sequelize 6 on MySQL. JWT auth (access + refresh), `zod`
validation, `helmet` / `compression` / `express-rate-limit`, `nodemailer` for email.
See `README.md` for setup and the full API reference.

## 1. Authentication & Authorization — [done]
* JWT access + refresh (rotated, persisted); RBAC `CUSTOMER` / `STAFF` / `ADMIN`.
* `POST /auth/register` (accepts `referralCode`), `/login`, `/logout`,
  `/refresh-token`, `/forgot-password`, `/reset-password`; `PUT /users/change-password`.
* Password reset e-mails a link (SMTP; console fallback in dev).

## 2. Product Catalog Management — [done]
* Products + variants CRUD (soft delete, `DRAFT`/`PUBLISHED`/`ARCHIVED`), category &
  collection CRUD, inventory + `GET /inventory/low-stock`, search / filter / sort /
  paginate, `avgRating` + `reviewCount` on products, `GET /products/admin/:id`.

## 3. Cart, Checkout, Orders & Payments — [done]
* Cart is client-side (context + localStorage).
* Checkout: transaction with row-locked variants, coupon, shipping + tax from store
  settings, loyalty accrual, referral completion. Stores `subtotalAmount`,
  `taxAmount`, `discountAmount`, `shippingFee`, `totalAmount`.
* **Guest checkout** — `POST /orders/checkout` uses `optionalAuth`: with no token
  the caller supplies `shippingAddress` / `billingAddress` inline plus a
  `guestEmail`; the order stores `guestEmail` and has a null `userId`, the
  addresses are created unowned, and loyalty / referral / notifications are
  skipped. `POST /orders/payments/verify` authorises a guest by `guestEmail`.
  The storefront `CheckoutPage` / `OrderConfirmationPage` drive this end to end
  for a logged-out shopper.
* **Payment providers** (`src/utils/payments.js`):
  * `MOCK` / `CARD` (saved card) — settle instantly.
  * `COD` — payment `PENDING`; settled (and loyalty accrued) when the order is
    marked `DELIVERED`.
  * `ESEWA` / `KHALTI` — checkout returns a signed redirect payload; the client
    sends the user to the gateway; `POST /orders/payments/verify` confirms the
    payment and settles the order. eSewa v2 HMAC signature + Khalti ePayment
    lookup are implemented; without `ESEWA_*` / `KHALTI_*` keys they run in a
    sandbox mode that auto-approves on verify so the flow works locally.
* **Saved payment methods** — `GET/POST /payment-methods`,
  `PUT /payment-methods/:id/default`, `DELETE /payment-methods/:id`. Cards are
  tokenised (only brand + last 4 stored). `checkout` accepts `savedPaymentMethodId`.
* **Refunds** — `POST /orders/admin/:id/refund`: payment → `REFUNDED`, order →
  `CANCELLED`, items restocked, loyalty reversed, customer notified.
* **Order notes** — internal staff notes per order:
  `GET/POST /orders/admin/:id/notes`, `DELETE /orders/admin/:id/notes/:noteId`.
* Order statuses `PENDING → PROCESSING → SHIPPED → DELIVERED` / `CANCELLED`.

## 4. User Accounts & Profiles — [done]
* `GET/PUT /users/me`, address CRUD, `GET /users/admin/customers` (+ `:id`) with
  `orderCount` / `totalSpent`, staff CRUD with last-admin guards.

## 5. Loyalty, Referrals, Marketing & Coupons — [done]
* **Coupons** — `GET /coupons/admin` (+ `:id`), `POST/PUT/DELETE /coupons/admin`,
  `POST /coupons/validate`.
* **Automatic discount rules** — `DiscountRule` model
  (`MIN_SUBTOTAL` / `MIN_ITEMS` trigger → `FREE_SHIPPING` / `PERCENT_OFF` /
  `FIXED_OFF` reward), `GET/POST/PUT/DELETE /coupons/admin/rules`, applied in
  checkout after any coupon with no code needed. Managed from the Coupons admin page.
* **Loyalty** — points accrue on paid orders (`loyalty_points_per_dollar`), a
  `LoyaltyTransaction` ledger records every change, `GET /loyalty/me` returns the
  balance / tier / history. Reversed on refund. **Redemption:** `checkout` accepts
  `redeemPoints` (account only) — capped by balance + payable amount, converted at
  `loyalty_points_redemption_rate`, applied as a discount, debited as a `REDEEMED`
  row and returned on refund. `Order.loyaltyPointsUsed`.
* **Referrals** — every user gets a unique `referralCode`; registering with `?ref=`
  records a pending `Referral`; the referee's first paid order completes it and
  credits both users (`referral_reward_points`). `GET /referrals/me`.
* **Marketing** — `Campaign` (email campaigns that actually send via the mailer),
  `Banner` (storefront banners, `GET /marketing/banners/active` is public),
  `NewsletterSubscriber` (`POST /marketing/newsletter/subscribe` public,
  `GET /marketing/subscribers` admin). Full admin CRUD under `/marketing`.

## 6. Reviews & Wishlist — [done]
* Wishlist CRUD; reviews with a verified-purchase gate; admin moderation notifies
  the customer; `GET /reviews/me`.

## 7. Analytics & Dashboard — [done]
* `GET /analytics/dashboard` — revenue (+ MoM), orders, customers, `avgOrderValue`,
  top products, category revenue, recent orders, `pendingReviews`, `lowStock[]`,
  14-day `sparklines`.
* `GET /analytics/sales?period=N` — dense daily series (revenue / orders /
  new-customers) + KPIs (AOV, units/order, LTV, repeat-purchase %, refund %).

## 8. Static Content & Configuration — [done]
* Settings key/value store (shipping fee, free-shipping threshold, tax rate,
  loyalty rates, `currency`). `currency` drives every price shown in the
  storefront and admin via the frontend `SettingsContext`; the seed default is
  `NPR`. Blog CRUD; Notifications (`Notification` model +
  auto-creation on order events, refunds, loyalty, referrals, review moderation) —
  `GET /notifications`, `PUT /:id/read`, `PUT /read-all`, `DELETE /:id`.
* `StoreLocatorPage` is static frontend content.

## Notes on production-readiness

* Payment gateways run in sandbox mode without `ESEWA_*` / `KHALTI_*` keys; add
  real keys before production.
* Notifications are polled on page load (no websockets).
* Cart is client-side (`CartContext` + `localStorage`) by design — a server-side
  cart was considered and deliberately declined: checkout already re-validates
  stock (row-locked) and prices from the DB, so a stale client cart carries no
  correctness risk, and cross-device sync / abandoned-cart recovery aren't needed
  here. Revisit if a concrete driver appears.
* `npm test` runs 26 read-only vitest/supertest checks against the dev database;
  the `tests/write.test.js` lifecycle block runs only when `TEST_DB_URI` points at
  an isolated schema (`.env.test.example`).
* Every write route is `zod`-validated (`src/validators/`).
* `npm audit` is clean — the `uuid` advisory is pinned out via `package.json`
  `overrides`.
* JWT secrets in `.env` have been rotated; the Aiven DB credentials still need a
  manual rotation via the Aiven console (`.env` was never committed).
