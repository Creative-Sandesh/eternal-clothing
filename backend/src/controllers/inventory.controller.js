import ProductVariant from "../models/productVariant.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getInventory = asyncHandler(async (req, res) => {
  const inventory = await ProductVariant.findAll({
    include: [{ model: Product, as: "product", attributes: ["name", "slug", "basePrice"] }]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, inventory, "Inventory details fetched successfully"));
});

const updateVariantStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stockQuantity, priceOverride } = req.body;

  const variant = await ProductVariant.findByPk(id);
  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  const updates = {};
  if (stockQuantity !== undefined) {
    if (parseInt(stockQuantity) < 0) {
      throw new ApiError(400, "Stock quantity cannot be negative");
    }
    updates.stockQuantity = parseInt(stockQuantity);
  }
  if (priceOverride !== undefined) {
    updates.priceOverride = priceOverride === null ? null : parseFloat(priceOverride);
  }

  await variant.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, variant, "Inventory variant stock updated successfully"));
});

export { getInventory, updateVariantStock };
