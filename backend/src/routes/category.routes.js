import { Router } from "express";
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/").get(getCategories);
router.route("/:slug").get(getCategoryBySlug);

// Admin routes
router.route("/admin").post(verifyJWT, verifyAdmin, createCategory);
router.route("/admin/:id")
  .put(verifyJWT, verifyAdmin, updateCategory)
  .delete(verifyJWT, verifyAdmin, deleteCategory);

export default router;
