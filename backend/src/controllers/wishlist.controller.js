import Wishlist from "../models/wishlist.model.js";
import WishlistItem from "../models/wishlistItem.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getWishlist = asyncHandler(async (req, res) => {
  // Ensure a wishlist exists for the user
  const [wishlist] = await Wishlist.findOrCreate({
    where: { userId: req.user.id }
  });

  const items = await WishlistItem.findAll({
    where: { wishlistId: wishlist.id },
    include: [{
      model: Product,
      as: "product",
      attributes: ["id", "name", "slug", "basePrice", "images", "status"]
    }],
    order: [["addedAt", "DESC"]]
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { wishlistId: wishlist.id, items },
      "Wishlist fetched successfully"
    )
  );
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // Validate product exists
  const productExists = await Product.findByPk(productId);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  // Get or create wishlist
  const [wishlist] = await Wishlist.findOrCreate({
    where: { userId: req.user.id }
  });

  // Check if product is already in the wishlist
  const existingItem = await WishlistItem.findOne({
    where: { wishlistId: wishlist.id, productId }
  });

  if (existingItem) {
    return res
      .status(200)
      .json(new ApiResponse(200, existingItem, "Product is already in your wishlist"));
  }

  const wishlistItem = await WishlistItem.create({
    wishlistId: wishlist.id,
    productId
  });

  return res
    .status(201)
    .json(new ApiResponse(201, wishlistItem, "Product added to wishlist successfully"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ where: { userId: req.user.id } });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const deletedCount = await WishlistItem.destroy({
    where: { wishlistId: wishlist.id, productId }
  });

  if (deletedCount === 0) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product removed from wishlist successfully"));
});

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
