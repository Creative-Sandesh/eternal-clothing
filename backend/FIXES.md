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

### 🟡 Missing endpoints — remaining

1. **Guest checkout.**
   `Order.userId` is nullable and the ERD allows it, but `POST /orders/checkout` is
   behind `verifyJWT`. Either allow anonymous checkout or document that login is
   required. *(Left as-is: the frontend has no guest flow yet.)*

### 🟠 Logic / correctness — remaining

2. **`collection.controller.js` `deleteCollection`** has a dead `if (productCount > 0)`
   block with only comments inside. Either enforce a rule or delete the block.

3. **`getProductBySlug`** treats any numeric-looking slug as an id. A product whose
   slug is numeric (unlikely) would be unreachable. Low priority.

4. **Route ordering** in `product.routes.js` is now fixed; `category.routes.js` and
   `collection.routes.js` still declare `/:slug` before `/admin` (harmless for GET,
   but tidy up for consistency).

### 🟡 Hardening / infra — remaining

5. **`npm test` is still the placeholder.** No test runner is set up — the
   `scratchpad/*.mjs` scripts used during this work are throwaway. Add Vitest or
   `node:test` + a seeded test DB.

6. **Secrets are committed in `.env`** (real Aiven credentials + JWT secrets).
   Rotate them; `.env` is in `.gitignore` but confirm it was never committed.

7. **`uuid` transitive advisory** via `sequelize@6` (moderate). Only fixable by a
   breaking Sequelize downgrade — accept for now.

8. **Validation coverage is partial** — auth + checkout + order-status are
   schema-validated; the rest of the admin write routes still hand-roll checks.
   Extend `validators/` incrementally.

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
| **Server-persisted cart** (`/api/cart`) | Still client-side (context + localStorage) — acceptable for this build. |

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
| **`pages/customer/CheckoutPage.jsx`** | Card-only, fake payment | Payment-method step: pick a saved method or a provider (Card / eSewa / Khalti / COD); handles the redirect + verify flow; newsletter opt-in wired. |
| **`pages/customer/OrderConfirmationPage.jsx`** | Static mock order | Loads the real order; runs `orderApi.verifyPayment` on gateway return; shows real totals + COD messaging. |
| **`pages/customer/RegisterPage.jsx`** | — | Reads `?ref=` and passes `referralCode`; shows the applied-code banner; wires newsletter opt-in; now renders the error state. |

### 🟠 Broken API contract — remaining

- Nothing outstanding. (Image upload, order notes, coupon auto-rules, currency,
  route guards all landed in the cleanups pass.)

### ⚪ Dead buttons (cosmetic — wire or remove)

| Page | Element |
|------|---------|
| OrdersListPage | Export, per-row Print, per-row "Update Status" (the refresh icon) |
| CustomersListPage | Export |
| CollectionsAdminPage | Edit (pencil) — only delete works |

### 🟢 Working well (no action)

`ProductsListPage` (list + delete), `CategoriesPage` (full CRUD),
`CollectionsAdminPage` (create + delete), `OrdersListPage` (list + filter),
`OrderDetailAdminPage` (detail + status + tracking), `ReviewsPage` (approve /
reject), `CustomersListPage` (list + view), `CustomerDetailPage` (real stats +
orders + addresses), `CouponsPage` (full CRUD), `UsersPage` (staff CRUD),
`AddEditProductPage` (create + edit incl. variants, any status),
`SettingsPage` (store config + change password),
`AdminDashboard` + `AnalyticsDashboard` (live metrics, date-range refetch),
`OrderDetailAdminPage` (detail + status + tracking + refund),
`MarketingPage` (campaigns + banners + subscribers),
`LoyaltyPage` / `NotificationsPage` / `ReferralPage` / `PaymentMethodsPage` (live),
`CheckoutPage` (multi-provider payments), `AdminLayout` guard,
customer auth (login / register + referral / forgot / reset), `MyReviewsPage`,
shop / cart / wishlist / checkout flow.

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
   | Test suite | `vitest` + `supertest`; `tests/smoke.test.js` (17 read-only tests: infra, auth, RBAC, catalog, validation, loyalty/referral/notifications). `npm test`. |
   | Secret rotation | JWT `ACCESS_/REFRESH_TOKEN_SECRET` regenerated in `.env`. *(Aiven DB creds still need rotating via the Aiven console.)* |
   | Wider zod | validators added for product create/update, category/collection create, coupon create, address create, review create. |
   | Route ordering | `collection.routes.js` and `category.routes.js` now declare `/admin*` before `/:slug`. |
8. **Still open:** real eSewa/Khalti production keys, real SMTP, loyalty redemption
   at checkout, guest checkout, server-side cart, a dedicated test DB (the suite
   currently runs read-only against dev).

### Run after pulling this change

```bash
cd backend
npm install          # multer, vitest, supertest added
npm run sync         # new tables: campaigns, banners, referrals, payment_methods,
                     #   newsletter_subscribers, loyalty_transactions, notifications,
                     #   order_notes, discount_rules  (+ user / payment / category cols)
npm run migrate      # adds orders.subtotal_amount / tax_amount / updated_at
npm run seed         # (optional) demo marketing data + referral codes
npm run dev
```
