import { Router } from "express";
import { getDashboardStats, getSalesAnalytics } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// All analytics are admin-only
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/dashboard").get(getDashboardStats);
router.route("/sales").get(getSalesAnalytics);

export default router;
