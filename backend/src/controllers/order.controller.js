import { Op } from "sequelize";
import sequelize from "../db/index.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Coupon from "../models/coupon.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/users.model.js";
import Setting from "../models/settings.model.js";
import LoyaltyTransaction from "../models/loyaltyTransaction.model.js";
import PaymentMethod from "../models/paymentMethod.model.js";
import OrderNote from "../models/orderNote.model.js";
import DiscountRule from "../models/discountRule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify } from "../utils/notify.js";
import { completeReferralIfPending } from "../utils/referral.js";
import { PROVIDERS, isInstant, isDeferred, isRedirect, buildRedirectPayload, verifyRedirectPayment } from "../utils/payments.js";

// Read numeric store settings with sensible fallbacks.
const getStoreConfig = async () => {
  const rows = await Setting.findAll({
    where: { key: ["shipping_fee_standard", "free_shipping_threshold", "tax_rate_percent", "loyalty_points_per_dollar", "loyalty_points_redemption_rate"] }
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const num = (v, d) => (v === undefined || v === null || isNaN(Number(v)) ? d : Number(v));
  return {
    shippingFee: num(map.shipping_fee_standard, 10),
    freeShippingThreshold: num(map.free_shipping_threshold, 100),
    taxRatePercent: num(map.tax_rate_percent, 0),
    loyaltyPointsPerDollar: num(map.loyalty_points_per_dollar, 1),
    loyaltyRedemptionRate: num(map.loyalty_points_redemption_rate, 0.01)
  };
};

// Shared include tree so every order response carries line-item products and addresses.
const orderInclude = [
  {
    model: OrderItem,
    as: "items",
    include: [
      {
        model: ProductVariant,
        as: "productVariant",
        include: [{ model: Product, as: "product", attributes: ["id", "name", "slug", "images"] }]
      }
    ]
  },
  { model: Payment, as: "payments" },
  { model: Coupon, as: "coupon" },
  { model: Address, as: "shippingAddress" },
  { model: Address, as: "billingAddress" }
];

/**
 * Mark an order's payment settled: order → PROCESSING, accrue loyalty on the
 * subtotal, complete any pending referral. Idempotent-ish (guards on order
 * status / existing loyalty rows). Runs inside the passed transaction.
 * Returns { pointsEarned }.
 */
const settleOrderPayment = async (order, t) => {
  if (order.status === "PENDING") {
    await order.update({ status: "PROCESSING" }, { transaction: t });
  }

  const alreadyAccrued = await LoyaltyTransaction.findOne({
    where: { orderId: order.id, type: "EARNED" },
    transaction: t
  });
  let pointsEarned = 0;
  if (!alreadyAccrued && order.userId) {
    const cfg = await getStoreConfig();
    pointsEarned = Math.floor(Number(order.subtotalAmount) * cfg.loyaltyPointsPerDollar);
    if (pointsEarned > 0) {
      await LoyaltyTransaction.create(
        { userId: order.userId, orderId: order.id, points: pointsEarned, type: "EARNED", description: `Earned on order ${order.orderNumber}` },
        { transaction: t }
      );
      await User.increment({ loyaltyPointsBalance: pointsEarned }, { where: { id: order.userId }, transaction: t });
    }
    await completeReferralIfPending(order.userId, t);
  }
  return { pointsEarned };
};

// Whitelist the columns we accept for an inline (guest) address.
const pickAddress = (a = {}) => ({
  addressLine1: a.addressLine1,
  addressLine2: a.addressLine2 || null,
  city: a.city,
  state: a.state || null,
  postalCode: a.postalCode,
  country: a.country,
});

const checkoutOrder = asyncHandler(async (req, res) => {
  const {
    items, // Array of { productVariantId, quantity }
    shippingAddressId,
    billingAddressId,
    couponCode,
    paymentToken,          // opaque token for CARD/MOCK
    savedPaymentMethodId   // id of a stored PaymentMethod
  } = req.body;

  // Guest checkout: no authenticated user. The order is tied to a contact
  // email and the addresses are supplied inline rather than by saved id.
  const isGuest = !req.user;
  const guestEmail = isGuest ? String(req.body.guestEmail || "").trim().toLowerCase() : null;

  let provider = String(req.body.provider || req.body.paymentMethod || "MOCK").toUpperCase();

  if (!items || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  if (isGuest) {
    if (!guestEmail) {
      throw new ApiError(400, "guestEmail is required for guest checkout");
    }
    if (!req.body.shippingAddress || !req.body.billingAddress) {
      throw new ApiError(400, "Guest checkout requires inline shipping and billing addresses");
    }
  } else if (!shippingAddressId || !billingAddressId) {
    throw new ApiError(400, "Shipping and billing addresses are required");
  }

  // Resolve a saved payment method → provider (account checkouts only).
  let savedMethod = null;
  if (savedPaymentMethodId && !isGuest) {
    savedMethod = await PaymentMethod.findOne({ where: { id: savedPaymentMethodId, userId: req.user.id } });
    if (!savedMethod) throw new ApiError(400, "Saved payment method not found");
    provider = savedMethod.type === "CARD" ? "CARD" : savedMethod.type;
  }
  if (!PROVIDERS.includes(provider)) {
    throw new ApiError(400, `Unsupported payment provider "${provider}"`);
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Run checkout inside a database transaction to prevent race conditions on stock updates
  const createdOrderDetails = await sequelize.transaction(async (t) => {
    // Resolve the shipping/billing addresses. Guests get fresh rows with no
    // userId; account holders reference their own saved addresses.
    let resolvedShippingId, resolvedBillingId;
    if (isGuest) {
      const sa = await Address.create({ ...pickAddress(req.body.shippingAddress), userId: null }, { transaction: t });
      const ba = await Address.create({ ...pickAddress(req.body.billingAddress), userId: null }, { transaction: t });
      resolvedShippingId = sa.id;
      resolvedBillingId = ba.id;
    } else {
      const sa = await Address.findOne({ where: { id: shippingAddressId, userId: req.user.id }, transaction: t });
      const ba = await Address.findOne({ where: { id: billingAddressId, userId: req.user.id }, transaction: t });
      if (!sa || !ba) {
        throw new ApiError(400, "Invalid or unauthorized shipping/billing address");
      }
      resolvedShippingId = sa.id;
      resolvedBillingId = ba.id;
    }

    let subtotal = 0;
    const itemsToCreate = [];
    const variantsToUpdate = [];

    // Calculate items total and verify stock
    for (const item of items) {
      const { productVariantId, quantity } = item;

      if (!productVariantId || !quantity || parseInt(quantity) <= 0) {
        throw new ApiError(400, "Invalid item variant or quantity");
      }

      // Lock the variant row for the duration of the transaction so two
      // concurrent checkouts can't both pass the stock check.
      const variant = await ProductVariant.findByPk(productVariantId, {
        include: [{ model: Product, as: "product" }],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!variant) {
        throw new ApiError(404, `Product variant ${productVariantId} not found`);
      }

      if (variant.stockQuantity < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product variant "${variant.sku}". Available: ${variant.stockQuantity}, Requested: ${quantity}`
        );
      }

      const unitPrice = variant.priceOverride !== null ? parseFloat(variant.priceOverride) : parseFloat(variant.product.basePrice);
      subtotal += unitPrice * parseInt(quantity);

      itemsToCreate.push({
        productVariantId,
        quantity,
        unitPrice
      });

      variantsToUpdate.push({
        variant,
        newStock: variant.stockQuantity - quantity
      });
    }

    // Decrement inventory stock
    for (const itemUpdate of variantsToUpdate) {
      await itemUpdate.variant.update(
        { stockQuantity: itemUpdate.newStock },
        { transaction: t }
      );
    }

    // Apply Coupon validation if couponCode is provided
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase().trim() }, transaction: t });
      if (coupon) {
        const now = new Date();
        const validTime = now >= new Date(coupon.validFrom) && now <= new Date(coupon.validUntil);
        const limitNotReached = coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit;
        const minPurchaseMet = !coupon.minPurchaseAmount || subtotal >= parseFloat(coupon.minPurchaseAmount);

        if (coupon.isActive && validTime && limitNotReached && minPurchaseMet) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = subtotal * (parseFloat(coupon.discountValue) / 100);
          } else if (coupon.discountType === "FIXED_AMOUNT") {
            discountAmount = parseFloat(coupon.discountValue);
          }

          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }

          couponId = coupon.id;
          // Increment coupon usage
          await coupon.update({ timesUsed: coupon.timesUsed + 1 }, { transaction: t });
        }
      }
    }

    // Shipping + tax from store settings
    const cfg = await getStoreConfig();
    let shippingFee = subtotal >= cfg.freeShippingThreshold ? 0 : cfg.shippingFee;

    // Automatic discount rules (no code needed).
    const itemCount = itemsToCreate.reduce((n, i) => n + parseInt(i.quantity), 0);
    const rules = await DiscountRule.findAll({ where: { isActive: true }, order: [["priority", "DESC"]], transaction: t });
    let ruleDiscount = 0;
    for (const rule of rules) {
      const meets =
        rule.trigger === "MIN_ITEMS"
          ? itemCount >= Number(rule.threshold)
          : subtotal >= Number(rule.threshold);
      if (!meets) continue;
      if (rule.reward === "FREE_SHIPPING") shippingFee = 0;
      else if (rule.reward === "PERCENT_OFF") ruleDiscount = Math.max(ruleDiscount, subtotal * (Number(rule.rewardValue) / 100));
      else if (rule.reward === "FIXED_OFF") ruleDiscount = Math.max(ruleDiscount, Number(rule.rewardValue));
    }
    discountAmount = Math.min(subtotal, discountAmount + ruleDiscount);

    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableBase * (cfg.taxRatePercent / 100) * 100) / 100;

    // Loyalty points redemption (account checkouts only). Capped by the caller's
    // balance and by the amount still payable so the total can't go negative.
    let loyaltyPointsUsed = 0;
    let loyaltyDiscount = 0;
    const redeemPoints = Math.floor(Number(req.body.redeemPoints) || 0);
    if (redeemPoints > 0 && req.user && cfg.loyaltyRedemptionRate > 0) {
      const balance = Number(req.user.loyaltyPointsBalance || 0);
      const payableBeforeLoyalty = subtotal - discountAmount + shippingFee + taxAmount;
      const maxByValue = Math.floor(payableBeforeLoyalty / cfg.loyaltyRedemptionRate);
      loyaltyPointsUsed = Math.max(0, Math.min(redeemPoints, balance, maxByValue));
      loyaltyDiscount = Math.round(loyaltyPointsUsed * cfg.loyaltyRedemptionRate * 100) / 100;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount - loyaltyDiscount + shippingFee + taxAmount);

    // Create main Order record
    const order = await Order.create(
      {
        userId: req.user?.id ?? null,
        guestEmail,
        orderNumber,
        status: "PENDING",
        subtotalAmount: subtotal,
        taxAmount,
        totalAmount,
        discountAmount,
        loyaltyPointsUsed,
        shippingFee,
        couponId,
        shippingAddressId: resolvedShippingId,
        billingAddressId: resolvedBillingId
      },
      { transaction: t }
    );

    // Create OrderItem records linked to order
    const orderItemsData = itemsToCreate.map((item) => ({ ...item, orderId: order.id }));
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // Debit the redeemed loyalty points now — they're committed once the order
    // is placed (mirrors how coupon usage is incremented at checkout).
    if (loyaltyPointsUsed > 0) {
      await LoyaltyTransaction.create(
        {
          userId: req.user.id,
          orderId: order.id,
          points: -loyaltyPointsUsed,
          type: "REDEEMED",
          description: `Redeemed on order ${orderNumber}`,
        },
        { transaction: t }
      );
      await User.increment({ loyaltyPointsBalance: -loyaltyPointsUsed }, { where: { id: req.user.id }, transaction: t });
    }

    // ── Payment ────────────────────────────────────────────────────────────
    // INSTANT (MOCK/CARD): completes now.  DEFERRED (COD): pays on delivery.
    // REDIRECT (ESEWA/KHALTI): stays PENDING until /payments/verify.
    const paymentStatus = isInstant(provider) ? "COMPLETED" : "PENDING";
    const payment = await Payment.create(
      {
        orderId: order.id,
        paymentMethod: savedMethod?.label || provider,
        provider,
        transactionId: isInstant(provider) ? (paymentToken || `${provider}_${Date.now()}`) : null,
        amount: totalAmount,
        status: paymentStatus
      },
      { transaction: t }
    );

    let pointsEarned = 0;
    if (isInstant(provider)) {
      ({ pointsEarned } = await settleOrderPayment(order, t));
    } else if (isDeferred(provider)) {
      // COD — fulfil the order now; payment settles when it's delivered.
      await order.update({ status: "PROCESSING" }, { transaction: t });
    }
    // REDIRECT: leave order PENDING.

    const full = await Order.findByPk(order.id, { include: orderInclude, transaction: t });
    return { order: full, pointsEarned, loyaltyDiscount, loyaltyPointsUsed, provider, paymentId: payment.id };
  });

  const { order: placedOrder, pointsEarned, loyaltyDiscount, loyaltyPointsUsed, paymentId } = createdOrderDetails;

  // Redirect providers → hand the client an initiation payload.
  let redirect = null;
  if (isRedirect(provider)) {
    try {
      redirect = buildRedirectPayload({ provider, order: placedOrder, amount: Number(placedOrder.totalAmount) });
    } catch (err) {
      console.error("redirect payload build failed:", err.message);
    }
  }

  // notify() is a no-op when userId is null (guest orders).
  await notify(req.user?.id, {
    type: "ORDER_PLACED",
    title: "Order placed",
    message: isRedirect(provider)
      ? `Your order ${placedOrder.orderNumber} is awaiting payment.`
      : isDeferred(provider)
        ? `Your order ${placedOrder.orderNumber} is confirmed — pay on delivery.`
        : `Your order ${placedOrder.orderNumber} has been placed and paid.`,
    link: `/account/orders/${placedOrder.id}`
  });
  if (pointsEarned > 0) {
    await notify(req.user?.id, {
      type: "LOYALTY_EARNED",
      title: `+${pointsEarned} loyalty points`,
      message: `You earned ${pointsEarned} points on this order.`,
      link: "/account/loyalty"
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { order: placedOrder, provider, paymentId, redirect, requiresPayment: isRedirect(provider), pointsEarned, loyaltyDiscount, loyaltyPointsUsed },
      "Order checked out successfully"
    )
  );
});

// Confirm a redirect (eSewa/Khalti) payment after the gateway callback.
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, ref } = req.body;
  const provider = String(req.body.provider || "").toUpperCase();
  if (!orderId || !isRedirect(provider)) {
    throw new ApiError(400, "orderId and a redirect provider (ESEWA|KHALTI) are required");
  }

  const order = await Order.findByPk(orderId, {
    include: [{ model: Payment, as: "payments" }]
  });
  if (!order) throw new ApiError(404, "Order not found");

  // Authorize: the owning account, or a guest who proves the contact email.
  const guestEmail = String(req.body.guestEmail || "").trim().toLowerCase();
  const ownsIt = order.userId
    ? req.user?.id === order.userId
    : !!order.guestEmail && guestEmail === order.guestEmail;
  if (!ownsIt) throw new ApiError(404, "Order not found");

  const payment = (order.payments || []).find((p) => p.provider === provider && p.status === "PENDING");
  if (!payment) {
    // Already settled — return the order as-is (idempotent).
    const already = await Order.findByPk(orderId, { include: orderInclude });
    return res.status(200).json(new ApiResponse(200, already, "Payment already confirmed"));
  }

  const result = await verifyRedirectPayment({ provider, amount: Number(order.totalAmount), ref });
  if (!result.ok) {
    await payment.update({ status: "FAILED" });
    throw new ApiError(402, "Payment could not be verified");
  }

  const settled = await sequelize.transaction(async (t) => {
    await payment.update({ status: "COMPLETED", transactionId: result.transactionId }, { transaction: t });
    const fresh = await Order.findByPk(orderId, { transaction: t });
    const { pointsEarned } = await settleOrderPayment(fresh, t);
    return { pointsEarned };
  });

  await notify(req.user?.id, {
    type: "ORDER_PLACED",
    title: "Payment received",
    message: `Payment for order ${order.orderNumber} confirmed.`,
    link: `/account/orders/${order.id}`
  });
  if (settled.pointsEarned > 0) {
    await notify(req.user?.id, {
      type: "LOYALTY_EARNED",
      title: `+${settled.pointsEarned} loyalty points`,
      message: `You earned ${settled.pointsEarned} points on this order.`,
      link: "/account/loyalty"
    });
  }

  const full = await Order.findByPk(orderId, { include: orderInclude });
  return res.status(200).json(new ApiResponse(200, full, "Payment confirmed"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: orderInclude,
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id, userId: req.user.id },
    include: orderInclude
  });

  if (!order) {
    throw new ApiError(404, "Order not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [
      ...orderInclude,
      { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders retrieved successfully"));
});

const getAdminOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByPk(id, {
    include: [
      ...orderInclude,
      { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "phoneNumber"] }
    ]
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

const STATUS_NOTIFICATION = {
  SHIPPED: { type: "ORDER_SHIPPED", title: "Order shipped", body: "is on its way" },
  DELIVERED: { type: "ORDER_DELIVERED", title: "Order delivered", body: "has been delivered" },
  CANCELLED: { type: "ORDER_CANCELLED", title: "Order cancelled", body: "has been cancelled" }
};

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const previousStatus = order.status;
  const updates = {};
  let newStatus;
  if (status !== undefined) {
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    newStatus = String(status).toUpperCase();
    if (!validStatuses.includes(newStatus)) {
      throw new ApiError(400, "Invalid status state");
    }
    updates.status = newStatus;
  }
  if (trackingNumber !== undefined) {
    updates.trackingNumber = trackingNumber;
  }

  await order.update(updates);

  // COD orders: settle the pending payment when the order is delivered.
  let codPointsEarned = 0;
  if (newStatus === "DELIVERED" && previousStatus !== "DELIVERED") {
    const codPayment = await Payment.findOne({
      where: { orderId: order.id, provider: "COD", status: "PENDING" }
    });
    if (codPayment) {
      await sequelize.transaction(async (t) => {
        await codPayment.update({ status: "COMPLETED", transactionId: `COD_${Date.now()}` }, { transaction: t });
        const fresh = await Order.findByPk(order.id, { transaction: t });
        ({ pointsEarned: codPointsEarned } = await settleOrderPayment(fresh, t));
      });
    }
  }
  if (codPointsEarned > 0 && order.userId) {
    await notify(order.userId, {
      type: "LOYALTY_EARNED",
      title: `+${codPointsEarned} loyalty points`,
      message: `You earned ${codPointsEarned} points on order ${order.orderNumber}.`,
      link: "/account/loyalty"
    });
  }

  // Notify the customer on meaningful status transitions.
  if (newStatus && newStatus !== previousStatus && STATUS_NOTIFICATION[newStatus] && order.userId) {
    const n = STATUS_NOTIFICATION[newStatus];
    await notify(order.userId, {
      type: n.type,
      title: n.title,
      message: `Your order ${order.orderNumber} ${n.body}.`,
      link: `/account/orders/${order.id}`
    });
  }

  const updated = await Order.findByPk(id, { include: orderInclude });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Order status updated successfully"));
});

// Admin: refund an order — mark payment REFUNDED, cancel the order, restock the
// items, and reverse any loyalty points earned on it.
const refundOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(id, {
      include: [
        { model: Payment, as: "payments" },
        { model: OrderItem, as: "items" }
      ],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.status === "CANCELLED") throw new ApiError(400, "Order is already cancelled/refunded");

    const completedPayment = (order.payments || []).find((p) => p.status === "COMPLETED");
    if (!completedPayment) throw new ApiError(400, "No completed payment to refund");

    // Restock every line item.
    for (const item of order.items || []) {
      await ProductVariant.increment(
        { stockQuantity: item.quantity },
        { where: { id: item.productVariantId }, transaction: t }
      );
    }

    await completedPayment.update({ status: "REFUNDED" }, { transaction: t });
    await order.update({ status: "CANCELLED" }, { transaction: t });

    // Reverse loyalty points earned on this order.
    const earned = await LoyaltyTransaction.sum("points", {
      where: { orderId: order.id, type: "EARNED" },
      transaction: t
    });
    if (earned && earned > 0) {
      await LoyaltyTransaction.create(
        {
          userId: order.userId,
          orderId: order.id,
          points: -earned,
          type: "ADJUSTMENT",
          description: `Reversed on refund of order ${order.orderNumber}`
        },
        { transaction: t }
      );
      await User.increment(
        { loyaltyPointsBalance: -earned },
        { where: { id: order.userId }, transaction: t }
      );
    }

    // Give back any loyalty points the customer redeemed on this order.
    if (order.loyaltyPointsUsed > 0 && order.userId) {
      await LoyaltyTransaction.create(
        {
          userId: order.userId,
          orderId: order.id,
          points: order.loyaltyPointsUsed,
          type: "ADJUSTMENT",
          description: `Points returned on refund of order ${order.orderNumber}`,
        },
        { transaction: t }
      );
      await User.increment(
        { loyaltyPointsBalance: order.loyaltyPointsUsed },
        { where: { id: order.userId }, transaction: t }
      );
    }

    return { orderId: order.id, orderNumber: order.orderNumber, userId: order.userId, amount: Number(completedPayment.amount) };
  });

  if (result.userId) {
    await notify(result.userId, {
      type: "ORDER_REFUNDED",
      title: "Order refunded",
      message: `Your order ${result.orderNumber} has been refunded (£${result.amount.toFixed(2)}).`,
      link: `/account/orders/${result.orderId}`
    });
  }

  const updated = await Order.findByPk(id, { include: orderInclude });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Order refunded successfully"));
});

// ── Admin order notes ───────────────────────────────────────────────────────
const listOrderNotes = asyncHandler(async (req, res) => {
  const notes = await OrderNote.findAll({
    where: { orderId: req.params.id },
    include: [{ model: User, as: "author", attributes: ["firstName", "lastName"] }],
    order: [["createdAt", "DESC"]]
  });
  return res.status(200).json(new ApiResponse(200, notes, "Order notes fetched"));
});

const addOrderNote = asyncHandler(async (req, res) => {
  const body = String(req.body.body || "").trim();
  if (!body) throw new ApiError(400, "Note body is required");
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const note = await OrderNote.create({ orderId: order.id, authorId: req.user.id, body });
  const withAuthor = await OrderNote.findByPk(note.id, {
    include: [{ model: User, as: "author", attributes: ["firstName", "lastName"] }]
  });
  return res.status(201).json(new ApiResponse(201, withAuthor, "Note added"));
});

const deleteOrderNote = asyncHandler(async (req, res) => {
  const deleted = await OrderNote.destroy({ where: { id: req.params.noteId } });
  if (!deleted) throw new ApiError(404, "Note not found");
  return res.status(200).json(new ApiResponse(200, {}, "Note deleted"));
});

export {
  checkoutOrder,
  verifyPayment,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  refundOrder,
  listOrderNotes,
  addOrderNote,
  deleteOrderNote
};
