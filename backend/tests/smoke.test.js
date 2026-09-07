import { describe, it, expect, beforeAll } from "vitest";
import { api, loginAdmin, loginCustomer, auth } from "./helpers.js";

/*
 * Read-only smoke tests. They exercise routing, middleware, auth, validation and
 * the response envelope against the running dev database without mutating data.
 */

describe("infrastructure", () => {
  it("GET /health returns the envelope", async () => {
    const res = await api().get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: expect.any(String) });
  });

  it("unknown route → JSON 404", async () => {
    const res = await api().get("/api/v1/definitely-not-a-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("sends rate-limit headers", async () => {
    const res = await api().get("/api/v1/products");
    expect(res.headers).toHaveProperty("ratelimit-limit");
  });

  it("sets helmet security headers", async () => {
    const res = await api().get("/health");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
  });
});

describe("auth", () => {
  it("rejects a malformed register body with field errors", async () => {
    const res = await api().post("/api/v1/auth/register").send({ email: "nope", password: "x" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["firstName", "email", "password"]));
  });

  it("logs the seeded admin in", async () => {
    const token = await loginAdmin();
    expect(typeof token).toBe("string");
  });

  it("blocks unauthenticated access to /users/me", async () => {
    const res = await api().get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });
});

describe("RBAC", () => {
  let adminToken, customerToken;
  beforeAll(async () => {
    adminToken = await loginAdmin();
    customerToken = await loginCustomer();
  });

  it("lets an admin read the analytics dashboard", async () => {
    const res = await api().get("/api/v1/analytics/dashboard").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("sparklines");
    expect(res.body.data).toHaveProperty("lowStock");
  });

  it("forbids a customer from the analytics dashboard", async () => {
    const res = await api().get("/api/v1/analytics/dashboard").set(auth(customerToken));
    expect(res.status).toBe(403);
  });

  it("forbids a customer from listing staff", async () => {
    const res = await api().get("/api/v1/users/admin/users").set(auth(customerToken));
    expect(res.status).toBe(403);
  });
});

describe("write-route validation", () => {
  let adminToken;
  beforeAll(async () => { adminToken = await loginAdmin(); });

  it("rejects a blog post with no content (400 + field error)", async () => {
    const res = await api().post("/api/v1/blogs/admin").set(auth(adminToken)).send({ title: "Hi" });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain("content");
  });

  it("rejects a staff user with a bad role", async () => {
    const res = await api()
      .post("/api/v1/users/admin/users")
      .set(auth(adminToken))
      .send({ firstName: "A", lastName: "B", email: "x@y.com", password: "longenough", role: "WIZARD" });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain("role");
  });

  it("rejects an inventory update with an empty body", async () => {
    const res = await api()
      .put("/api/v1/inventory/00000000-0000-0000-0000-000000000000")
      .set(auth(adminToken))
      .send({});
    expect(res.status).toBe(400);
  });

  it("rejects a profile update with nothing to change", async () => {
    const customerToken = await loginCustomer();
    const res = await api().put("/api/v1/users/me").set(auth(customerToken)).send({});
    expect(res.status).toBe(400);
  });
});

describe("catalog", () => {
  it("lists products with pagination + ratings", async () => {
    const res = await api().get("/api/v1/products?limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("pagination");
    for (const p of res.body.data.products) {
      expect(p).toHaveProperty("avgRating");
      expect(p).toHaveProperty("reviewCount");
    }
  });

  it("fetches a single product by slug AND by UUID id", async () => {
    const list = await api().get("/api/v1/products?limit=1");
    const p = list.body.data.products[0];
    expect(p).toBeTruthy();

    const bySlug = await api().get(`/api/v1/products/${p.slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.id).toBe(p.id);

    const byId = await api().get(`/api/v1/products/${p.id}`);
    expect(byId.status).toBe(200);
    expect(byId.body.data.id).toBe(p.id);
  });

  it("lists categories with productCount", async () => {
    const res = await api().get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty("productCount");
  });

  it("serves active banners publicly", async () => {
    const res = await api().get("/api/v1/marketing/banners/active");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("checkout validation", () => {
  let customerToken;
  beforeAll(async () => { customerToken = await loginCustomer(); });

  it("rejects a checkout with bad ids / quantities", async () => {
    const res = await api()
      .post("/api/v1/orders/checkout")
      .set(auth(customerToken))
      .send({ items: [{ productVariantId: "x", quantity: 0 }], shippingAddressId: "y", billingAddressId: "z" });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("allows an unauthenticated (guest) checkout request through the auth layer", async () => {
    // No token: it must NOT 401. It fails validation instead (no addresses).
    const res = await api()
      .post("/api/v1/orders/checkout")
      .send({ items: [{ productVariantId: "00000000-0000-0000-0000-000000000000", quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
  });

  it("rejects a guest checkout that omits guestEmail", async () => {
    const addr = { addressLine1: "1 Test St", city: "Kathmandu", postalCode: "44600", country: "Nepal" };
    const res = await api()
      .post("/api/v1/orders/checkout")
      .send({
        items: [{ productVariantId: "00000000-0000-0000-0000-000000000000", quantity: 1 }],
        shippingAddress: addr,
        billingAddress: addr,
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain("guestEmail");
  });
});

describe("customer features", () => {
  let customerToken;
  beforeAll(async () => { customerToken = await loginCustomer(); });

  it("returns a loyalty summary", async () => {
    const res = await api().get("/api/v1/loyalty/me").set(auth(customerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("balance");
    expect(res.body.data).toHaveProperty("tier");
  });

  it("returns a referral code + link", async () => {
    const res = await api().get("/api/v1/referrals/me").set(auth(customerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.code).toMatch(/^[A-Z0-9]{6,}$/);
    expect(res.body.data.link).toContain("ref=");
  });

  it("lists notifications with an unread count", async () => {
    const res = await api().get("/api/v1/notifications").set(auth(customerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("unreadCount");
  });

  it("payment-method validation tolerates the form's blank expiry strings", async () => {
    // The form always submits expiryMonth/expiryYear (empty for non-cards).
    // A blank must not surface as an expiryMonth validation error — the request
    // should fall through to the controller's card-number check instead.
    const res = await api()
      .post("/api/v1/payment-methods")
      .set(auth(customerToken))
      .send({ type: "CARD", cardNumber: "123", expiryMonth: "", expiryYear: "", walletId: "" });
    expect(res.status).toBe(400);
    const fields = (res.body.errors || []).map((e) => e.field);
    expect(fields).not.toContain("expiryMonth");
    expect(fields).not.toContain("expiryYear");
  });
});
