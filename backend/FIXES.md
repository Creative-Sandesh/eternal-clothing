# Eternal — System Fix List

A consolidated to-do list of everything broken, missing, or incomplete across the
project, based on a full read of the codebase and running the backend + frontend
together.

Status legend:

- ✅ **Done** — already fixed in the current working tree
- 🔴 **Blocker** — crashes a page or makes a core flow fail
- 🟠 **Broken contract** — request/response shape mismatch; feature silently fails
- 🟡 **Missing** — endpoint / field / wiring does not exist yet
- ⚪ **Cosmetic** — dead button or mock data, no error

---

## BACKEND

### ✅ Already fixed

| Area | What was wrong | Fix applied |
|------|----------------|-------------|
| `controllers/analytics.controller.js` | `GET /analytics/dashboard` threw `ProductVariant is not defined`; used Postgres-style quoting on MySQL; referenced non-existent `products.price`; wrong association alias (`payment` vs `payments`). Whole admin dashboard 500'd. | `topProducts` and `categoryRevenue` rewritten as raw SQL returning real product names/slugs and per-category revenue. Unused imports removed. |
| `app.js` | `cors({ origin: "*", credentials: true })` is rejected by browsers for credentialed requests. | Origin now reflected from a `CROSS_ORIGIN` allowlist (comma-separated, or `*`). |
| `app.js` | No health route, no 404 handler — unknown routes returned Express HTML, breaking the SPA's JSON parser. | Added `GET /health` (+ `/`, `/api/v1/health`) and a JSON 404 handler that uses `ApiError`. |
| `db/index.js` + `index.js` | `ConnectDB()` swallowed connection errors, so the server booted even with no database. | `ConnectDB()` now rethrows; `index.js` `process.exit(1)` on failure. |
| `models/collection.model.js` | Stray `import { Col } from "sequelize/lib/utils"`. | Removed. |
| `.env.example` | Listed stale keys (`MONGODB_URI`, `DB_HOST`, …) the code never reads. | Rewritten to the real keys (`DB_URI`, token secrets, `CROSS_ORIGIN`, `NODE_ENV`). |
| `src/makeAdmin.js` | No way to promote a user to admin/staff. | Added `node src/makeAdmin.js <email> [ADMIN|STAFF]`. |
| `controllers/coupon.controller.js` + `routes/coupon.routes.js` | No way to list coupons — `CouponsPage` showed 6 fakes. | Added `GET /coupons/admin` (with derived `status`) and `GET /coupons/admin/:id`. |
| `controllers/coupon.controller.js` | `discountType` enum mismatch (`FIXED` vs `FIXED_AMOUNT`); required `validFrom`; `maxUses`/`usageLimit` naming. | `create`/`update` now normalize `FIXED`→`FIXED_AMOUNT`, default `validFrom` to now, accept `maxUses` alias. |
| `controllers/user.controller.js` + `routes/user.routes.js` | No staff/admin user management. | Added `GET/POST /users/admin/users` and `PUT/DELETE /users/admin/users/:id` with last-admin guards. |
| `controllers/user.controller.js` | Customer payloads lacked `orderCount` / `totalSpent`. | Both now attached (from PROCESSING/SHIPPED/DELIVERED orders); sensitive fields excluded. |
| `controllers/order.controller.js` + `routes/order.routes.js` | No single-order endpoint; list responses lacked product/address includes. | Added `GET /orders/admin/:id`; shared `orderInclude` (items→variant→product, payments, coupon, shipping/billing address) applied to every order response. |
| `controllers/order.controller.js` | Checkout had no row locking → oversell risk. | Variant rows now `lock: t.LOCK.UPDATE` inside the checkout transaction. |
| `controllers/order.controller.js` | `updateOrderStatus` rejected lowercase status. | Status is upper-cased before validation. |
| `controllers/review.controller.js` + `routes/review.routes.js` | No "my reviews" endpoint. | Added `GET /reviews/me` (all statuses, product included). |
| `controllers/product.controller.js` | No rating aggregation; `updateProduct` ignored `variants`. | `GET /products` & `/products/:slug` now return `avgRating` + `reviewCount` (APPROVED only). `updateProduct` upserts/deletes variants in a transaction (`variants[]`, `deleteVariantIds[]`). |
| `controllers/category.controller.js` / `collection.controller.js` | List responses lacked `productCount`. | Both now include a live per-row `productCount`. |
| `models/users.model.js` + `controllers/auth.controller.js` + `routes/auth.routes.js` | No refresh rotation, no password reset. | Added `refreshToken` / `resetPasswordToken` / `resetPasswordExpires` columns; `POST /auth/refresh-token`, `POST /auth/forgot-password`, `POST /auth/reset-password`. Logout clears the stored refresh token. |
| `middlewares/auth.middleware.js` | `req.user` still carried token/reset columns. | Excluded from the lookup. |
| `controllers/product.controller.js` + `routes/product.routes.js` | No way for admin to load a single product — the edit page scanned the paginated public list (missed product #11+) and `getProductBySlug` filters `status: PUBLISHED` so drafts were uneditable. | Added `GET /products/admin/:id` — `findByPk`, `paranoid: false`, any status, includes category/collection/variants. Admin routes moved above `/:slug`. |
| `utils/mailer.js` (new) + `controllers/auth.controller.js` | Password reset had no mailer — token was returned in the response body. | Added a `nodemailer` mailer (SMTP via `SMTP_*` env, console fallback when unconfigured). `forgot-password` now emails a `${APP_URL}/reset-password?token=…` link and only returns the raw token when it could **not** send it *and* not in production. |
| `models/order.model.js` | `updatedAt: false`; no stored subtotal/tax. | Enabled `updatedAt`; added `subtotalAmount` + `taxAmount` columns. |
| `controllers/order.controller.js` | Checkout hardcoded `$10` / `$100` shipping and 0 tax. | Reads `shipping_fee_standard`, `free_shipping_threshold`, `tax_rate_percent` from the `settings` table; stores `subtotalAmount`, `taxAmount`; `total = subtotal − discount + shipping + tax`. |
| `src/app.js` | No security headers, compression, or rate limiting. | Added `helmet()`, `compression()`, a global `/api` limiter (600 / 15 min, env `RATE_LIMIT_MAX`) and a stricter `/api/v1/auth` limiter (20 / 15 min, `skipSuccessfulRequests`, env `AUTH_RATE_LIMIT_MAX`); `trust proxy` set. |
| `middlewares/validate.middleware.js` + `validators/*` (new) | Ad-hoc, inconsistent body validation. | Added a `zod` `validateBody(schema)` middleware returning `400` with a per-field `errors` array. Applied to all `/auth` routes, `POST /orders/checkout`, and `PUT /orders/admin/:id/status`. |
| `src/migrate.js` (new) + `package.json` | `sync({alter:true})` can't add a `NOT NULL` column to a populated table. | Idempotent raw-SQL migration for the new `orders` columns; `npm run migrate` / `sync` / `seed` scripts added. |
| `.env.example` | — | Documented `SMTP_*`, `MAIL_FROM`, `APP_URL`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`. |
| `controllers/analytics.controller.js` + `controllers/inventory.controller.js` | Dashboards had nothing real to bind sparklines / KPIs / low-stock to. | `GET /analytics/dashboard` now returns `avgOrderValue`, `lowStock[]` and a 14-day `sparklines` bundle. `GET /analytics/sales` returns **dense** daily series (one point per day, gaps zero-filled) for revenue / orders / new-customers, plus a `kpis` block (AOV, units/order, LTV, repeat-purchase %, refund %). New `GET /inventory/low-stock?threshold=&limit=` (admin). |
| `models/loyaltyTransaction.model.js` + `models/notification.model.js` (new) + relations + `controllers/loyalty.controller.js` + `controllers/notification.controller.js` + `utils/notify.js` | Loyalty / notifications were in `plan.md` but unbuilt. | Loyalty accrual on checkout + ledger + `GET /loyalty/me`; notification model + `notify()` helper wired into checkout, order-status, refund, and review moderation; `GET /notifications` (+ read / read-all / delete). |
| `controllers/order.controller.js` | No refund path; "Issue Refund" button was dead. | `POST /orders/admin/:id/refund` — refund payment, cancel order, restock items, reverse loyalty, notify customer; guards against double-refund and orders with no completed payment. |
| `controllers/review.controller.js` | `createReview`'s verified-purchase check threw `Unknown column 'items.product_variant_id' in 'on clause'` (Sequelize nested-subquery bug) — **posting any review 500'd**. | Rewritten to query from `OrderItem` with `Order` + `ProductVariant` joins. |
| **Marketing** — `models/{campaign,banner,newsletterSubscriber}.model.js` + `controllers/marketing.controller.js` + `routes/marketing.routes.js` | Not built. | Campaign CRUD + `POST /marketing/campaigns/:id/send` (emails via the mailer), Banner CRUD + public `GET /marketing/banners/active`, subscriber list + public `POST /marketing/newsletter/subscribe` / `unsubscribe`. |
| **Referrals** — `models/referral.model.js` + `utils/referral.js` + `controllers/referral.controller.js` + `auth.controller.js` | Not built. | Unique `referralCode` on every user; `register` accepts `referralCode` and records a pending `Referral`; `completeReferralIfPending()` fires on the referee's first paid order and credits both users. `GET /referrals/me`. |
| **Payments** — `utils/payments.js` (new) + `models/paymentMethod.model.js` + `controllers/paymentMethod.controller.js` + `order.controller.js` | Checkout wrote a single hardcoded `COMPLETED` mock payment. | Provider abstraction: `MOCK`/`CARD` instant, `COD` settled on delivery, `ESEWA`/`KHALTI` redirect + `POST /orders/payments/verify` (eSewa v2 HMAC signature, Khalti lookup, sandbox fallback). `Payment` gained a `provider` column and nullable `transactionId`. Saved payment methods (`/payment-methods`) — tokenised, brand + last4 only. `checkout` accepts `provider` / `savedPaymentMethodId`. `settleOrderPayment()` centralises "order paid → PROCESSING + loyalty + referral". |
| `models/payment.model.js` | `transactionId` was `NOT NULL`. | Nullable (redirect payments have no ref until verified); added `provider`. |
| `models/users.model.js` | — | Added `referralCode` (unique) + `referredBy`. |
| `utils/referral.js` / COD settlement | Notifications inside a write transaction deadlocked against the row locks (`User.increment` lock ↔ `notifications` FK insert). | Notifications created inside referral completion now pass `{ transaction }`; the COD-delivery notify moved outside its transaction. |
| **Cleanups pass** — `OrderNote`, `DiscountRule` models; `middlewares/upload.middleware.js` (multer); `validators/catalog.validators.js`; `vitest` + `tests/` | Route guards, currency, image upload, order notes, auto-rules, tests were all outstanding. | See the "Small cleanups — DONE" table at the end of this file. `Category` gained `sortOrder`; `Payment.transactionId` nullable + `provider`; `Address.state` now nullable (many countries have none); `.env` JWT secrets rotated. |

### 🟢 Guest checkout — DONE (backend + frontend)

1. **`POST /orders/checkout` and `POST /orders/payments/verify`** use `optionalAuth`
   instead of `verifyJWT`. A guest sends `shippingAddress` / `billingAddress` inline
   plus `guestEmail`; the order is created with `userId = null` and `guestEmail`
   set, the addresses are stored unowned (`addresses.user_id` relaxed to nullable),
   and loyalty / referral / notifications are skipped. Payment verification
   authorises a guest by matching `guestEmail`. Migration: `orders.guest_email`
   added, `addresses.user_id` made nullable (`src/migrate.js`). Smoke tests added.
2. **Frontend:** `CheckoutPage` builds the inline-address + `guestEmail` payload
   when nobody is logged in (with per-step validation), shows a "checking out as a
   guest" note and a "sign in for saved addresses / loyalty" prompt that returns to
   `/checkout`. `OrderConfirmationPage` takes the order object straight from
   checkout navigation state (no auth-only re-fetch), passes `guestEmail` to the
   redirect-payment verify call (stashed in `sessionStorage` across a real gateway
   redirect), and swaps "View My Orders" for "Create an account" for guests.

### 🟠 Logic / correctness

2. **`collection.controller.js` `deleteCollection` dead block — FIXED.** The empty
   `if (productCount > 0)` block was removed. A collection is an optional curatorial
   grouping (nullable FK, `onDelete: "SET NULL"`), unlike a required Category
   (`RESTRICT`, blocks deletion), so deleting one now simply un-groups its products.
   The response carries `{ unlinkedProducts }` and the message states how many were
   removed.

3. **`getProductBySlug` id detection — FIXED (was worse than "low priority").**
   Product ids are UUIDs, so the old `!isNaN(slug)` numeric check never matched an
   id — and since `ProductCard` links to `/product/<uuid>`, `GET /products/<uuid>`
   was returning **404 for every product-detail click**. It now tests for a UUID
   shape: a UUID is looked up by `id`, anything else (including a numeric slug) by
   `slug`. Covered by a smoke test.

4. **Route ordering — already fixed.** `category.routes.js` and
   `collection.routes.js` both declare `/admin` and `/admin/:id` before `/:slug`
   (this item was stale — see the "Small cleanups — DONE" table).

### 🟡 Hardening / infra

5. **Tests — isolated-DB support added; write suite is opt-in.** `npm test` runs a
   vitest/supertest suite: 25 read-only checks against `DB_URI` plus a
   `tests/write.test.js` lifecycle block that stays **skipped** unless `TEST_DB_URI`
   is set. `src/db/index.js` uses `TEST_DB_URI` in any test context (Vitest, or
   `NODE_ENV=test` for the sync/migrate/seed scripts); `vitest.config.js` loads
   `.env.test` ahead of `.env`. See `.env.test.example` — create a second schema
   (`CREATE DATABASE eternal_test;`), point `TEST_DB_URI` at it, seed it once, and
   the write tests run. *Still to do: expand write-path coverage (checkout, refund,
   admin CRUD) now that the harness exists.*

6. **Secrets — verified clean; Aiven rotation is a manual step.** Confirmed `.env`
   was never committed (28 commits scanned; only `.env.example` with placeholder
   `mysql://user:password@host` is tracked). JWT secrets were rotated. To rotate the
   Aiven MySQL password: Aiven Console → the MySQL service → **Users** tab → reset
   the `avnadmin` password (or create a new user and drop the old one) → update
   `DB_URI` in `.env` → restart the app. `git.aivencloud` connection strings expire
   with the password, so nothing else needs revoking.

7. **`uuid` advisory — FIXED.** `package.json` `overrides` pins `uuid@^11.1.1` for
   the `sequelize@6` subtree. Sequelize only calls `uuid` `v1()` / `v4()` with no
   arguments (the flaw is in v3/v5/v6 with a caller-supplied buffer), and v4 UUID
   generation was verified after the bump. `npm audit` → **0 vulnerabilities**.

8. **Validation coverage — DONE.** `zod` `validateBody` now guards every write
   route that had a hand-rolled check: blog create/update, category & collection
   update, coupon update, discount-rule create/update, inventory update, review
   status, settings upsert, profile update, change-password, staff create/update,
   wishlist add, address update, saved-payment-method add, newsletter
   subscribe/unsubscribe, campaign & banner create/update. New validator files:
   `content.validators.js`, `user.validators.js` (+ additions to
   `catalog.validators.js`). Smoke tests added.

### `plan.md` extras — all implemented

| Feature | Status |
|---------|--------|
| **Loyalty points** | Implemented. `LoyaltyTransaction` ledger; accrue on paid orders, reverse on refund; `GET /loyalty/me`; `LoyaltyPage` wired. |
| **Notifications** | Implemented. `Notification` + `utils/notify.js`; auto-created on order placed / shipped / delivered / cancelled / refunded, loyalty earned, referral completed, review moderated. `GET /notifications` (+ read / read-all / delete); `NotificationsPage` wired. |
| **Refunds** | Implemented. `POST /orders/admin/:id/refund` — refund payment, cancel order, restock, reverse loyalty, notify. "Issue Refund" button wired. |
| **Marketing** | Implemented. `Campaign` (emails send via the mailer), `Banner` (public `GET /marketing/banners/active`), `NewsletterSubscriber`. Admin CRUD under `/marketing`; `MarketingPage` rebuilt + wired; checkout / register newsletter opt-in wired. |
| **Referral programme** | Implemented. Unique `referralCode` per user; `?ref=` on register records a pending `Referral`; the referee's first paid order completes it and credits both users. `GET /referrals/me`; `ReferralPage` rebuilt + wired; `RegisterPage` reads `?ref=`. |
| **Saved payment methods** | Implemented. Tokenised (brand + last4 only). `GET/POST /payment-methods`, set-default, delete. `PaymentMethodsPage` rebuilt + wired; checkout accepts `savedPaymentMethodId`. |
| **Real payments** | Implemented. Provider abstraction (`src/utils/payments.js`): `MOCK`/`CARD` instant, `COD` settled on delivery, `ESEWA`/`KHALTI` redirect + `POST /orders/payments/verify` (eSewa v2 HMAC signature + Khalti lookup; sandbox auto-approve without keys). `CheckoutPage` has a provider selector; `OrderConfirmationPage` runs the verify callback. |
| **Server-persisted cart** (`/api/cart`) | **Deliberately not built** (reviewed and declined). Client-side `CartContext` + `localStorage` stays. Checkout re-validates stock (row-locked) and prices server-side, so a stale client cart is not a correctness risk; cross-device sync and abandoned-cart recovery aren't required. Revisit only with a concrete driver. |

---

## FRONTEND

### ✅ Already fixed

| File | What was wrong | Fix applied |
|------|----------------|-------------|
| `pages/admin/ProductsListPage.jsx` | Unclosed `useEffect` → **entire Vite build failed** | Closed the effect, wired `fetchProducts()`, read `res.data.products` |
| `pages/admin/InventoryPage.jsx` | `restocked` / `setRestocked` used in render but never declared → `ReferenceError`, page white-screens | Added the state; "Restock" buttons now call `inventoryApi.updateVariant` (previously a no-op) |
| `pages/admin/AddEditProductPage.jsx` | `existing` referenced 5× but never declared → `ReferenceError` on New **and** Edit | Replaced with a live preview from `form` state |
| `pages/admin/AddEditProductPage.jsx` | Sent `categoryId: Number(uuid)` → `NaN`; omitted required `skuPrefix`, plus `status`/`originalPrice` → every save rejected | Passes UUID strings through, builds size×color variants, maps `status`, sends `skuPrefix` |
| `pages/admin/AnalyticsDashboard.jsx` | `product.revenue.toLocaleString()` on `undefined` → `TypeError` once any order exists; read `categoryBreakdown`/`traffic` which the API never returns | Maps real backend fields (`categoryRevenue`, `topProducts`), defaults missing values, builds the category pie |
| `pages/admin/AdminDashboard.jsx` | Top-products list showed `"Variant ID: undefined"` | Uses real product `name` from the fixed analytics endpoint |
| `pages/admin/CustomersListPage.jsx` | "View" (eye) button had no handler | Now a `<Link>` to `/admin/customers/:id` |
| `pages/admin/ReviewsPage.jsx` | "Flag" sent `status: "REPORTED"` → backend 400 | Local-only flag until a backend field exists |
| `pages/customer/LoginPage.jsx` | Read stale `isAdmin` from context immediately after `login()` → admins landed on `/account` | Reads role from the login response, routes admin/staff to `/admin` |
| `services/api.js` | Hardcoded `/api/v1` | Honors `VITE_API_URL`, falls back to the dev proxy |
| `.env.example` | Did not exist | Added, documents `VITE_API_URL` |
| `services/api.js` | No wrappers for the new endpoints; no token refresh | Added `authApi.refresh/forgotPassword/resetPassword`, `userApi.getStaff/createStaff/updateStaff/deleteStaff`, `orderApi.getAdminOrderById`, `couponApi.getAll/getById`, `reviewApi.getMine`. `request()` now does one transparent `/auth/refresh-token` retry on a 401. |
| **F-7 / F-8 `pages/admin/CouponsPage.jsx`** | Rendered 6 fake coupons; create payload was wrong; Edit button dead; "Automatic Discount Rules" was a hardcoded reference table | Rewritten: loads `couponApi.getAll()`, correct payload (`PERCENTAGE`/`FIXED_AMOUNT`, `usageLimit`, ISO `validFrom`/`validUntil`), Edit + Delete wired, stats derived from real data. "Automatic Discount Rules" is now real CRUD against `couponApi.getRules/createRule/updateRule/deleteRule` (`DiscountRule` model, applied in checkout) with an inline add/edit form. |
| **F-9 `pages/admin/UsersPage.jsx`** | "Staff" tab listed customers; invite/edit/delete all dead | Rewritten: `userApi.getStaff()`, create form (`firstName/lastName/email/password/role`), edit (name + role), delete — with "(you)" guard on your own row. Roles + Permissions tabs kept as clearly-labelled reference (backend has no custom-role model). |
| **F-10 `pages/admin/OrderDetailAdminPage.jsx`** | Fetched the whole list and `.find()`d; item/address/total fields all wrong | Uses `orderApi.getAdminOrderById(id)`; items mapped from `productVariant.product`; subtotal computed from lines; discount + coupon code + payment row shown; **"Mark Shipped"** and **tracking Save** call `updateStatus`; billing address now its own data; dead "Note" box removed; Print wired to `window.print()`. |
| **F-11 `pages/admin/CustomerDetailPage.jsx`** | Wrong field names; hardcoded address; `mockReviews` | Reads `phoneNumber` + `loyaltyPointsBalance`; addresses derived from the customer's orders; tier derived from points; `mockReviews` removed; internal notes now start empty (still local — no backend model). |
| `pages/customer/ForgotPasswordPage.jsx` | Fake `setTimeout` | Calls `authApi.forgotPassword`; in dev shows a direct link to `/reset-password?token=…`. |
| `pages/customer/ResetPasswordPage.jsx` | Fake success | Reads `?token=`, calls `authApi.resetPassword`, surfaces errors, then redirects to login. |
| `pages/customer/MyReviewsPage.jsx` | 100% mock (`reviews`, `pendingProducts`) | Loads `reviewApi.getMine()`, real cards + stats + status tabs (Pending/Published/Rejected). |
| **F-18 `pages/admin/AddEditProductPage.jsx`** | Looked the product up in a non-paginated public list (product #11+ never loaded); never loaded existing variants; sent junk `variants` on every edit | Uses `productApi.getById(id)` (loads any status incl. drafts); maps real variants into an editable table (size / color / SKU / stock, add + remove rows); create keeps the size×color grid; status maps PUBLISHED/DRAFT/ARCHIVED both ways; error banner + Save-as-Draft wired. |
| **F-12 `pages/admin/SettingsPage.jsx`** | Every tab static; "Save" wrote a lone timestamp; `defaultValue` inputs; change-password not wired | Rewritten: loads `settingsApi.getAll()`; controlled inputs for the real keys (store name/email/currency, shipping fee, free-shipping threshold, tax rate, loyalty rates); per-key `settingsApi.upsert` with number coercion + dirty tracking; Security tab wired to `userApi.changePassword`. Payment/Email/Appearance tabs dropped (no backend). |
| **F-14 `pages/admin/AdminDashboard.jsx`** | Hardcoded `sparkData` (4 sparklines) + `lowStockProducts`; "12-month vs target" label on daily data with `target: 0` | Rewritten: 4 sparklines from `stats.sparklines` (14-day `revenue` / `orders` / `avgOrderValue` / `customers`); AOV card from `stats.avgOrderValue`; Low Stock list from `stats.lowStock`; chart is a real "Last 30 days" revenue/orders toggle, no fake target line; loading + empty states. |
| **F-15 `pages/admin/AnalyticsDashboard.jsx`** | 4 fake KPI cards (Conversion / Return / LTV / Repeat), fake Traffic line, date buttons inert | Rewritten: KPIs from `sales.kpis` (AOV, Repeat Purchase Rate, Customer LTV, Units per Order); **date-range buttons (7 / 30 / 90 days) refetch**; Revenue + Orders charts from the dense daily series; Traffic chart replaced with a real "New Customers" line (`dailyCustomers`); Top Products table trimmed to real fields (units + share bar); category pie unchanged (already real). |
| `services/api.js` | — | Added `inventoryApi.getLowStock(threshold)`. |
| **`pages/customer/LoyaltyPage.jsx`** | 100% mock (`currentPoints = 4820`, fake history, referral link) | Loads `loyaltyApi.getMine()` — real balance, tier + progress, lifetime earned/redeemed, points history; referral block removed. |
| **`pages/customer/NotificationsPage.jsx`** | 10 hardcoded notifications | Loads `notificationApi.getMine()`; real list grouped Orders / Reviews / Account; mark-one / mark-all read; clicking a notification follows its link. |
| **`pages/admin/OrderDetailAdminPage.jsx`** | "Issue Refund" was dead | Wired to `orderApi.refund(id)` with a confirm; shows on completed payments, hidden after refund. Payment-summary tax row reads stored `taxAmount`. |
| **`pages/admin/MarketingPage.jsx`** | 100% local mock (campaigns / subscribers / banners) | Rebuilt on `marketingApi` — campaign CRUD + **send** (real emails), banner CRUD + toggle, subscriber list + CSV export. |
| **`pages/customer/ReferralPage.jsx`** | Fake points + hardcoded link | Rebuilt on `referralApi.getMine()` — real code, share link, stats, per-referral status (pending / completed +points). |
| **`pages/customer/PaymentMethodsPage.jsx`** | Fake saved cards | Rebuilt on `paymentMethodApi` — add card (tokenised) / eSewa / Khalti / COD, set default, delete. |
| **`pages/customer/CheckoutPage.jsx`** | Card-only, fake payment; assumed a logged-in user | Payment-method step: pick a saved method or a provider (Card / eSewa / Khalti / COD); handles the redirect + verify flow; newsletter opt-in wired. Guest checkout: inline shipping/billing address + `guestEmail` payload when logged out, with per-step field validation. |
| **`pages/customer/OrderConfirmationPage.jsx`** | Static mock order | Loads the real order; runs `orderApi.verifyPayment` on gateway return; shows real totals + COD messaging. |
| **`pages/customer/RegisterPage.jsx`** | — | Reads `?ref=` and passes `referralCode`; shows the applied-code banner; wires newsletter opt-in; now renders the error state. |

### 🟠 Broken API contract

- Nothing outstanding. (Image upload, order notes, coupon auto-rules, currency,
  route guards all landed in the cleanups pass.)
- **Fixed while verifying this section:** `pages/customer/ChangePasswordPage.jsx`
  (the `/account/change-password` route) was a stub — `handleSubmit` just set a
  success flag and never called the API. Now wired to
  `userApi.changePassword({ oldPassword, newPassword })` with an error banner and a
  saving state. (The Settings → Security tab already did this; the standalone page
  didn't.)

### ⚪ Dead buttons — DONE (wired or removed)

| Page | Element | Resolution |
|------|---------|------------|
| OrdersListPage | Export | **Wired** — client-side CSV of the filtered rows (`src/utils/csv.js`). |
| OrdersListPage | per-row "Update Status" (refresh icon) | **Wired** — now a forward-only "advance status" chevron (`pending → processing → shipped → delivered`), `PUT /orders/admin/:id/status`, hidden once terminal. |
| OrdersListPage | per-row Print, "Date range" filter | **Removed** — no invoice/print view or date-filter backing; Print duplicated View. (Date range wasn't on the list but was the same dead-button class on the same page.) |
| CustomersListPage | Export | **Wired** — client-side CSV of the filtered rows. |
| CollectionsAdminPage | Edit (pencil), both table + grid | **Wired** — opens the side panel in edit mode, prefilled; saves via `PUT /collections/admin/:id` (`{ name, description }`). Collection list mapper now carries `description` / `imageUrl`. |

### 🟢 Working well (verified)

Re-checked end to end after the validation pass — all confirmed working; one
regression found and fixed (see below):

- `ProductsListPage` (list + delete), `AddEditProductPage` (create + edit incl.
  variants, any status)
- `CategoriesPage` (full CRUD), `CollectionsAdminPage` (full CRUD),
  `CouponsPage` (full CRUD incl. auto-rules)
- `OrdersListPage` (list + filter + CSV export + quick status advance),
  `OrderDetailAdminPage` (detail + status + tracking + refund + notes)
- `ReviewsPage` (approve / reject), `MyReviewsPage`
- `CustomersListPage` (list + view + CSV export), `CustomerDetailPage`
  (real stats + orders + addresses)
- `UsersPage` (staff CRUD), `SettingsPage` (store config + change password)
- `AdminDashboard` + `AnalyticsDashboard` (live metrics, date-range refetch)
- `MarketingPage` (campaigns + banners + subscribers)
- `LoyaltyPage` / `NotificationsPage` / `ReferralPage` / `PaymentMethodsPage` (live)
- `CheckoutPage` (account + guest, multi-provider payments), `AdminLayout` /
  account route guards
- customer auth (login / register + referral / forgot / reset)
- shop / cart / wishlist / checkout flow

**Bugs fixed during this check:**

- `POST /payment-methods` — the `paymentMethodSchema` added in the validation pass
  coerced the form's empty `expiryMonth` / `expiryYear` strings to `0` and then
  failed `min(1)`, so adding an eSewa / Khalti / COD method (or a card without an
  expiry) returned `400`. The schema now maps blank numeric fields to `undefined`
  before validating. Covered by a new smoke test.
- **`ProductsListPage` crashed** ("Objects are not valid as a React child … {name,
  slug}"). `GET /products` returns `category` / `collection` as `{ name, slug }`
  objects, and the page rendered `{product.category}` from the raw response. Fixed
  by running the list through `normalizeProduct` (which flattens them to strings
  and guarantees `images` / `price` / `inStock`). The two per-row Delete buttons
  were also unwired — now call `handleDeleteProduct`.
- **`ShopPage`** had the same latent crash: its inline mapper looked for
  `p.Category?.name` (capital C — the API sends lowercase `category`) and fell
  through to the raw object. Fixed to read `p.category?.name`. `normalizeProduct`
  itself hardened so a stray object can never leak into the `category` string.

### General frontend notes

- **F-17 / F-19 / F-20 are done** — see the "Small cleanups — DONE" table below.
  Route guards enforce auth at the route level (the layouts' own redirect code was
  removed), `src/data/*` is deleted, and every price is formatted through
  `SettingsContext` from the store `currency` (default `NPR`).

---

## Suggested order of work

1. ~~Backend endpoints that unblock the most UI~~ — **DONE** this pass:
   `GET /coupons/admin` (+`/:id`), staff-user CRUD, `GET /orders/admin/:id` with
   full includes, `GET /reviews/me`, `productCount` / `orderCount` / `totalSpent` /
   `avgRating` / `reviewCount` added to list payloads, `updateProduct` variant
   sync, checkout row-locking, refresh-token + forgot/reset-password.
2. ~~Frontend contract fixes (F-7…F-11) + new auth pages + `api.js` wrappers +
   401 refresh retry~~ — **DONE** this pass.
3. ~~F-18 (product-edit lookup + variant editing) and F-12 (Settings end-to-end)~~
   — **DONE** this pass.
4. ~~Backend follow-ups: mailer, `Order.updatedAt` + `subtotalAmount`/`taxAmount`,
   helmet / rate-limit / compression / zod validation~~ — **DONE** this pass.
   Left: a real test suite, secret rotation, wider validation coverage.
5. ~~Dashboards (F-14, F-15): real sparklines / KPIs / low-stock / date-range
   refetch~~ — **DONE** this pass.
6. ~~Scope call on loyalty / notifications / marketing / referral / real payments /
   refunds~~ — **DONE**. Every feature was **implemented** end-to-end (loyalty,
   notifications, marketing campaigns + banners + newsletter, referrals, saved
   payment methods, multi-provider payments incl. eSewa/Khalti/COD, refunds).
7. ~~Small cleanups~~ — **DONE** this pass:
   | Item | What shipped |
   |------|--------------|
   | **F-17** route guards | `src/components/RouteGuards.jsx` — `<RequireAuth>` / `<RequireAdmin>` wrap the `/account/*` and `/admin/*` route groups (redirect + spinner while `loading`). `AccountLayout` / `AdminLayout` had their own `useEffect` redirect + loading/`return null` code **removed** — the guards are now the single enforcement point. |
   | **F-19** unused data | `frontend/src/data/*` deleted; confirmed no remaining imports. |
   | **F-20** currency | `src/utils/money.js` knows symbols for `NPR रू` / `INR ₹` / `USD` / `GBP` / `EUR` / `AUD` / `CAD`. `SettingsContext` exposes `money()`, `symbol`, `freeShippingThreshold`, `shippingFee` from the store settings and reloads after a Settings save. Backend seed default is now `NPR` (`shipping_fee_standard` 150, `free_shipping_threshold` 10000). `SettingsPage` currency field is a dropdown. Remaining hardcoded `£`/`$` in `CouponsPage`, `CustomersListPage`, `CartPage`, `CartDrawer`, `CheckoutPage`, `ProductDetailPage` were converted to `money()` / dynamic thresholds; the fake Express/Next-Day shipping selector (prices never sent to the backend) was replaced with the real settings-driven standard-shipping line. Only editorial `£` in a `BlogDetailPage` article body is left. |
   | Category drag-reorder | `Category.sortOrder` + `PUT /categories/admin/reorder`; HTML5 drag handle in `CategoriesPage`. |
   | Product image upload | `multer` → `public/uploads`, `POST /products/admin/upload` (5 MB, image types), `ASSET_BASE_URL` env; Vite proxies `/uploads`. `AddEditProductPage` drop zone + file picker wired. |
   | Order notes | `OrderNote` model, `GET/POST /orders/admin/:id/notes` + `DELETE /orders/admin/notes/:noteId`; notes panel in `OrderDetailAdminPage`. |
   | Coupon auto-rules | `DiscountRule` model (`MIN_SUBTOTAL`/`MIN_ITEMS` → `FREE_SHIPPING`/`PERCENT_OFF`/`FIXED_OFF`), `GET/POST/PUT/DELETE /coupons/admin/rules`, applied in checkout. |
   | Test suite | `vitest` + `supertest`; `tests/smoke.test.js` (26 read-only tests) + opt-in `tests/write.test.js`. `src/db/index.js` uses `TEST_DB_URI` in a test context; `vitest.config.js` loads `.env.test`. `npm test`. |
   | Guest checkout | **Backend:** `optionalAuth` middleware; `POST /orders/checkout` + `/payments/verify` accept anonymous callers; `orders.guest_email` + nullable `addresses.user_id` (migration); inline address bodies; loyalty/referral/notifications skipped for guests. **Frontend:** `CheckoutPage` guest inline-address flow + step validation; `OrderConfirmationPage` order-from-state + guest verify + guest CTAs. |
   | Loyalty redemption | `POST /orders/checkout` accepts `redeemPoints` (account only) — capped by balance + payable amount, converted at `loyalty_points_redemption_rate`, applied as a discount, debited as a `REDEEMED` ledger row, returned on refund. `orders.loyalty_points_used` (migration). `CheckoutPage` has a points control; `OrderConfirmationPage` shows the line. |
   | Secret rotation | JWT `ACCESS_/REFRESH_TOKEN_SECRET` regenerated in `.env`. *(Aiven DB creds still need rotating via the Aiven console.)* |
   | Wider zod | every write route now schema-validated (`content.validators.js`, `user.validators.js` + `catalog.validators.js` additions). |
   | Route ordering | `collection.routes.js` and `category.routes.js` now declare `/admin*` before `/:slug`. |
8. **Still open (external / large):**
   - **Real eSewa / Khalti production keys** — code is ready; set `ESEWA_SECRET_KEY`
     / `ESEWA_PRODUCT_CODE` / `KHALTI_SECRET_KEY` in `.env` and the sandbox
     auto-approve turns off automatically.
   - **Real SMTP** — set `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` /
     `MAIL_FROM`; with `SMTP_HOST` blank the mailer just logs to the console.
   - **Test DB provisioning** — the harness is in place (`TEST_DB_URI` +
     `.env.test.example`); create the isolated schema and expand write-path coverage.
   - **Server-side cart** — reviewed and **deliberately declined**. The client-side
     cart (`CartContext` + `localStorage`) is sufficient; checkout re-validates
     stock + prices server-side so a stale cart is safe, and cross-device sync /
     abandoned-cart recovery aren't needed. A `/api/cart` with guest-cart
     merge-on-login is a large change with little payoff here.

### Run after pulling this change

```bash
cd backend
npm install          # multer, vitest, supertest added
npm run sync         # new tables: campaigns, banners, referrals, payment_methods,
                     #   newsletter_subscribers, loyalty_transactions, notifications,
                     #   order_notes, discount_rules  (+ user / payment / category cols)
npm run migrate      # orders.subtotal_amount / tax_amount / updated_at / guest_email;
                     #   relaxes addresses.user_id to nullable (guest checkout)
npm run seed         # (optional) demo marketing data + referral codes
npm run dev
```
