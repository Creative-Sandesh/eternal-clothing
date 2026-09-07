import PaymentMethod from "../models/paymentMethod.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TYPES = ["CARD", "ESEWA", "KHALTI", "COD"];

const listMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.findAll({
    where: { userId: req.user.id },
    order: [["isDefault", "DESC"], ["createdAt", "DESC"]],
  });
  return res.status(200).json(new ApiResponse(200, methods, "Payment methods fetched"));
});

const addMethod = asyncHandler(async (req, res) => {
  const type = String(req.body.type || "").toUpperCase();
  if (!TYPES.includes(type)) throw new ApiError(400, `type must be one of ${TYPES.join(", ")}`);

  let { label, brand, last4, expiryMonth, expiryYear, cardNumber, walletId } = req.body;

  if (type === "CARD") {
    // Never persist the PAN — derive last4 + a mock token, like a real tokenising gateway.
    const digits = String(cardNumber || "").replace(/\D/g, "");
    if (digits.length < 12) throw new ApiError(400, "A valid card number is required");
    last4 = digits.slice(-4);
    brand = brand || (digits[0] === "4" ? "Visa" : digits[0] === "5" ? "Mastercard" : "Card");
    label = label || `${brand} •••• ${last4}`;
  } else if (type === "ESEWA" || type === "KHALTI") {
    if (!walletId) throw new ApiError(400, "walletId (phone/email) is required");
    brand = type === "ESEWA" ? "eSewa" : "Khalti";
    last4 = String(walletId).slice(-4);
    label = label || `${brand} (${last4})`;
  } else {
    label = label || "Cash on Delivery";
  }

  const isFirst = (await PaymentMethod.count({ where: { userId: req.user.id } })) === 0;
  const makeDefault = isFirst || Boolean(req.body.isDefault);

  if (makeDefault) {
    await PaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  const method = await PaymentMethod.create({
    userId: req.user.id,
    type,
    label,
    brand,
    last4,
    expiryMonth: expiryMonth ? parseInt(expiryMonth, 10) : null,
    expiryYear: expiryYear ? parseInt(expiryYear, 10) : null,
    providerToken: `tok_${type.toLowerCase()}_${Date.now()}`,
    isDefault: makeDefault,
  });

  return res.status(201).json(new ApiResponse(201, method, "Payment method added"));
});

const setDefault = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!method) throw new ApiError(404, "Payment method not found");
  await PaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id } });
  await method.update({ isDefault: true });
  return res.status(200).json(new ApiResponse(200, method, "Default payment method updated"));
});

const deleteMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!method) throw new ApiError(404, "Payment method not found");
  const wasDefault = method.isDefault;
  await method.destroy();
  if (wasDefault) {
    const next = await PaymentMethod.findOne({ where: { userId: req.user.id }, order: [["createdAt", "ASC"]] });
    if (next) await next.update({ isDefault: true });
  }
  return res.status(200).json(new ApiResponse(200, {}, "Payment method removed"));
});

export { listMethods, addMethod, setDefault, deleteMethod };
