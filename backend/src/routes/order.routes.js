import { Router } from "express";
import { checkoutOrder, getMyOrders, getMyOrderById, getAdminOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Customer only routes
router.route("/checkout").post(verifyJWT, checkoutOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/my-orders/:id").get(verifyJWT, getMyOrderById);

// Admin / Staff routes
router.route("/admin").get(verifyJWT, verifyAdmin, getAdminOrders);
router.route("/admin/:id/status").put(verifyJWT, verifyAdmin, updateOrderStatus);

export default router;
