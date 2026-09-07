import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters").max(128);
const email = z.string().trim().toLowerCase().email("A valid email is required");
const name = z.string().trim().min(1).max(100);
const phone = z.string().trim().max(30).optional().or(z.literal(""));

// PUT /users/me — lenient on the name fields (blanking a name was already
// possible before validation; this schema just bounds the request shape).
export const profileUpdateSchema = z
  .object({
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    phoneNumber: phone,
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update" });

// PUT /users/change-password
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});

// POST /users/admin/users
export const staffCreateSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  password,
  phoneNumber: phone,
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

// PUT /users/admin/users/:id
export const staffUpdateSchema = z
  .object({
    firstName: name.optional(),
    lastName: name.optional(),
    phoneNumber: phone,
    role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update" });

// ── Saved payment methods ──────────────────────────────────────────────────
// The form always submits every field (empty strings for the ones that don't
// apply to the chosen type), so numeric fields must tolerate "".
const blankableInt = (schema) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());

export const paymentMethodSchema = z
  .object({
    type: z.enum(["CARD", "ESEWA", "KHALTI", "COD"]),
    label: z.string().trim().max(100).optional().or(z.literal("")),
    brand: z.string().trim().max(40).optional().or(z.literal("")),
    last4: z.string().trim().max(4).optional().or(z.literal("")),
    expiryMonth: blankableInt(z.coerce.number().int().min(1).max(12)),
    expiryYear: blankableInt(z.coerce.number().int().min(2000).max(2100)),
    cardNumber: z.string().trim().max(25).optional().or(z.literal("")),
    walletId: z.string().trim().max(60).optional().or(z.literal("")),
    isDefault: z.boolean().optional(),
  })
  .passthrough();
