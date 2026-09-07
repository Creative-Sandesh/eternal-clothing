// In dev the Vite proxy forwards "/api" to the backend, so the default relative path
// works with no config. Set VITE_API_URL (e.g. "https://api.example.com") to point the
// SPA at a backend that isn't served from the same origin.
const API_ROOT = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const BASE_URL = `${API_ROOT}/api/v1`;

// Try once to swap an expired access token for a fresh one using the refresh
// cookie / stored refresh token. Returns the new access token or null.
let refreshInFlight = null;
const tryRefresh = async () => {
  if (!refreshInFlight) {
    const stored = localStorage.getItem("refreshToken");
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: stored ? JSON.stringify({ refreshToken: stored }) : undefined,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const at = json?.data?.accessToken;
        if (at) {
          localStorage.setItem("accessToken", at);
          if (json.data.refreshToken) localStorage.setItem("refreshToken", json.data.refreshToken);
        }
        return at || null;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

// Helper to handle fetch with auth headers
const request = async (endpoint, options = {}, _retried = false) => {
  const token = localStorage.getItem("accessToken");
  const isFormData = options.body instanceof FormData;

  const headers = {
    // Let the browser set the multipart boundary for FormData uploads.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // One transparent retry on an expired access token.
    if (response.status === 401 && !_retried && !endpoint.startsWith("/auth/")) {
      const fresh = await tryRefresh();
      if (fresh) return request(endpoint, options, true);
    }
    const error = new Error(data.message || "An API error occurred");
    error.statusCode = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  refresh: () => request("/auth/refresh-token", { method: "POST" }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),
};

// ─── User / Profile ──────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => request("/users/me"),
  updateMe: (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) => request("/users/change-password", { method: "PUT", body: JSON.stringify(body) }),
  getCustomers: () => request("/users/admin/customers"),
  getCustomerById: (id) => request(`/users/admin/customers/${id}`),
  // Staff / team management (admin only)
  getStaff: () => request("/users/admin/users"),
  createStaff: (body) => request("/users/admin/users", { method: "POST", body: JSON.stringify(body) }),
  updateStaff: (id, body) => request(`/users/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteStaff: (id) => request(`/users/admin/users/${id}`, { method: "DELETE" }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ""}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),
  getById: (id) => request(`/products/admin/${id}`),
  createProduct: (body) => request("/products/admin", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/admin/${id}`, { method: "DELETE" }),
  // multipart upload — returns { urls: [...] }
  uploadImages: (files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("images", f));
    return request("/products/admin/upload", { method: "POST", body: fd, headers: {} });
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => request("/categories"),
  getBySlug: (slug) => request(`/categories/${slug}`),
  create: (body) => request("/categories/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/categories/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/categories/admin/${id}`, { method: "DELETE" }),
  reorder: (ids) => request("/categories/admin/reorder", { method: "PUT", body: JSON.stringify({ ids }) }),
};

// ─── Collections ──────────────────────────────────────────────────────────────
export const collectionApi = {
  getAll: () => request("/collections"),
  getBySlug: (slug) => request(`/collections/${slug}`),
  create: (body) => request("/collections/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/collections/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/collections/admin/${id}`, { method: "DELETE" }),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryApi = {
  getAll: () => request("/inventory"),
  getLowStock: (threshold = 10) => request(`/inventory/low-stock?threshold=${threshold}`),
  updateVariant: (id, body) => request(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
  checkout: (body) => request("/orders/checkout", { method: "POST", body: JSON.stringify(body) }),
  verifyPayment: (body) => request("/orders/payments/verify", { method: "POST", body: JSON.stringify(body) }),
  getMyOrders: () => request("/orders/my-orders"),
  getMyOrderById: (id) => request(`/orders/my-orders/${id}`),
  getAdminOrders: () => request("/orders/admin"),
  getAdminOrderById: (id) => request(`/orders/admin/${id}`),
  updateStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: "PUT", body: JSON.stringify(body) }),
  refund: (id) => request(`/orders/admin/${id}/refund`, { method: "POST" }),
  getNotes: (id) => request(`/orders/admin/${id}/notes`),
  addNote: (id, body) => request(`/orders/admin/${id}/notes`, { method: "POST", body: JSON.stringify({ body }) }),
  deleteNote: (noteId) => request(`/orders/admin/notes/${noteId}`, { method: "DELETE" }),
};

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addressApi = {
  getAll: () => request("/addresses"),
  create: (body) => request("/addresses", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/addresses/${id}`, { method: "DELETE" }),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => request("/wishlist"),
  add: (productId) => request("/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
  remove: (productId) => request(`/wishlist/${productId}`, { method: "DELETE" }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewApi = {
  getProductReviews: (productId) => request(`/reviews?productId=${productId}`),
  getMine: () => request("/reviews/me"),
  create: (body) => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  getAdminReviews: () => request("/reviews/admin"),
  updateStatus: (id, status) => request(`/reviews/admin/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id) => request(`/reviews/admin/${id}`, { method: "DELETE" }),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponApi = {
  validate: (code, subtotal) => request("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  getAll: () => request("/coupons/admin"),
  getById: (id) => request(`/coupons/admin/${id}`),
  create: (body) => request("/coupons/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/coupons/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/coupons/admin/${id}`, { method: "DELETE" }),
  // automatic discount rules
  getRules: () => request("/coupons/admin/rules"),
  createRule: (body) => request("/coupons/admin/rules", { method: "POST", body: JSON.stringify(body) }),
  updateRule: (id, body) => request(`/coupons/admin/rules/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRule: (id) => request(`/coupons/admin/rules/${id}`, { method: "DELETE" }),
};

// ─── Blogs ────────────────────────────────────────────────────────────────────
export const blogApi = {
  getAll: () => request("/blogs"),
  getBySlug: (slug) => request(`/blogs/${slug}`),
  create: (body) => request("/blogs/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/blogs/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/blogs/admin/${id}`, { method: "DELETE" }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => request("/analytics/dashboard"),
  getSales: (period = 30) => request(`/analytics/sales?period=${period}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: () => request("/settings"),
  get: (key) => request(`/settings/${key}`),
  upsert: (key, value) => request(`/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
};

// ─── Loyalty ──────────────────────────────────────────────────────────────────
export const loyaltyApi = {
  getMine: () => request("/loyalty/me"),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  getMine: () => request("/notifications"),
  markRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => request("/notifications/read-all", { method: "PUT" }),
  remove: (id) => request(`/notifications/${id}`, { method: "DELETE" }),
};

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referralApi = {
  getMine: () => request("/referrals/me"),
};

// ─── Saved payment methods ────────────────────────────────────────────────────
export const paymentMethodApi = {
  getAll: () => request("/payment-methods"),
  add: (body) => request("/payment-methods", { method: "POST", body: JSON.stringify(body) }),
  setDefault: (id) => request(`/payment-methods/${id}/default`, { method: "PUT" }),
  remove: (id) => request(`/payment-methods/${id}`, { method: "DELETE" }),
};

// ─── Marketing ────────────────────────────────────────────────────────────────
export const marketingApi = {
  // admin
  getCampaigns: () => request("/marketing/campaigns"),
  createCampaign: (body) => request("/marketing/campaigns", { method: "POST", body: JSON.stringify(body) }),
  updateCampaign: (id, body) => request(`/marketing/campaigns/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCampaign: (id) => request(`/marketing/campaigns/${id}`, { method: "DELETE" }),
  sendCampaign: (id) => request(`/marketing/campaigns/${id}/send`, { method: "POST" }),
  getBanners: () => request("/marketing/banners"),
  createBanner: (body) => request("/marketing/banners", { method: "POST", body: JSON.stringify(body) }),
  updateBanner: (id, body) => request(`/marketing/banners/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBanner: (id) => request(`/marketing/banners/${id}`, { method: "DELETE" }),
  getSubscribers: () => request("/marketing/subscribers"),
  // public
  getActiveBanners: (position) => request(`/marketing/banners/active${position ? `?position=${position}` : ""}`),
  subscribe: (email, source) => request("/marketing/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email, source }) }),
  unsubscribe: (email) => request("/marketing/newsletter/unsubscribe", { method: "POST", body: JSON.stringify({ email }) }),
};

// ─── Normalizer ───────────────────────────────────────────────────────────────
export const normalizeProduct = (p) => {
  if (!p) return null;
  if (p.id && typeof p.id === "string" && p.id.startsWith("p")) {
    return p;
  }
  const images = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
  const basePrice = Number(p.basePrice || p.price || 0);
  const originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
  
  let colors = p.colors || [];
  let sizes = p.sizes || [];
  let inStock = p.inStock !== undefined ? p.inStock : true;
  
  const variants = p.variants || p.ProductVariants || [];
  if (Array.isArray(variants) && variants.length > 0) {
    colors = [...new Map(variants.map((v) => [v.colorName ?? v.color_name, { name: v.colorName ?? v.color_name, hex: v.colorHex ?? v.color_hex }])).values()];
    sizes = [...new Set(variants.map((v) => v.size))];
    inStock = variants.some((v) => (v.stockQuantity ?? v.stock_quantity) > 0);
  }

  return {
    ...p,
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: basePrice,
    originalPrice,
    isSale: Boolean(originalPrice && originalPrice > basePrice),
    image: images[0] || "",
    images,
    category: p.category?.name ?? p.Category?.name ?? p.category ?? "",
    collection: p.collection?.name ?? p.Collection?.name ?? p.collection ?? "",
    material: p.material || "",
    colors,
    sizes,
    inStock,
    rating: Number(p.avgRating ?? p.rating ?? 0),
    reviewCount: Number(p.reviewCount ?? 0),
    isNew: p.isNew || false,
    isBestSeller: p.isBestSeller || false,
  };
};
