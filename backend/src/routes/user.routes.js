import { Router } from "express";
import { getCurrentProfile, updateCurrentProfile, changePassword, getCustomers, getCustomerById } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Customer profile routes (Secured)
router.use(verifyJWT);

router.route("/me")
  .get(getCurrentProfile)
  .put(updateCurrentProfile);

router.route("/change-password").put(changePassword);

// Admin-only customer views
router.route("/admin/customers").get(verifyAdmin, getCustomers);
router.route("/admin/customers/:id").get(verifyAdmin, getCustomerById);

export default router;
