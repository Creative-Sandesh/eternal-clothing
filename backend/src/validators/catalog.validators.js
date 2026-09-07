import { z } from "zod";

const uuid = z.string().uuid();
const money = z.coerce.number().nonnegative();

const variantSchema = z.object({
  id: uuid.optional(),
  size: z.string().trim().min(1).max(50),
  colorName: z.string().trim().min(1).max(100),
  colorHex: z.string().trim().max(7).optional().or(z.literal("")),
  sku: z.string().trim().min(1).max(100),
  stockQuantity: z.coerce.number().int().nonnegative().optional(),
  priceOverride: money.optional().nullable(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().optional().or(z.literal("")),
  details: z.any().optional(),
  categoryId: uuid,
  collectionId: uuid.optional().nullable(),
  basePrice: money,
  originalPrice: money.optional().nullable(),
  material: z.string().trim().min(1, "Material is required").max(150),
  skuPrefix: z.string().trim().min(1, "SKU prefix is required").max(50),
  images: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  variants: z.array(variantSchema).optional(),
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional().or(z.literal("")),
  details: z.any().optional(),
  categoryId: uuid.optional(),
  collectionId: uuid.optional().nullable(),
  basePrice: money.optional(),
  originalPrice: money.optional().nullable(),
  material: z.string().trim().min(1).max(150).optional(),
  skuPrefix: z.string().trim().min(1).max(50).optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  variants: z.array(variantSchema).optional(),
  deleteVariantIds: z.array(uuid).optional(),
});

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  description: z.string().trim().optional().or(z.literal("")),
  image_url: z.string().trim().max(500).optional().or(z.literal("")),
});

export const reorderSchema = z.object({
  ids: z.array(uuid).min(1, "ids is required"),
});

export const couponSchema = z.object({
  code: z.string().trim().min(1).max(50),
  discountType: z.string().trim().optional(),
  discountValue: money.optional(),
  minPurchaseAmount: money.optional().nullable(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
}).passthrough();

export const addressSchema = z.object({
  firstName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  addressLine1: z.string().trim().min(1, "Address line 1 is required").max(255),
  addressLine2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(100),
  isDefault: z.boolean().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
}).passthrough();

export const reviewCreateSchema = z.object({
  productId: uuid,
  rating: z.coerce.number().int().min(1, "Rating must be 1–5").max(5, "Rating must be 1–5"),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});
