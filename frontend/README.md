# Eternal — Frontend

Single‑page app for the **Eternal** clothing store: a full customer storefront plus an
admin dashboard. Talks to the [`backend`](../backend) REST API at `/api/v1`.

- **Framework:** React 19 (React Compiler enabled)
- **Build tool:** Vite 8
- **Routing:** React Router 7 (`createBrowserRouter`, lazy routes)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Animation:** `framer-motion`
- **Charts:** `recharts`
- **Icons:** `react-icons`
- **State:** React Context (auth, cart, wishlist) — no external store

---

## Getting started

### Prerequisites

- Node.js 18+
- The backend running on `http://127.0.0.1:8000` (see `../backend/README.md`)

### Install & run

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Vite proxies every `/api` request to `http://127.0.0.1:8000` (see `vite.config.js`), so
no CORS setup or env file is needed in development.

### Build

```bash
npm run build          # → dist/
npm run preview        # serve the production build
npm run lint           # eslint
```

The dev/preview server port can be overridden with the `PORT` env var (defaults to
`5173`, `strictPort` is on).

---

## Project structure

```
frontend/src/
├── main.jsx                 # ReactDOM root
├── App.jsx                  # Auth → Cart → Wishlist providers → RouterProvider
├── index.css                # Tailwind entry
├── routes/
│   └── index.jsx            # all routes, grouped by layout
├── layouts/
│   ├── CustomerLayout.jsx   # public storefront shell (navbar + footer + cart drawer)
│   ├── AccountLayout.jsx    # logged‑in "/account/*" shell
│   └── AdminLayout.jsx      # "/admin/*" dashboard shell
├── pages/
│   ├── customer/            # ~40 storefront + account pages
│   └── admin/               # ~17 dashboard pages
├── components/
│   ├── layout/              # Navbar, Footer, CartDrawer
│   ├── ui/                  # Button, Input, Modal, Drawer, Tabs, Toast, ProductCard, …
│   └── ScrollToTop.jsx
├── context/
│   ├── AuthContext.jsx      # user, login/logout/register, isAdmin, session restore
│   ├── CartContext.jsx      # cart line items (client‑side)
│   └── WishlistContext.jsx  # wishlist, backed by /api/v1/wishlist
├── services/
│   └── api.js               # typed fetch wrappers for every backend resource + normalizeProduct()
└── data/                    # static seed/fallback data (products, orders, reviews, …)
```

---

## Routing

Routes are declared in `src/routes/index.jsx`, split across three layouts:

| Layout | Prefix | Examples |
|--------|--------|----------|
| `CustomerLayout` | `/` | `/shop`, `/product/:id`, `/collections/:slug`, `/cart`, `/checkout`, `/blog/:slug`, `/login`, `/register` |
| `AccountLayout` | `/account` | `/account`, `/account/orders/:id`, `/account/profile`, `/account/addresses`, `/account/wishlist`, `/account/reviews` |
| `AdminLayout` | `/admin` | `/admin`, `/admin/products`, `/admin/products/:id/edit`, `/admin/orders/:id`, `/admin/inventory`, `/admin/analytics`, `/admin/settings` |

Pages are `React.lazy`‑loaded. Unknown storefront paths fall through to `NotFoundPage`.

> The account and admin route groups are **not currently wrapped in a route guard** —
> `AuthContext` exposes `isAuthenticated` / `isAdmin`, but redirect protection is
> enforced (if at all) inside individual layouts/pages. Add a guard component if you
> need hard protection.

---

## API layer

`src/services/api.js` is the single point of contact with the backend.

- `BASE_URL = "/api/v1"` (proxied by Vite in dev).
- The `request()` helper attaches `Authorization: Bearer <token>` from
  `localStorage.accessToken`, sends `credentials: "include"` for cookie auth, parses the
  `{ data, message, success }` envelope, and throws an `Error` (with `statusCode` /
  `errors`) on non‑2xx.
- Exported groups: `authApi`, `userApi`, `productApi`, `categoryApi`, `collectionApi`,
  `inventoryApi`, `orderApi`, `addressApi`, `wishlistApi`, `reviewApi`, `couponApi`,
  `blogApi`, `analyticsApi`, `settingsApi`.
- `normalizeProduct(p)` maps a backend product (snake/camel fields, `variants`, included
  `category`/`collection`) into the flat shape the UI components expect
  (`price`, `image`, `colors`, `sizes`, `inStock`, `rating`, …).

### Auth flow

1. `login()` calls `POST /auth/login`; on success stores `accessToken` / `refreshToken`
   in `localStorage` and sets the user in context.
2. On app mount, `AuthContext` re‑validates a stored token via `GET /users/me` and
   clears it if rejected.
3. `logout()` calls `POST /auth/logout` and clears local storage.

---

## Notes & gaps

- `src/data/*.js` holds static data. Most pages now call the live API; these files remain
  as fallback/reference and can be removed once every page is migrated.
- Some frontend pages have no backend counterpart yet (`ForgotPasswordPage`,
  `ResetPasswordPage`, `LoyaltyPage`, `NotificationsPage`, `ReferralPage`,
  `PaymentMethodsPage`, `MarketingPage`, admin `UsersPage`, `StoreLocatorPage`) — see the
  backend README's TODO list.
- Product ratings/review counts are not aggregated by the API, so `rating` currently
  renders as `0` until the backend provides `avgRating` / `reviewCount`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
