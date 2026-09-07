import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getProductByIdForAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { uploadImages } from "../middlewares/upload.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { productCreateSchema, productUpdateSchema } from "../validators/catalog.validators.js";

const router = Router();

// Admin routes — declared before "/:slug" so the literal segment always wins
router.route("/admin").post(verifyJWT, verifyAdmin, validateBody(productCreateSchema), createProduct);
router.route("/admin/upload").post(verifyJWT, verifyAdmin, uploadImages, uploadProductImages);
router.route("/admin/:id")
  .get(verifyJWT, verifyAdmin, getProductByIdForAdmin)
  .put(verifyJWT, verifyAdmin, validateBody(productUpdateSchema), updateProduct)
  .delete(verifyJWT, verifyAdmin, deleteProduct);

// Public
router.route("/").get(getProducts);
router.route("/:slug").get(getProductBySlug);

export default router;
