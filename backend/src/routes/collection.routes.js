import { Router } from "express";
import { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection } from "../controllers/collection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { groupSchema, groupUpdateSchema } from "../validators/catalog.validators.js";

const router = Router();

router.route("/").get(getCollections);

// Admin routes
router.route("/admin").post(verifyJWT, verifyAdmin, validateBody(groupSchema), createCollection);
router.route("/admin/:id")
  .put(verifyJWT, verifyAdmin, validateBody(groupUpdateSchema), updateCollection)
  .delete(verifyJWT, verifyAdmin, deleteCollection);

router.route("/:slug").get(getCollectionBySlug);

export default router;
