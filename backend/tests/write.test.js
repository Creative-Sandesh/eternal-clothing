import { describe, it, expect } from "vitest";
import { api } from "./helpers.js";

/*
 * Write-path lifecycle tests. These MUTATE the database, so they only run when
 * TEST_DB_URI points at an isolated schema (see .env.test.example) — otherwise
 * the whole block is skipped and the suite stays read-only against dev.
 */
const isolated = Boolean(process.env.TEST_DB_URI);

describe.skipIf(!isolated)("write lifecycle (isolated DB only)", () => {
  const email = `wt+${Date.now()}@example.com`;
  const password = "Sup3rSecret!";
  let token;

  it("registers a new customer", async () => {
    const res = await api()
      .post("/api/v1/auth/register")
      .send({ firstName: "Write", lastName: "Test", email, password });
    expect(res.status).toBe(201);
  });

  it("logs that customer in", async () => {
    const res = await api().post("/api/v1/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(typeof token).toBe("string");
  });

  it("updates the profile", async () => {
    const res = await api()
      .put("/api/v1/users/me")
      .set({ Authorization: `Bearer ${token}` })
      .send({ firstName: "Renamed" });
    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Renamed");
  });

  it("adds and removes a wishlist item", async () => {
    const list = await api().get("/api/v1/products?limit=1");
    const productId = list.body.data.products[0].id;

    const add = await api()
      .post("/api/v1/wishlist")
      .set({ Authorization: `Bearer ${token}` })
      .send({ productId });
    expect([200, 201]).toContain(add.status);

    const del = await api()
      .delete(`/api/v1/wishlist/${productId}`)
      .set({ Authorization: `Bearer ${token}` });
    expect(del.status).toBe(200);
  });

  it("rejects a checkout with an empty cart (write-guard sanity)", async () => {
    const res = await api()
      .post("/api/v1/orders/checkout")
      .set({ Authorization: `Bearer ${token}` })
      .send({ items: [], shippingAddressId: "x", billingAddressId: "y" });
    expect(res.status).toBe(400);
  });
});
