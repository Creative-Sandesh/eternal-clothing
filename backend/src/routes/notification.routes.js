import { Router } from "express";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getMyNotifications);
router.route("/read-all").put(markAllRead);
router.route("/:id/read").put(markRead);
router.route("/:id").delete(deleteNotification);

export default router;
