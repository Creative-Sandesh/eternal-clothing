import { Router } from "express";
import { getProductReviews, createReview, getAdminReviews, updateReviewStatus, deleteReview } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getProductReviews);

// Customer protected routes
router.route("/").post(verifyJWT, createReview);

// Admin moderation routes
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/admin").get(getAdminReviews);
router.route("/admin/:id/status").put(updateReviewStatus);
router.route("/admin/:id").delete(deleteReview);

export default router;
