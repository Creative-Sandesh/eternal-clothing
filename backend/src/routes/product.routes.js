import { Router } from "express";
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/").get(getProducts);
router.route("/:slug").get(getProductBySlug);

// Admin routes
router.route("/admin").post(verifyJWT, verifyAdmin, createProduct);
router.route("/admin/:id")
  .put(verifyJWT, verifyAdmin, updateProduct)
  .delete(verifyJWT, verifyAdmin, deleteProduct);

export default router;
