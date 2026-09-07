import { Router } from "express";
import {
  getCurrentProfile,
  updateCurrentProfile,
  changePassword,
  getCustomers,
  getCustomerById,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// All user routes require authentication
router.use(verifyJWT);

router.route("/me")
  .get(getCurrentProfile)
  .put(updateCurrentProfile);

router.route("/change-password").put(changePassword);

// Admin-only: customers
router.route("/admin/customers").get(verifyAdmin, getCustomers);
router.route("/admin/customers/:id").get(verifyAdmin, getCustomerById);

// Admin-only: staff / team management
router.route("/admin/users")
  .get(verifyAdmin, getStaffUsers)
  .post(verifyAdmin, createStaffUser);

router.route("/admin/users/:id")
  .put(verifyAdmin, updateStaffUser)
  .delete(verifyAdmin, deleteStaffUser);

export default router;
