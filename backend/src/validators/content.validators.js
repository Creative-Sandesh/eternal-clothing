import { z } from "zod";

// ── Blog posts ──────────────────────────────────────────────────────────────
export const blogCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  content: z.string().trim().min(1, "Content is required"),
  publishedAt: z.string().trim().min(1).optional(),
});

export const blogUpdateSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  content: z.string().trim().min(1).optional(),
  publishedAt: z.string().trim().min(1).optional().nullable(),
});

// ── Settings ────────────────────────────────────────────────────────────────
// The value is a free-form JSON scalar/object. Accept anything (the controller
// rejects a missing value); this schema just guards the request shape.
export const settingUpsertSchema = z.object({
  value: z.any(),
});

// ── Marketing: campaigns ────────────────────────────────────────────────────
const CAMPAIGN_TYPES = ["EMAIL", "SMS", "PUSH"];
const CAMPAIGN_STATUS = ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "CANCELLED"];
const AUDIENCES = ["SUBSCRIBERS", "CUSTOMERS", "ALL"];

export const campaignCreateSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required").max(150),
  type: z.enum(CAMPAIGN_TYPES).optional(),
  subject: z.string().trim().max(255).optional().or(z.literal("")),
  body: z.string().optional().or(z.literal("")),
  audience: z.enum(AUDIENCES).optional(),
  scheduledAt: z.string().trim().min(1).optional().nullable(),
  status: z.enum(CAMPAIGN_STATUS).optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

// ── Marketing: banners ──────────────────────────────────────────────────────
const BANNER_POSITIONS = ["TOP_BAR", "HERO", "CATEGORY", "SALE", "FOOTER"];

export const bannerCreateSchema = z.object({
  title: z.string().trim().min(1, "Banner title is required").max(255),
  position: z.enum(BANNER_POSITIONS).optional(),
  content: z.string().trim().max(1000).optional().or(z.literal("")),
  ctaText: z.string().trim().max(100).optional().or(z.literal("")),
  ctaLink: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  startDate: z.string().trim().min(1).optional().nullable(),
  endDate: z.string().trim().min(1).optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
});

export const bannerUpdateSchema = bannerCreateSchema.partial();

// ── Marketing: newsletter ───────────────────────────────────────────────────
export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required").max(150),
  source: z.string().trim().max(40).optional(),
});

export const unsubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required").max(150),
});
