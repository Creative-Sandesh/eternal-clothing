import { Router } from "express";
import {
  checkoutOrder,
  verifyPayment,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  refundOrder,
  listOrderNotes,
  addOrderNote,
  deleteOrderNote
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { checkoutSchema, verifyPaymentSchema, orderStatusSchema } from "../validators/order.validators.js";

const router = Router();

// Checkout + payment verification support both logged-in and guest callers.
router.route("/checkout").post(optionalAuth, validateBody(checkoutSchema), checkoutOrder);
router.route("/payments/verify").post(optionalAuth, validateBody(verifyPaymentSchema), verifyPayment);

// Customer only routes

router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/my-orders/:id").get(verifyJWT, getMyOrderById);

// Admin / Staff routes
router.route("/admin").get(verifyJWT, verifyAdmin, getAdminOrders);
router.route("/admin/notes/:noteId").delete(verifyJWT, verifyAdmin, deleteOrderNote);
router.route("/admin/:id").get(verifyJWT, verifyAdmin, getAdminOrderById);
router.route("/admin/:id/status").put(verifyJWT, verifyAdmin, validateBody(orderStatusSchema), updateOrderStatus);
router.route("/admin/:id/refund").post(verifyJWT, verifyAdmin, refundOrder);
router.route("/admin/:id/notes")
  .get(verifyJWT, verifyAdmin, listOrderNotes)
  .post(verifyJWT, verifyAdmin, addOrderNote);

export default router;
