import { Router } from "express";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addressSchema, addressUpdateSchema } from "../validators/catalog.validators.js";

const router = Router();

// Protect all address routes
router.use(verifyJWT);

router.route("/")
  .get(getAddresses)
  .post(validateBody(addressSchema), createAddress);

router.route("/:id")
  .put(validateBody(addressUpdateSchema), updateAddress)
  .delete(deleteAddress);

export default router;
