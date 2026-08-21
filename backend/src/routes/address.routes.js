import { Router } from "express";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all address routes
router.use(verifyJWT);

router.route("/")
  .get(getAddresses)
  .post(createAddress);

router.route("/:id")
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
