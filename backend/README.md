# Eternal — Backend API

REST API for the **Eternal** clothing‑store platform: a customer‑facing shop plus an
admin dashboard. Built with Node.js, Express 5 and Sequelize 6 on MySQL.

- **Runtime:** Node.js (ES modules, `"type": "module"`)
- **Framework:** Express `^5.2` (+ `helmet`, `compression`, `express-rate-limit`)
- **ORM:** Sequelize `^6.37` with `mysql2`
- **Auth:** JWT (access + refresh) via `jsonwebtoken`, password hashing via `bcryptjs`
- **Validation:** `zod` schemas via a `validateBody` middleware
- **Email:** `nodemailer` (SMTP, console fallback in dev)
- **Base URL:** `http://localhost:8000/api/v1`

Related documents in this folder:

| File | Purpose |
|------|---------|
| `plan.md` | Original feature/endpoint plan derived from the frontend |
| `database_schema.md` | Full ERD (Mermaid) and table definitions |
| `usecase_diagram.md` | Actor / use‑case breakdown |
| `conversation.md` | Historical build log |

---

## Getting started

### Prerequisites

- Node.js 18+
- A reachable MySQL database (the project is currently pointed at an Aiven instance)

### Install

```bash
cd backend
npm install
```

### Environment

Create `backend/.env` (see `.env.example` for the legacy template — the **keys the code
actually reads** are below):

```ini
PORT=8000
CROSS_ORIGIN=*                       # allowed CORS origin (see note in "Known issues")

# Single connection string used by src/db/index.js
DB_URI=mysql://user:password@host:port/database

# JWT
ACCESS_TOKEN_SECRET=<random-hex>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<random-hex>
REFRESH_TOKEN_EXPIRY=10d

# Optional
NODE_ENV=development                 # "production" enables secure cookies + hides stack traces

# Rate limiting (requests per 15-min window)
RATE_LIMIT_MAX=600
AUTH_RATE_LIMIT_MAX=20

# Email — leave SMTP_HOST empty in dev to log emails to the console instead of sending
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Eternal <no-reply@eternal.local>
APP_URL=http://localhost:5173         # frontend base URL, used for email + payment links

# Payment gateways — blank ⇒ eSewa/Khalti run in sandbox (auto-approve on verify)
ESEWA_SECRET_KEY=
ESEWA_PRODUCT_CODE=
KHALTI_SECRET_KEY=
```

See `.env.example` for the full annotated list.

### Create / update the schema

```bash
npm run sync         # sequelize.sync({ alter: true }) — creates/updates all tables
npm run migrate      # idempotent raw-SQL for columns sync can't add to populated tables
```

Run both after pulling schema changes. `npm run sync` creates any new tables
(`referrals`, `payment_methods`, `campaigns`, `banners`, `newsletter_subscribers`,
`loyalty_transactions`, `notifications`, `discount_rules`, `order_notes`) and
nullable columns; `npm run migrate`
handles columns `sync` can't add or alter cleanly on a populated table
(`orders.subtotal_amount` / `tax_amount` / `updated_at` / `guest_email` /
`loyalty_points_used`, and relaxing `addresses.user_id` to nullable for guest
checkout).

### Seed demo data

```bash
node src/seed.js
```

Seeds 6 categories, 4 collections, 12 products (with size×color variants), store
settings, and two accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eternal.com` | `Admin@123` |
| Customer | `customer@eternal.com` | `Customer@123` |

### Run

```bash
npm run dev      # nodemon
npm start        # node src/index.js
```

Server listens on `PORT` (default `8000`). On boot it calls `ConnectDB()` and then
`app.listen`; if the database is unreachable the process exits with code 1.

Quick sanity check:

```bash
curl http://localhost:8000/health
# {"success":true,...,"message":"Eternal API is running",...}
```

### Running with the frontend

The frontend dev server proxies `/api` to `http://127.0.0.1:8000`, so just run both:

```bash
# terminal 1
cd backend && npm run dev
# terminal 2
cd frontend && npm run dev      # http://localhost:5173
```

No CORS config or frontend `.env` is needed for local development. For a deployed
frontend on a different origin, set `CROSS_ORIGIN` here (comma-separated allowlist) and
`VITE_API_URL` in the frontend.

---

## Project structure

