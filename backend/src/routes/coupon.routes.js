import { Router } from "express";
import {
  getCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listRules,
  createRule,
  updateRule,
  deleteRule
} from "../controllers/coupon.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { couponSchema } from "../validators/catalog.validators.js";

const router = Router();

// Validate coupon route (available to logged in customers)
router.route("/validate").post(verifyJWT, validateCoupon);

// Admin-only CRUD routes
router.use(verifyJWT);
router.use(verifyAdmin);

// Automatic discount rules — declared before "/admin/:id" so "rules" isn't read as an id
router.route("/admin/rules")
  .get(listRules)
  .post(createRule);
router.route("/admin/rules/:id")
  .put(updateRule)
  .delete(deleteRule);

router.route("/admin")
  .get(getCoupons)
  .post(validateBody(couponSchema), createCoupon);

router.route("/admin/:id")
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
