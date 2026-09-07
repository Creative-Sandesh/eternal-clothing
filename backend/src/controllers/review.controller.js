import Review from "../models/review.model.js";
import User from "../models/users.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify } from "../utils/notify.js";

// Current user's own reviews (any status), newest first.
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: "product", attributes: ["id", "name", "slug", "images"] }],
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Your reviews fetched successfully"));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const reviews = await Review.findAll({
    where: { productId, status: "APPROVED" },
    include: [{
      model: User,
      as: "user",
      attributes: ["id", "firstName", "lastName"]
    }],
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Product reviews fetched successfully"));
});

const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || rating === undefined) {
    throw new ApiError(400, "Product ID and rating are required");
  }

  if (parseInt(rating) < 1 || parseInt(rating) > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  // Verify product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Verify customer has a DELIVERED order for this product (Verified Purchase policy).
  // Query from the OrderItem side to avoid Sequelize's subquery join issues.
  const hasPurchased = await OrderItem.findOne({
    include: [
      {
        model: Order,
        as: "order",
        required: true,
        where: { userId: req.user.id, status: "DELIVERED" },
        attributes: []
      },
      {
        model: ProductVariant,
        as: "productVariant",
        required: true,
        where: { productId },
        attributes: []
      }
    ]
  });

  if (!hasPurchased) {
    throw new ApiError(
      403,
      "You can only review products you have successfully purchased and received (Delivered status)"
    );
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    where: { userId: req.user.id, productId }
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = await Review.create({
    userId: req.user.id,
    productId,
    rating: parseInt(rating),
    comment,
    status: "PENDING" // Starts as pending admin approval
  });

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review submitted successfully and is pending approval"));
});

const getAdminReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    include: [
      { model: User, as: "user", attributes: ["firstName", "lastName", "email"] },
      { model: Product, as: "product", attributes: ["name", "slug"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "All reviews fetched successfully"));
});

const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    throw new ApiError(400, "Invalid status payload");
  }

  const review = await Review.findByPk(id, {
    include: [{ model: Product, as: "product", attributes: ["name", "slug"] }]
  });
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const previous = review.status;
  await review.update({ status });

  if (status !== previous && (status === "APPROVED" || status === "REJECTED")) {
    const productName = review.product?.name || "a product";
    await notify(review.userId, {
      type: status === "APPROVED" ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
      title: status === "APPROVED" ? "Review published" : "Review not approved",
      message:
        status === "APPROVED"
          ? `Your review of ${productName} is now live.`
          : `Your review of ${productName} was not approved.`,
      link: review.product?.slug ? `/product/${review.product.slug}` : null
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, `Review status updated to ${status} successfully`));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export {
  getMyReviews,
  getProductReviews,
  createReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
};