```
backend/
├── src/
│   ├── index.js              # entry: load env → connect DB → start server
│   ├── app.js                # express app, middleware, route mounting, error handler
│   ├── constant.js
│   ├── db/
│   │   └── index.js          # Sequelize instance (reads DB_URI)
│   ├── models/
│   │   ├── *.model.js        # 22 Sequelize models
│   │   └── relation.js       # all associations; import this to register the schema
│   ├── controllers/          # one file per resource
│   ├── routes/               # one router per resource, mounted under /api/v1/*
│   ├── validators/           # zod schemas (auth, order, …)
│   ├── middlewares/
│   │   ├── auth.middleware.js      # verifyJWT
│   │   ├── admin.middleware.js     # verifyAdmin (ADMIN | STAFF)
│   │   └── validate.middleware.js  # validateBody(zodSchema)
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── slugify.js
│   │   ├── mailer.js         # nodemailer wrapper + sendPasswordResetEmail
│   │   └── notify.js         # createNotification helper (never throws)
│   ├── seed.js
│   ├── sync.js
│   ├── migrate.js            # idempotent raw-SQL column adds
│   └── makeAdmin.js          # promote a user: node src/makeAdmin.js <email> [ADMIN|STAFF]
├── public/                   # static files (served at /)
└── .env
```

### Middleware order (`app.js`)

`helmet` → `compression` → CORS → body parsers → `cookie-parser` → `/health` →
global rate limiter (`/api`) → auth rate limiter (`/api/v1/auth`) → routes →
JSON 404 → error handler.

---

## Data model

24 models, all with UUID v4 primary keys (except `Setting`, keyed by string).
Associations live in `src/models/relation.js`. See `database_schema.md` for the ERD.

