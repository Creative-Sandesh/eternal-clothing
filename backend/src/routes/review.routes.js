import { Router } from "express";
import {
  getMyReviews,
  getProductReviews,
  createReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { reviewCreateSchema, reviewStatusSchema } from "../validators/catalog.validators.js";

const router = Router();

// Public: approved reviews for a product (?productId=...)
router.route("/").get(getProductReviews);

// Customer: post a review, list my own reviews
router.route("/").post(verifyJWT, validateBody(reviewCreateSchema), createReview);
router.route("/me").get(verifyJWT, getMyReviews);

// Admin moderation routes
router.route("/admin").get(verifyJWT, verifyAdmin, getAdminReviews);
router.route("/admin/:id/status").put(verifyJWT, verifyAdmin, validateBody(reviewStatusSchema), updateReviewStatus);
router.route("/admin/:id").delete(verifyJWT, verifyAdmin, deleteReview);

export default router;
