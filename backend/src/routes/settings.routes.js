import { Router } from "express";
import { getAllSettings, getSetting, upsertSetting } from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public: read all settings (e.g. for frontend to load shipping rates, tax rates etc.)
router.route("/").get(getAllSettings);
router.route("/:key").get(getSetting);

// Admin-only: create or update a setting
router.use(verifyJWT);
router.use(verifyAdmin);
router.route("/:key").put(upsertSetting);

export default router;