| Model | Table | Notes |
|-------|-------|-------|
| `User` | `users` | roles `CUSTOMER` / `STAFF` / `ADMIN`; `beforeSave` hook hashes `passwordHash`; instance methods `isPasswordCorrect`, `generateAccessToken`, `generateRefreshToken`; stores `refreshToken` + `resetPasswordToken` / `resetPasswordExpires` (never returned in responses) |
| `Address` | `addresses` | belongs to a user (`userId` nullable — guest-checkout addresses have no owner); default shipping/billing flags |
| `Category` | `categories` | unique `slug` |
| `Collection` | `collections` | unique `slug` |
| `Product` | `products` | `paranoid` (soft delete); `details` & `images` are JSON; status `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `ProductVariant` | `product_variants` | size + color + unique `sku` + `stockQuantity` + optional `priceOverride` |
| `Order` | `orders` | status `PENDING`→`PROCESSING`→`SHIPPED`→`DELIVERED` / `CANCELLED`; unique `orderNumber`; `userId` nullable + `guestEmail` for guest checkout; stores `subtotalAmount`, `taxAmount`, `discountAmount`, `loyaltyPointsUsed`, `shippingFee`, `totalAmount`; has `createdAt` + `updatedAt` |
| `OrderItem` | `order_items` | links order ↔ variant, snapshots `unitPrice` |
| `Payment` | `payments` | `provider` (`MOCK`/`CARD`/`COD`/`ESEWA`/`KHALTI`), status `PENDING` / `COMPLETED` / `FAILED` / `REFUNDED`, nullable `transactionId` |
| `PaymentMethod` | `payment_methods` | saved instrument — tokenised (brand + last4 only), `isDefault` |
| `Coupon` | `coupons` | `PERCENTAGE` / `FIXED_AMOUNT`, validity window, usage limit |
| `DiscountRule` | `discount_rules` | automatic cart discount — `trigger` `MIN_SUBTOTAL` / `MIN_ITEMS` + `threshold` → `reward` `FREE_SHIPPING` / `PERCENT_OFF` / `FIXED_OFF` + `rewardValue`; `isActive`, `priority` |
| `OrderNote` | `order_notes` | internal staff note on an order; `belongsTo` author (`User`) |
| `Review` | `reviews` | rating 1–5, status `PENDING` / `APPROVED` / `REJECTED` |
| `Wishlist` | `wishlists` | one per user |
| `WishlistItem` | `wishlist_items` | |
| `Setting` | `settings` | key/value (JSON) store for shipping fee, tax rate, etc. |
| `BlogPost` | `blog_posts` | unique `slug`, `publishedAt` gate |
| `LoyaltyTransaction` | `loyalty_transactions` | signed `points`, type `EARNED` / `REDEEMED` / `ADJUSTMENT`, optional `orderId` |
| `Notification` | `notifications` | `type`, `title`, `message`, optional `link`, `isRead` |
| `Referral` | `referrals` | `referrerId` + `refereeId` (unique), `PENDING` / `COMPLETED`, `rewardPoints` |
| `Campaign` | `campaigns` | email/SMS/push campaign; `DRAFT`→`SENDING`→`COMPLETED`; audience + counts |
| `Banner` | `banners` | storefront banner by `position`, active window, `sortOrder` |
| `NewsletterSubscriber` | `newsletter_subscribers` | unique `email`, `ACTIVE` / `UNSUBSCRIBED`, `source` |

---

## Conventions

### Response envelope

Success responses use `ApiResponse`:

```json
{ "statusCode": 200, "data": { }, "message": "…", "success": true }
```

Errors are normalised by the global handler in `app.js`:

```json
{ "success": false, "statusCode": 400, "message": "…", "errors": [], "stack": "…(dev only)" }
```

### Authentication

- `verifyJWT` reads the token from the `accessToken` cookie **or** an
  `Authorization: Bearer <token>` header, loads the user onto `req.user`.
- `optionalAuth` does the same but never rejects — a missing or invalid token
  just means `req.user` is undefined. Used by `POST /orders/checkout` and
  `POST /orders/payments/verify` so guests can order without an account.
- `verifyAdmin` must run after `verifyJWT`; allows `ADMIN` and `STAFF`.
- Login sets `accessToken` / `refreshToken` as `httpOnly` cookies **and** returns them
  in the body (the SPA also stores them in `localStorage` for the Bearer fallback).

### Admin routes

Write operations are namespaced under `/<resource>/admin`, e.g.
`POST /products/admin`, `PUT /products/admin/:id`.

---

## API reference

All paths are prefixed with `/api/v1`. 🔒 = requires `verifyJWT`, 👑 = also requires
`verifyAdmin`.

### Auth — `/auth`
| Method | Path | Notes |
|--------|------|-------|
| POST | `/register` | `{ firstName, lastName, email, password, phoneNumber? }` |
| POST | `/login` | `{ email, password }` → sets cookies, returns `{ user, accessToken, refreshToken }` |
| POST | `/refresh-token` | `{ refreshToken }` (or cookie) → new token pair; refresh token is persisted on the user and rotated |
| POST | `/forgot-password` | `{ email }` → always 200. Emails a reset link. If SMTP is unconfigured *and* not production, the body carries `{ resetToken }` |
| POST | `/reset-password` | `{ token, newPassword }` — 1‑hour token; also clears the stored refresh token |
| POST | `/logout` | 🔒 clears cookies + stored refresh token |

### Users — `/users`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/me` | 🔒 current profile |
| PUT | `/me` | 🔒 `{ firstName?, lastName?, phoneNumber? }` |
| PUT | `/change-password` | 🔒 `{ oldPassword, newPassword }` |
| GET | `/admin/customers` | 👑 list customers — each row includes `orderCount`, `totalSpent` |
| GET | `/admin/customers/:id` | 👑 customer detail (+ `orderCount`, `totalSpent`) |
| GET | `/admin/users` | 👑 list ADMIN + STAFF users |
| POST | `/admin/users` | 👑 `{ firstName, lastName, email, password, phoneNumber?, role? }` (role `ADMIN`\|`STAFF`, default `STAFF`) |
| PUT | `/admin/users/:id` | 👑 `{ firstName?, lastName?, phoneNumber?, role? }` — refuses to demote/delete the last admin |
| DELETE | `/admin/users/:id` | 👑 cannot delete self or the last admin |

### Addresses — `/addresses` (all 🔒)
| Method | Path |
|--------|------|
| GET | `/` |
| POST | `/` |
| PUT | `/:id` |
| DELETE | `/:id` |

### Categories — `/categories`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | list — each row includes `productCount`, ordered by `sortOrder` |
| GET | `/:slug` | detail |
| POST | `/admin` | 👑 `{ name, description?, image_url? }` |
| PUT | `/admin/reorder` | 👑 `{ ids: [] }` — persists drag-and-drop order into `sortOrder` |
| PUT | `/admin/:id` | 👑 |
| DELETE | `/admin/:id` | 👑 blocked if products reference it |

### Collections — `/collections`
Same shape as categories; `GET /` rows include `productCount`.

