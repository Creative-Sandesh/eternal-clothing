import { Router } from "express";
import { getInventory, getLowStock, updateVariantStock } from "../controllers/inventory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Secure all inventory endpoints for Admin/Staff only
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/").get(getInventory);
router.route("/low-stock").get(getLowStock);
router.route("/:id").put(updateVariantStock);

export default router;
