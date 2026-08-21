import sequelize from "../db/index.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Coupon from "../models/coupon.model.js";
import Payment from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkoutOrder = asyncHandler(async (req, res) => {
  const {
    items, // Array of { productVariantId, quantity }
    shippingAddressId,
    billingAddressId,
    couponCode,
    paymentMethod = "CARD",
    paymentToken // Mock token for transactionId
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  if (!shippingAddressId || !billingAddressId) {
    throw new ApiError(400, "Shipping and billing addresses are required");
  }

  // Verify addresses belong to user
  const shippingAddress = await Address.findOne({ where: { id: shippingAddressId, userId: req.user.id } });
  const billingAddress = await Address.findOne({ where: { id: billingAddressId, userId: req.user.id } });
  if (!shippingAddress || !billingAddress) {
    throw new ApiError(400, "Invalid or unauthorized shipping/billing address");
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Run checkout inside a database transaction to prevent race conditions on stock updates
  const createdOrderDetails = await sequelize.transaction(async (t) => {
    let subtotal = 0;
    const itemsToCreate = [];
    const variantsToUpdate = [];

    // Calculate items total and verify stock
    for (const item of items) {
      const { productVariantId, quantity } = item;

      if (!productVariantId || !quantity || parseInt(quantity) <= 0) {
        throw new ApiError(400, "Invalid item variant or quantity");
      }

      const variant = await ProductVariant.findByPk(productVariantId, {
        include: [{ model: Product, as: "product" }],
        transaction: t
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

    // Calculate shipping fee: standard rules (free over $100 subtotal, otherwise $10)
    const shippingFee = subtotal >= 100 ? 0 : 10;
    const totalAmount = subtotal - discountAmount + shippingFee;

    // Create main Order record
    const order = await Order.create(
      {
        userId: req.user.id,
        orderNumber,
        status: "PENDING",
        totalAmount,
        discountAmount,
        shippingFee,
        couponId,
        shippingAddressId,
        billingAddressId
      },
      { transaction: t }
    );

    // Create OrderItem records linked to order
    const orderItemsData = itemsToCreate.map((item) => ({
      ...item,
      orderId: order.id
    }));
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // Simulate payment transaction
    const transactionId = paymentToken || `MOCK_TX_${Date.now()}`;
    await Payment.create(
      {
        orderId: order.id,
        paymentMethod,
        transactionId,
        amount: totalAmount,
        status: "COMPLETED" // Assume card payment succeeds instantly
      },
      { transaction: t }
    );

    // Update order status to PROCESSING since payment succeeded
    await order.update({ status: "PROCESSING" }, { transaction: t });

    return await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: "items" },
        { model: Payment, as: "payments" }
      ],
      transaction: t
    });
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdOrderDetails, "Order checked out successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [
      { model: OrderItem, as: "items" },
      { model: Payment, as: "payments" }
    ],
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
    include: [
      { model: OrderItem, as: "items" },
      { model: Payment, as: "payments" }
    ]
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
      { model: OrderItem, as: "items" },
      { model: Payment, as: "payments" }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders retrieved successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updates = {};
  if (status !== undefined) {
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status state");
    }
    updates.status = status;
  }
  if (trackingNumber !== undefined) {
    updates.trackingNumber = trackingNumber;
  }

  await order.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

export {
  checkoutOrder,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  updateOrderStatus
};