### Products — `/products`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | query: `category`, `collection`, `search`, `minPrice`, `maxPrice`, `sort` (`price_asc`\|`price_desc`\|`newest`), `page`, `limit` → `{ products, pagination }`. Each product carries `avgRating` + `reviewCount` (APPROVED reviews only) |
| GET | `/:slug` | accepts a slug **or** the product's UUID id; PUBLISHED only; includes category, collection, variants, `avgRating`, `reviewCount` |
| GET | `/admin/:id` | 👑 single product by id, **any status** (incl. soft-deleted); includes category, collection, variants — used by the edit form |
| POST | `/admin/upload` | 👑 `multipart/form-data` field `images` (up to 8, ≤5 MB each, images only) → `{ urls: [] }`; files are stored under `public/uploads` and served at `/uploads/...` |
| POST | `/admin` | 👑 creates product + variants in a transaction |
| PUT | `/admin/:id` | 👑 also syncs variants: send `variants: [{ id?, size, colorName, colorHex, sku, stockQuantity, priceOverride? }]` (omit `id` to create, omit a row to delete) and/or `deleteVariantIds: []` |
| DELETE | `/admin/:id` | 👑 soft delete |

### Inventory — `/inventory` (all 👑)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | all variants with parent product |
| GET | `/low-stock` | `?threshold=10&limit=20` — variants below the threshold, lowest first, with product |
| PUT | `/:id` | `{ stockQuantity?, priceOverride? }` |

### Orders — `/orders`
Every order response includes `items` → `productVariant` → `product`,
`payments`, `coupon`, `shippingAddress`, `billingAddress`.

| Method | Path | Notes |
|--------|------|-------|
| POST | `/checkout` | **auth optional** — zod-validated; row-locked variants, coupon, shipping + tax from `settings`. `provider` ∈ `MOCK`/`CARD`/`COD`/`ESEWA`/`KHALTI`. Returns `{ order, provider, redirect?, requiresPayment }` — for `ESEWA`/`KHALTI` the client uses `redirect` then calls `/payments/verify`.<br>• **Account** (Bearer token): `{ items:[{ productVariantId, quantity }], shippingAddressId, billingAddressId, couponCode?, redeemPoints?, provider?, savedPaymentMethodId?, paymentToken? }` — plus loyalty accrual + referral completion; `redeemPoints` spends loyalty points as a discount (see the Loyalty section).<br>• **Guest** (no token): `{ items, shippingAddress:{ addressLine1, addressLine2?, city, state?, postalCode, country }, billingAddress:{…}, guestEmail, couponCode?, provider?, paymentToken? }` — `Order.userId` is null, `guestEmail` is stored, the addresses are created with no owner; no loyalty/referral/notifications. `savedPaymentMethodId` is ignored. |
| POST | `/payments/verify` | **auth optional** — `{ orderId, provider, ref, guestEmail? }` — confirm a redirect payment; settles the order (idempotent). Authorised by the owning account, or by a guest supplying the order's `guestEmail`. |
| GET | `/my-orders` | 🔒 |
| GET | `/my-orders/:id` | 🔒 |
| GET | `/admin` | 👑 all orders (+ `user`) |
| GET | `/admin/:id` | 👑 single order, full detail (+ `user` with `phoneNumber`) |
| PUT | `/admin/:id/status` | 👑 `{ status?, trackingNumber? }` — case‑insensitive; notifies on SHIPPED/DELIVERED/CANCELLED; a COD payment settles (+ loyalty) when set to DELIVERED |
| POST | `/admin/:id/refund` | 👑 refund: payment → `REFUNDED`, order → `CANCELLED`, items restocked, loyalty reversed, customer notified |
| GET | `/admin/:id/notes` | 👑 internal staff notes for the order (author included) |
| POST | `/admin/:id/notes` | 👑 `{ note }` — adds a note authored by the current user |
| DELETE | `/admin/:id/notes/:noteId` | 👑 remove a note |

### Coupons — `/coupons`
| Method | Path | Notes |
|--------|------|-------|
| POST | `/validate` | 🔒 `{ code, subtotal }` → `{ discountAmount, … }` |
| GET | `/admin` | 👑 list all — each row has a derived `status` (`ACTIVE`\|`INACTIVE`\|`EXPIRED`\|`SCHEDULED`\|`EXHAUSTED`) |
| GET | `/admin/:id` | 👑 single coupon |
| POST | `/admin` | 👑 `{ code, discountType, discountValue, validUntil, validFrom?, minPurchaseAmount?, usageLimit? }` — `discountType` accepts `PERCENTAGE` or `FIXED_AMOUNT` (alias `FIXED`); `validFrom` defaults to now; `maxUses` accepted as alias for `usageLimit` |
| PUT | `/admin/:id` | 👑 same field rules |
| DELETE | `/admin/:id` | 👑 |
| GET | `/admin/rules` | 👑 list automatic discount rules |
| POST | `/admin/rules` | 👑 `{ name, trigger, threshold, reward, rewardValue?, isActive?, priority? }` — `trigger` ∈ `MIN_SUBTOTAL`/`MIN_ITEMS`, `reward` ∈ `FREE_SHIPPING`/`PERCENT_OFF`/`FIXED_OFF` |
| PUT | `/admin/rules/:id` | 👑 same fields |
| DELETE | `/admin/rules/:id` | 👑 |

