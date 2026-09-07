import { Router } from "express";
import {
  listCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign,
  listBanners, activeBanners, createBanner, updateBanner, deleteBanner,
  listSubscribers, subscribe, unsubscribe,
} from "../controllers/marketing.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.route("/banners/active").get(activeBanners);
router.route("/newsletter/subscribe").post(subscribe);
router.route("/newsletter/unsubscribe").post(unsubscribe);

// ── Admin ───────────────────────────────────────────────────────────────────
router.use(verifyJWT, verifyAdmin);

router.route("/campaigns").get(listCampaigns).post(createCampaign);
router.route("/campaigns/:id").put(updateCampaign).delete(deleteCampaign);
router.route("/campaigns/:id/send").post(sendCampaign);

router.route("/banners").get(listBanners).post(createBanner);
router.route("/banners/:id").put(updateBanner).delete(deleteBanner);

router.route("/subscribers").get(listSubscribers);

export default router;
