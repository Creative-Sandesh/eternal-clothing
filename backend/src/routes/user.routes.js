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
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  profileUpdateSchema,
  changePasswordSchema,
  staffCreateSchema,
  staffUpdateSchema,
} from "../validators/user.validators.js";

const router = Router();

// All user routes require authentication
router.use(verifyJWT);

router.route("/me")
  .get(getCurrentProfile)
  .put(validateBody(profileUpdateSchema), updateCurrentProfile);

router.route("/change-password").put(validateBody(changePasswordSchema), changePassword);

// Admin-only: customers
router.route("/admin/customers").get(verifyAdmin, getCustomers);
router.route("/admin/customers/:id").get(verifyAdmin, getCustomerById);

// Admin-only: staff / team management
router.route("/admin/users")
  .get(verifyAdmin, getStaffUsers)
  .post(verifyAdmin, validateBody(staffCreateSchema), createStaffUser);

router.route("/admin/users/:id")
  .put(verifyAdmin, validateBody(staffUpdateSchema), updateStaffUser)
  .delete(verifyAdmin, deleteStaffUser);

export default router;
