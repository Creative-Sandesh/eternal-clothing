import { z } from "zod";

const uuid = z.string().uuid("Must be a valid id");

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productVariantId: uuid,
        quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
      })
    )
    .min(1, "Cart is empty"),
  shippingAddressId: uuid,
  billingAddressId: uuid,
  couponCode: z.string().trim().max(50).optional().or(z.literal("")),
  provider: z.string().trim().max(20).optional(),
  paymentMethod: z.string().trim().max(50).optional(), // legacy alias for provider
  paymentToken: z.string().trim().max(255).optional(),
  savedPaymentMethodId: uuid.optional(),
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
