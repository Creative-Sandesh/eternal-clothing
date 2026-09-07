import { Router } from "express";
import {
  listCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign,
  listBanners, activeBanners, createBanner, updateBanner, deleteBanner,
  listSubscribers, subscribe, unsubscribe,
} from "../controllers/marketing.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  campaignCreateSchema, campaignUpdateSchema,
  bannerCreateSchema, bannerUpdateSchema,
  subscribeSchema, unsubscribeSchema,
} from "../validators/content.validators.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.route("/banners/active").get(activeBanners);
router.route("/newsletter/subscribe").post(validateBody(subscribeSchema), subscribe);
router.route("/newsletter/unsubscribe").post(validateBody(unsubscribeSchema), unsubscribe);

// ── Admin ───────────────────────────────────────────────────────────────────
router.use(verifyJWT, verifyAdmin);

router.route("/campaigns").get(listCampaigns).post(validateBody(campaignCreateSchema), createCampaign);
router.route("/campaigns/:id").put(validateBody(campaignUpdateSchema), updateCampaign).delete(deleteCampaign);
router.route("/campaigns/:id/send").post(sendCampaign);

router.route("/banners").get(listBanners).post(validateBody(bannerCreateSchema), createBanner);
router.route("/banners/:id").put(validateBody(bannerUpdateSchema), updateBanner).delete(deleteBanner);

router.route("/subscribers").get(listSubscribers);

export default router;
