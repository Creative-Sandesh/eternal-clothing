import { Op } from "sequelize";
import Coupon from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || subtotal === undefined) {
    throw new ApiError(400, "Coupon code and order subtotal are required");
  }

  const coupon = await Coupon.findOne({ where: { code } });
  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "This coupon is no longer active");
  }

  const now = new Date();
  if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
    throw new ApiError(400, "This coupon has expired or is not yet valid");
  }

  if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its maximum usage limit");
  }

  const numericSubtotal = parseFloat(subtotal);
  if (coupon.minPurchaseAmount && numericSubtotal < parseFloat(coupon.minPurchaseAmount)) {
    throw new ApiError(
      400,
      `Minimum purchase amount of $${coupon.minPurchaseAmount} is required to use this coupon`
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = numericSubtotal * (parseFloat(coupon.discountValue) / 100);
  } else if (coupon.discountType === "FIXED_AMOUNT") {
    discountAmount = parseFloat(coupon.discountValue);
  }

  // Cap discount at subtotal
  if (discountAmount > numericSubtotal) {
    discountAmount = numericSubtotal;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2))
      },
      "Coupon validated successfully"
    )
  );
});

const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    validFrom,
    validUntil,
    usageLimit,
    isActive = true
  } = req.body;

  if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
    throw new ApiError(400, "Missing required coupon details");
  }

  // Check unique code
  const existing = await Coupon.findOne({ where: { code } });
  if (existing) {
    throw new ApiError(409, "Coupon with this code already exists");
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue,
    minPurchaseAmount,
    validFrom,
    validUntil,
    usageLimit,
    timesUsed: 0,
    isActive
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    validFrom,
    validUntil,
    usageLimit,
    isActive
  } = req.body;

  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const updates = {};
  if (code !== undefined) {
    updates.code = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ where: { code: updates.code } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Another coupon with this code already exists");
    }
  }
  if (discountType !== undefined) updates.discountType = discountType;
  if (discountValue !== undefined) updates.discountValue = discountValue;
  if (minPurchaseAmount !== undefined) updates.minPurchaseAmount = minPurchaseAmount;
  if (validFrom !== undefined) updates.validFrom = validFrom;
  if (validUntil !== undefined) updates.validUntil = validUntil;
  if (usageLimit !== undefined) updates.usageLimit = usageLimit;
  if (isActive !== undefined) updates.isActive = isActive;

  await coupon.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await coupon.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Coupon deleted successfully"));
});

export {
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
