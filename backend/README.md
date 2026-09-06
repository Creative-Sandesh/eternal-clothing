# Eternal — Backend API

REST API for the **Eternal** clothing‑store platform: a customer‑facing shop plus an
admin dashboard. Built with Node.js, Express 5 and Sequelize 6 on MySQL.

- **Runtime:** Node.js (ES modules, `"type": "module"`)
- **Framework:** Express `^5.2`
- **ORM:** Sequelize `^6.37` with `mysql2`
- **Auth:** JWT (access + refresh) via `jsonwebtoken`, password hashing via `bcryptjs`
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
```

> `.env.example` still lists `DB_HOST` / `DB_USER` / `MONGODB_URI` etc. — those are stale
> and unused. Only `DB_URI` matters.

### Create the schema

```bash
node src/sync.js     # sequelize.sync({ alter: true }) — creates/updates all tables
```

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
`app.listen`.

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
│   │   ├── *.model.js        # 15 Sequelize models
│   │   └── relation.js       # all associations; import this to register the schema
│   ├── controllers/          # one file per resource
│   ├── routes/               # one router per resource, mounted under /api/v1/*
│   ├── middlewares/
│   │   ├── auth.middleware.js    # verifyJWT
│   │   └── admin.middleware.js   # verifyAdmin (ADMIN | STAFF)
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── slugify.js
│   ├── seed.js
│   └── sync.js
├── public/                   # static files (served at /)
└── .env
```

---

## Data model

15 models, all with UUID v4 primary keys. Associations live in
`src/models/relation.js`. See `database_schema.md` for the full ERD.

| Model | Table | Notes |
|-------|-------|-------|
| `User` | `users` | roles `CUSTOMER` / `STAFF` / `ADMIN`; `beforeSave` hook hashes `passwordHash`; instance methods `isPasswordCorrect`, `generateAccessToken`, `generateRefreshToken` |
| `Address` | `addresses` | belongs to user; default shipping/billing flags |
| `Category` | `categories` | unique `slug` |
| `Collection` | `collections` | unique `slug` |
| `Product` | `products` | `paranoid` (soft delete); `details` & `images` are JSON; status `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `ProductVariant` | `product_variants` | size + color + unique `sku` + `stockQuantity` + optional `priceOverride` |
| `Order` | `orders` | status `PENDING`→`PROCESSING`→`SHIPPED`→`DELIVERED` / `CANCELLED`; unique `orderNumber` |
| `OrderItem` | `order_items` | links order ↔ variant, snapshots `unitPrice` |
| `Payment` | `payments` | status `PENDING` / `COMPLETED` / `FAILED` / `REFUNDED` (currently mocked) |
| `Coupon` | `coupons` | `PERCENTAGE` / `FIXED_AMOUNT`, validity window, usage limit |
| `Review` | `reviews` | rating 1–5, status `PENDING` / `APPROVED` / `REJECTED` |
| `Wishlist` | `wishlists` | one per user |
| `WishlistItem` | `wishlist_items` | |
| `Setting` | `settings` | key/value (JSON) store for shipping fee, tax rate, etc. |
| `BlogPost` | `blog_posts` | unique `slug`, `publishedAt` gate |

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
| POST | `/logout` | 🔒 clears cookies |

### Users — `/users`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/me` | 🔒 current profile |
| PUT | `/me` | 🔒 `{ firstName?, lastName?, phoneNumber? }` |
| PUT | `/change-password` | 🔒 `{ oldPassword, newPassword }` |
| GET | `/admin/customers` | 👑 list customers |
| GET | `/admin/customers/:id` | 👑 customer detail |

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
| GET | `/` | list |
| GET | `/:slug` | detail |
| POST | `/admin` | 👑 `{ name, description?, image_url? }` |
| PUT | `/admin/:id` | 👑 |
| DELETE | `/admin/:id` | 👑 blocked if products reference it |

### Collections — `/collections`
Same shape as categories.

### Products — `/products`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | query: `category`, `collection`, `search`, `minPrice`, `maxPrice`, `sort` (`price_asc`\|`price_desc`\|`newest`), `page`, `limit` → `{ products, pagination }` |
| GET | `/:slug` | slug or numeric id; includes category, collection, variants |
| POST | `/admin` | 👑 creates product + variants in a transaction |
| PUT | `/admin/:id` | 👑 |
| DELETE | `/admin/:id` | 👑 soft delete |

### Inventory — `/inventory` (all 👑)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | all variants with parent product |
| PUT | `/:id` | `{ stockQuantity?, priceOverride? }` |

### Orders — `/orders`
| Method | Path | Notes |
|--------|------|-------|
| POST | `/checkout` | 🔒 `{ items:[{ productVariantId, quantity }], shippingAddressId, billingAddressId, couponCode?, paymentMethod?, paymentToken? }` — transaction: stock check + decrement, coupon, shipping, order + items + mock payment |
| GET | `/my-orders` | 🔒 |
| GET | `/my-orders/:id` | 🔒 |
| GET | `/admin` | 👑 all orders |
| PUT | `/admin/:id/status` | 👑 `{ status?, trackingNumber? }` |

### Coupons — `/coupons`
| Method | Path | Notes |
|--------|------|-------|
| POST | `/validate` | 🔒 `{ code, subtotal }` → `{ discountAmount, … }` |
| POST | `/admin` | 👑 |
| PUT | `/admin/:id` | 👑 |
| DELETE | `/admin/:id` | 👑 |

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
| GET | `/dashboard` | revenue, orders, customers, top products, recent orders |
| GET | `/sales` | `?period=30` — daily revenue + order counts |

### Settings — `/settings`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | key→value map |
| GET | `/:key` | |
| PUT | `/:key` | 👑 `{ value }` |

---

## Known issues / TODO

Tracked from the codebase review:

- **`GET /analytics/dashboard` — `categoryRevenue` query is broken** (undefined
  `ProductVariant` import, Postgres‑style quoting on MySQL, wrong column/alias). Fix or
  remove before relying on the dashboard.
- **CORS:** `origin: "*"` with `credentials: true` is invalid for credentialed browser
  requests; works in dev only via the Vite proxy. Reflect a specific origin for deploys.
- **`ConnectDB()` swallows connection errors** — the server boots even if MySQL is down.
- **No catch‑all 404 handler** — unknown routes return Express's default HTML, not the
  JSON envelope.
- Not yet implemented from `plan.md`: `forgot-password` / `reset-password`, refresh‑token
  rotation endpoint, admin staff‑user CRUD, guest checkout, `GET /orders/admin/:id`,
  "my reviews" list, loyalty points accrual, notifications, marketing campaigns,
  referrals, product rating aggregation, a real payment gateway.
- No `helmet` / rate limiting / request‑validation library; validation is ad‑hoc.
- `npm test` is still the placeholder script.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `node src/sync.js` | Sync models → database schema |
| `node src/seed.js` | Seed demo data |
