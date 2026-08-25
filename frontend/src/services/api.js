const BASE_URL = "/api/v1";

// Helper to handle fetch with auth headers
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
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
};

// ─── User / Profile ──────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => request("/users/me"),
  updateMe: (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) => request("/users/change-password", { method: "PUT", body: JSON.stringify(body) }),
  getCustomers: () => request("/users/admin/customers"),
  getCustomerById: (id) => request(`/users/admin/customers/${id}`),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ""}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),
  createProduct: (body) => request("/products/admin", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/admin/${id}`, { method: "DELETE" }),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => request("/categories"),
  getBySlug: (slug) => request(`/categories/${slug}`),
  create: (body) => request("/categories/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/categories/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/categories/admin/${id}`, { method: "DELETE" }),
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
  updateVariant: (id, body) => request(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
  checkout: (body) => request("/orders/checkout", { method: "POST", body: JSON.stringify(body) }),
  getMyOrders: () => request("/orders/my-orders"),
  getMyOrderById: (id) => request(`/orders/my-orders/${id}`),
  getAdminOrders: () => request("/orders/admin"),
  updateStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: "PUT", body: JSON.stringify(body) }),
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
  create: (body) => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  getAdminReviews: () => request("/reviews/admin"),
  updateStatus: (id, status) => request(`/reviews/admin/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id) => request(`/reviews/admin/${id}`, { method: "DELETE" }),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponApi = {
  validate: (code, subtotal) => request("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  create: (body) => request("/coupons/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/coupons/admin/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/coupons/admin/${id}`, { method: "DELETE" }),
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
