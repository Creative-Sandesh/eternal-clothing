import { Op } from "sequelize";
import Coupon from "../models/coupon.model.js";
import DiscountRule from "../models/discountRule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Automatic discount rules
|--------------------------------------------------------------------------
*/

const listRules = asyncHandler(async (req, res) => {
  const rules = await DiscountRule.findAll({ order: [["priority", "DESC"], ["createdAt", "ASC"]] });
  return res.status(200).json(new ApiResponse(200, rules, "Discount rules fetched"));
});

const RULE_FIELDS = ["name", "trigger", "threshold", "reward", "rewardValue", "isActive", "priority"];

const createRule = asyncHandler(async (req, res) => {
  if (!req.body.name) throw new ApiError(400, "Rule name is required");
  const data = {};
  for (const f of RULE_FIELDS) if (req.body[f] !== undefined) data[f] = req.body[f];
  const rule = await DiscountRule.create(data);
  return res.status(201).json(new ApiResponse(201, rule, "Discount rule created"));
});

const updateRule = asyncHandler(async (req, res) => {
  const rule = await DiscountRule.findByPk(req.params.id);
  if (!rule) throw new ApiError(404, "Discount rule not found");
  const data = {};
  for (const f of RULE_FIELDS) if (req.body[f] !== undefined) data[f] = req.body[f];
  await rule.update(data);
  return res.status(200).json(new ApiResponse(200, rule, "Discount rule updated"));
});

const deleteRule = asyncHandler(async (req, res) => {
  const deleted = await DiscountRule.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, "Discount rule not found");
  return res.status(200).json(new ApiResponse(200, {}, "Discount rule deleted"));
});

// Admin: list every coupon (newest first), with a derived status field for the UI.
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findAll({ order: [["validFrom", "DESC"]] });

  const now = new Date();
  const withStatus = coupons.map((c) => {
    const plain = c.toJSON();
    let status = "ACTIVE";
    if (!plain.isActive) status = "INACTIVE";
    else if (plain.validUntil && new Date(plain.validUntil) < now) status = "EXPIRED";
    else if (plain.validFrom && new Date(plain.validFrom) > now) status = "SCHEDULED";
    else if (plain.usageLimit !== null && plain.timesUsed >= plain.usageLimit) status = "EXHAUSTED";
    return { ...plain, status };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, withStatus, "Coupons fetched successfully"));
});

// Admin: single coupon by id (for the edit form).
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon fetched successfully"));
});

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

// Accept a few friendly aliases so the admin UI and API stay in sync.
const normalizeDiscountType = (value) => {
  if (!value) return value;
  const v = String(value).toUpperCase();
  if (v === "FIXED" || v === "FIXED_AMOUNT" || v === "AMOUNT") return "FIXED_AMOUNT";
  if (v === "PERCENT" || v === "PERCENTAGE") return "PERCENTAGE";
  return v;
};

const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountValue,
    minPurchaseAmount,
    validUntil,
    isActive = true
  } = req.body;

  const discountType = normalizeDiscountType(req.body.discountType);
  // Default validity window to "now" so the UI can omit a start date.
  const validFrom = req.body.validFrom || new Date().toISOString();
  const usageLimit =
    req.body.usageLimit ?? req.body.maxUses ?? null;

  if (!code || !discountType || discountValue === undefined || !validUntil) {
    throw new ApiError(400, "code, discountType, discountValue and validUntil are required");
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
    discountValue,
    minPurchaseAmount,
    validFrom,
    validUntil,
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
  if (req.body.discountType !== undefined) updates.discountType = normalizeDiscountType(req.body.discountType);
  if (discountValue !== undefined) updates.discountValue = discountValue;
  if (minPurchaseAmount !== undefined) updates.minPurchaseAmount = minPurchaseAmount;
  if (validFrom !== undefined) updates.validFrom = validFrom;
  if (validUntil !== undefined) updates.validUntil = validUntil;
  if (req.body.usageLimit !== undefined || req.body.maxUses !== undefined) {
    updates.usageLimit = req.body.usageLimit ?? req.body.maxUses ?? null;
  }
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
  getCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listRules,
  createRule,
  updateRule,
  deleteRule
};
