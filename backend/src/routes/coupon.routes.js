import { Router } from "express";
import { validateCoupon, createCoupon, updateCoupon, deleteCoupon } from "../controllers/coupon.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Validate coupon route (available to logged in customers)
router.route("/validate").post(verifyJWT, validateCoupon);

// Admin-only CRUD routes
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/admin").post(createCoupon);
router.route("/admin/:id")
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
