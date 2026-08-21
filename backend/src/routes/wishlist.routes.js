import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all wishlist routes
router.use(verifyJWT);

router.route("/")
  .get(getWishlist)
  .post(addToWishlist);

router.route("/:productId")
  .delete(removeFromWishlist);

export default router;
