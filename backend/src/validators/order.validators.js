import { z } from "zod";

const uuid = z.string().uuid("Must be a valid id");

// A shipping/billing address supplied inline by a guest checkout (no account,
// so no saved Address row to reference by id).
const inlineAddress = z.object({
  addressLine1: z.string().trim().min(1, "Address line 1 is required").max(255),
  addressLine2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(100),
});

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productVariantId: uuid,
          quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
        })
      )
      .min(1, "Cart is empty"),
    // Account checkout: reference saved addresses by id.
    shippingAddressId: uuid.optional(),
    billingAddressId: uuid.optional(),
    // Guest checkout: supply the addresses inline plus a contact email.
    shippingAddress: inlineAddress.optional(),
    billingAddress: inlineAddress.optional(),
    guestEmail: z.string().trim().email("A valid email is required").max(150).optional(),
    couponCode: z.string().trim().max(50).optional().or(z.literal("")),
    provider: z.string().trim().max(20).optional(),
    paymentMethod: z.string().trim().max(50).optional(), // legacy alias for provider
    paymentToken: z.string().trim().max(255).optional(),
    savedPaymentMethodId: uuid.optional(),
  })
  .refine(
    (v) =>
      (v.shippingAddressId && v.billingAddressId) ||
      (v.shippingAddress && v.billingAddress),
    { message: "Provide shipping and billing addresses (as saved-address ids, or inline for guest checkout)" }
  )
  .refine((v) => !(v.shippingAddress && v.billingAddress) || !!v.guestEmail, {
    message: "guestEmail is required for guest checkout",
    path: ["guestEmail"],
  });

export const verifyPaymentSchema = z.object({
  orderId: uuid,
  provider: z.string().trim().max(20),
  ref: z.string().trim().max(255).optional().or(z.literal("")),
  guestEmail: z.string().trim().email().max(150).optional(),
});

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export const orderStatusSchema = z
  .object({
    status: z
      .string()
      .transform((s) => s.toUpperCase())
      .refine((s) => STATUSES.includes(s), { message: `status must be one of ${STATUSES.join(", ")}` })
      .optional(),
    trackingNumber: z.string().trim().max(150).optional().or(z.literal("")),
  })
  .refine((v) => v.status !== undefined || v.trackingNumber !== undefined, {
    message: "Provide a status and/or a tracking number",
  });
