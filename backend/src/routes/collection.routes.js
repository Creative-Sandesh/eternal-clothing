import { Router } from "express";
import { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection } from "../controllers/collection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/").get(getCollections);
router.route("/:slug").get(getCollectionBySlug);

// Admin routes
router.route("/admin").post(verifyJWT, verifyAdmin, createCollection);
router.route("/admin/:id")
  .put(verifyJWT, verifyAdmin, updateCollection)
  .delete(verifyJWT, verifyAdmin, deleteCollection);

export default router;
