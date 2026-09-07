import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { wishlistAddSchema } from "../validators/catalog.validators.js";

const router = Router();

// Protect all wishlist routes
router.use(verifyJWT);

router.route("/")
  .get(getWishlist)
  .post(validateBody(wishlistAddSchema), addToWishlist);

router.route("/:productId")
  .delete(removeFromWishlist);

export default router;
