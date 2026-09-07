import { Op } from "sequelize";
import Campaign from "../models/campaign.model.js";
import Banner from "../models/banner.model.js";
import NewsletterSubscriber from "../models/newsletterSubscriber.model.js";
import User from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail } from "../utils/mailer.js";

/*
|--------------------------------------------------------------------------
| Campaigns
|--------------------------------------------------------------------------
*/

const listCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.findAll({ order: [["createdAt", "DESC"]] });
  return res.status(200).json(new ApiResponse(200, campaigns, "Campaigns fetched"));
});

const createCampaign = asyncHandler(async (req, res) => {
  const { name, type = "EMAIL", subject, body, audience = "SUBSCRIBERS", scheduledAt, status } = req.body;
  if (!name) throw new ApiError(400, "Campaign name is required");

  const campaign = await Campaign.create({
    name,
    type: String(type).toUpperCase(),
    subject,
    body,
    audience: String(audience).toUpperCase(),
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    status: status ? String(status).toUpperCase() : scheduledAt ? "SCHEDULED" : "DRAFT",
  });
  return res.status(201).json(new ApiResponse(201, campaign, "Campaign created"));
});

const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) throw new ApiError(404, "Campaign not found");
  if (["SENDING", "COMPLETED"].includes(campaign.status)) {
    throw new ApiError(400, "A sent campaign cannot be edited");
  }

  const { name, type, subject, body, audience, scheduledAt, status } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (type !== undefined) updates.type = String(type).toUpperCase();
  if (subject !== undefined) updates.subject = subject;
  if (body !== undefined) updates.body = body;
  if (audience !== undefined) updates.audience = String(audience).toUpperCase();
  if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  if (status !== undefined) updates.status = String(status).toUpperCase();

  await campaign.update(updates);
  return res.status(200).json(new ApiResponse(200, campaign, "Campaign updated"));
});

const deleteCampaign = asyncHandler(async (req, res) => {
  const deleted = await Campaign.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Campaign not found");
  return res.status(200).json(new ApiResponse(200, {}, "Campaign deleted"));
});

// Resolve the recipient email list for a campaign audience.
const resolveRecipients = async (audience) => {
  if (audience === "CUSTOMERS") {
    const users = await User.findAll({ where: { role: "CUSTOMER" }, attributes: ["email"] });
    return users.map((u) => u.email);
  }
  if (audience === "ALL") {
    const [users, subs] = await Promise.all([
      User.findAll({ attributes: ["email"] }),
      NewsletterSubscriber.findAll({ where: { status: "ACTIVE" }, attributes: ["email"] }),
    ]);
    return [...new Set([...users.map((u) => u.email), ...subs.map((s) => s.email)])];
  }
  // SUBSCRIBERS (default)
  const subs = await NewsletterSubscriber.findAll({ where: { status: "ACTIVE" }, attributes: ["email"] });
  return subs.map((s) => s.email);
};

const sendCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) throw new ApiError(404, "Campaign not found");
  if (["SENDING", "COMPLETED"].includes(campaign.status)) {
    throw new ApiError(400, "Campaign has already been sent");
  }
  if (campaign.type !== "EMAIL") {
    throw new ApiError(400, "Only EMAIL campaigns can be sent from here");
  }
  if (!campaign.subject || !campaign.body) {
    throw new ApiError(400, "Campaign needs a subject and body before sending");
  }

  const recipients = await resolveRecipients(campaign.audience);
  await campaign.update({ status: "SENDING", recipientCount: recipients.length });

  // Fire the emails (best-effort; a real system would queue these).
  let delivered = 0;
  for (const to of recipients) {
    const r = await sendMail({ to, subject: campaign.subject, html: campaign.body, text: campaign.body });
    if (r.delivered) delivered += 1;
  }

  await campaign.update({ status: "COMPLETED", sentAt: new Date() });

  return res.status(200).json(
    new ApiResponse(200, { ...campaign.toJSON(), recipients: recipients.length, delivered },
      `Campaign sent to ${recipients.length} recipient(s)`)
  );
});

/*
|--------------------------------------------------------------------------
| Banners
|--------------------------------------------------------------------------
*/

const listBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "DESC"]] });
  return res.status(200).json(new ApiResponse(200, banners, "Banners fetched"));
});

// Public — active banners for the storefront, optionally filtered by ?position=
const activeBanners = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const where = {
    isActive: true,
    [Op.and]: [
      { [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: today } }] },
      { [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }] },
    ],
  };
  if (req.query.position) where.position = String(req.query.position).toUpperCase();

  const banners = await Banner.findAll({ where, order: [["sortOrder", "ASC"]] });
  return res.status(200).json(new ApiResponse(200, banners, "Active banners fetched"));
});

const createBanner = asyncHandler(async (req, res) => {
  const { position = "TOP_BAR", title, content, ctaText, ctaLink, imageUrl, isActive = true, startDate, endDate, sortOrder = 0 } = req.body;
  if (!title) throw new ApiError(400, "Banner title is required");
  const banner = await Banner.create({
    position: String(position).toUpperCase(), title, content, ctaText, ctaLink, imageUrl,
    isActive, startDate: startDate || null, endDate: endDate || null, sortOrder,
  });
  return res.status(201).json(new ApiResponse(201, banner, "Banner created"));
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");
  const fields = ["position", "title", "content", "ctaText", "ctaLink", "imageUrl", "isActive", "startDate", "endDate", "sortOrder"];
  const updates = {};
  for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
  if (updates.position) updates.position = String(updates.position).toUpperCase();
  await banner.update(updates);
  return res.status(200).json(new ApiResponse(200, banner, "Banner updated"));
});

const deleteBanner = asyncHandler(async (req, res) => {
  const deleted = await Banner.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Banner not found");
  return res.status(200).json(new ApiResponse(200, {}, "Banner deleted"));
});

/*
|--------------------------------------------------------------------------
| Newsletter
|--------------------------------------------------------------------------
*/

const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await NewsletterSubscriber.findAll({ order: [["createdAt", "DESC"]] });
  const activeCount = subscribers.filter((s) => s.status === "ACTIVE").length;
  return res.status(200).json(new ApiResponse(200, { activeCount, subscribers }, "Subscribers fetched"));
});

const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const source = String(req.body.source || "WEBSITE").toUpperCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, "A valid email is required");

  const [sub, created] = await NewsletterSubscriber.findOrCreate({
    where: { email },
    defaults: { email, source, status: "ACTIVE" },
  });
  if (!created && sub.status === "UNSUBSCRIBED") {
    await sub.update({ status: "ACTIVE" });
  }
  return res.status(created ? 201 : 200).json(new ApiResponse(created ? 201 : 200, { email: sub.email }, "Subscribed to the newsletter"));
});

const unsubscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const sub = await NewsletterSubscriber.findOne({ where: { email } });
  if (sub) await sub.update({ status: "UNSUBSCRIBED" });
  return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed"));
});

export {
  listCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign,
  listBanners, activeBanners, createBanner, updateBanner, deleteBanner,
  listSubscribers, subscribe, unsubscribe,
};