Automatic rules are evaluated at checkout **after** any coupon (highest `priority`
first) and need no code; the best applicable reward is combined with the coupon
discount, capped at the order subtotal.

### Wishlist — `/wishlist` (all 🔒)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | auto‑creates the wishlist |
| POST | `/` | `{ productId }` |
| DELETE | `/:productId` | |

### Reviews — `/reviews`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | `?productId=` — approved reviews only |
| GET | `/me` | 🔒 current user's own reviews (any status), product included |
| POST | `/` | 🔒 `{ productId, rating, comment? }` — requires a `DELIVERED` order for that product |
| GET | `/admin` | 👑 all reviews |
| PUT | `/admin/:id/status` | 👑 `{ status }` |
| DELETE | `/admin/:id` | 👑 |

### Blogs — `/blogs`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | published posts |
| GET | `/:slug` | |
| POST | `/admin` | 👑 `{ title, content, publishedAt? }` |
| PUT | `/admin/:id` | 👑 |
| DELETE | `/admin/:id` | 👑 |

### Analytics — `/analytics` (all 👑)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/dashboard` | revenue (+ MoM growth), orders (+ by-status), customers, `avgOrderValue`, top products, category revenue, recent orders, `pendingReviews`, `lowStock[]` (variants < 10), `sparklines` (14-day dense series: `revenue`, `orders`, `customers`, `avgOrderValue`) |
| GET | `/sales` | `?period=30` (1–365) — dense daily series `dailyRevenue` / `dailyOrders` / `dailyCustomers` (one point per day), plus `kpis`: `avgOrderValue`, `unitsPerOrder`, `customerLtv`, `repeatPurchaseRate` (%), `refundRate` (%) |

### Settings — `/settings`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | key→value map |
| GET | `/:key` | |
| PUT | `/:key` | 👑 `{ value }` |

Keys used by checkout: `shipping_fee_standard`, `free_shipping_threshold`,
`tax_rate_percent`, `loyalty_points_per_dollar`. Others: `store_name`,
`store_email`, `currency`, `loyalty_points_redemption_rate`, `referral_reward_points`.

`currency` is the single source of truth for money formatting across the whole
storefront and admin — the frontend `SettingsContext` reads it on load and every
price is rendered through it (symbols known for `NPR`, `INR`, `USD`, `GBP`, `EUR`,
`AUD`, `CAD`). The seed defaults to `NPR` with `shipping_fee_standard` 150 and
`free_shipping_threshold` 10000; change them from the admin **Settings → General /
Shipping & Tax** tabs and the change takes effect immediately (checkout reads the
settings live on every order).

### Loyalty — `/loyalty`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/me` | 🔒 `{ balance, tier, nextTierAt, lifetimeEarned, lifetimeSpent, pointsPerDollar, redemptionRate, transactions[] }` |

Points accrue automatically when an order is **paid** (`floor(subtotal ×
loyalty_points_per_dollar)`) and are reversed on refund.

**Redemption:** `POST /orders/checkout` accepts `redeemPoints` (account checkouts
only). The value is capped by the caller's balance and by the amount still
payable, converted at `loyalty_points_redemption_rate` currency per point, and
applied as a discount — `totalAmount` never goes below 0. The points are debited
at checkout (a `REDEEMED` ledger row) and returned in full if the order is
refunded. The checkout response includes `loyaltyPointsUsed` / `loyaltyDiscount`,
and `Order` stores `loyaltyPointsUsed`.

### Notifications — `/notifications` (all 🔒)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | `{ unreadCount, notifications[] }` newest first |
| PUT | `/:id/read` | mark one read |
| PUT | `/read-all` | mark all read |
| DELETE | `/:id` | delete one |

Created automatically on: order placed / shipped / delivered / cancelled / refunded,
loyalty points earned, referral completed, and review approved / rejected.

