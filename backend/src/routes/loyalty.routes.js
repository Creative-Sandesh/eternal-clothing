import { Router } from "express";
import { getMyLoyalty } from "../controllers/loyalty.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/me").get(getMyLoyalty);

export default router;
