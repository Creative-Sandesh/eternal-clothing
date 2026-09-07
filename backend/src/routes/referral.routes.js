import { Router } from "express";
import { getMyReferrals } from "../controllers/referral.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/me").get(getMyReferrals);

export default router;
