import { Router } from "express";
import { listMethods, addMethod, setDefault, deleteMethod } from "../controllers/paymentMethod.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(listMethods).post(addMethod);
router.route("/:id/default").put(setDefault);
router.route("/:id").delete(deleteMethod);

export default router;