### Referrals — `/referrals`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/me` | 🔒 `{ code, link, rewardPoints, stats, referrals[] }` — the caller's referral code, share link, and who signed up with it |

Every user is issued a `referralCode`. `POST /auth/register` accepts `referralCode`;
the referee's **first paid order** completes the referral and credits both users
with `referral_reward_points` loyalty points.

### Saved payment methods — `/payment-methods` (all 🔒)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | list (default first) |
| POST | `/` | `{ type, ... }` — `CARD` (send `cardNumber` — only last 4 kept), `ESEWA`/`KHALTI` (`walletId`), `COD` |
| PUT | `/:id/default` | make default |
| DELETE | `/:id` | remove |

### Marketing — `/marketing`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/banners/active` | **public** — active banners, optional `?position=` |
| POST | `/newsletter/subscribe` | **public** `{ email, source? }` |
| POST | `/newsletter/unsubscribe` | **public** `{ email }` |
| GET | `/campaigns` | 👑 |
| POST | `/campaigns` | 👑 `{ name, type?, subject?, body?, audience?, scheduledAt? }` |
| PUT / DELETE | `/campaigns/:id` | 👑 |
| POST | `/campaigns/:id/send` | 👑 sends an EMAIL campaign to its audience via the mailer |
| GET / POST | `/banners` | 👑 |
| PUT / DELETE | `/banners/:id` | 👑 |
| GET | `/subscribers` | 👑 `{ activeCount, subscribers[] }` |

---

## Security & limits

- **Headers:** `helmet` defaults (CSP, HSTS, `X-Frame-Options`, `nosniff`, …).
- **Rate limits:** `/api` → 600 req / 15 min (`RATE_LIMIT_MAX`); `/api/v1/auth` →
  20 req / 15 min, successful requests not counted (`AUTH_RATE_LIMIT_MAX`).
  `429` responses use the standard JSON error envelope.
- **Validation:** `zod` `validateBody` guards **every write route** — auth,
  checkout (account + guest shapes), payment verify, order status, product/variant
  create & update, category & collection create & update & reorder, coupon
  create & update, automatic discount rules, inventory update, review create &
  moderation, blog create & update, settings upsert, profile update,
  change-password, staff create & update, address create & update, wishlist add,
  saved payment methods, and marketing (campaigns, banners, newsletter). Failures
  return `400` with an `errors: [{ field, message }]` array. Schemas live in
  `src/validators/`.
- **Guest checkout:** anonymous callers can place and pay for an order. Their
  order has no `userId` (kept only as `guestEmail`) and gets none of the
  account-only perks — no loyalty points, no referral credit, no notification
  feed, no saved payment methods.
- **Payment tokenisation:** card numbers are never persisted — only the brand + last
  4 digits and an opaque token, mirroring how a real gateway returns a card token.
- **Email:** password-reset links + marketing campaigns are sent via SMTP; with
  `SMTP_HOST` unset the message is printed to the server console (and the reset
  token is returned in the `forgot-password` response — dev only).
- **Payments:** `ESEWA` / `KHALTI` run in **sandbox** (auto-approve on verify)
  unless `ESEWA_*` / `KHALTI_*` keys are set. `MOCK` / `CARD` settle instantly;
  `COD` settles when the order is delivered.

---

## Known issues / TODO

See **`FIXES.md`** and **`plan.md`** for the full tracked list. In brief, still open:

- Configure a real SMTP server and real eSewa/Khalti keys for production (both are
  env-var driven — the code is ready).
- Cart is client-side only (no `/api/cart`) — a server-side cart is deliberately
  out of scope for this project.
- `npm test` — 26 read-only checks always run; the `tests/write.test.js` lifecycle
  block runs only when `TEST_DB_URI` is set (see `.env.test.example`). Expanding
  write-path coverage is the remaining test task.
- JWT secrets in `.env` have been rotated; the Aiven MySQL credentials still need
  a manual rotation via the Aiven console (`.env` itself was never committed).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm run sync` | Sync models → database schema (`sequelize.sync({ alter: true })`) |
| `npm run migrate` | Idempotent raw-SQL column adds sync can't do |
| `npm run seed` | Seed demo data |
| `npm test` | Vitest/supertest suite — read-only against `DB_URI`; the write block runs only with `TEST_DB_URI` set (`.env.test.example`) |
| `npm run test:watch` | Same, in watch mode |
| `node src/makeAdmin.js <email> [ADMIN\|STAFF]` | Promote a user |
