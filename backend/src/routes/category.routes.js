import { Router } from "express";
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory, reorderCategories } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { groupSchema, reorderSchema } from "../validators/catalog.validators.js";

const router = Router();

router.route("/").get(getCategories);

// Admin routes — literal segments before "/:slug"
router.route("/admin").post(verifyJWT, verifyAdmin, validateBody(groupSchema), createCategory);
router.route("/admin/reorder").put(verifyJWT, verifyAdmin, validateBody(reorderSchema), reorderCategories);
router.route("/admin/:id")
  .put(verifyJWT, verifyAdmin, updateCategory)
  .delete(verifyJWT, verifyAdmin, deleteCategory);

router.route("/:slug").get(getCategoryBySlug);

export default router;
