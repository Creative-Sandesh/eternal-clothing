import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema
} from "../validators/auth.validators.js";

const router = Router();

router.route("/register").post(validateBody(registerSchema), registerUser);
router.route("/login").post(validateBody(loginSchema), loginUser);
router.route("/refresh-token").post(validateBody(refreshSchema), refreshAccessToken);
router.route("/forgot-password").post(validateBody(forgotPasswordSchema), forgotPassword);
router.route("/reset-password").post(validateBody(resetPasswordSchema), resetPassword);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
