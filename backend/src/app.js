import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.set("trust proxy", 1); // honour X-Forwarded-* when behind a proxy (rate-limit keying)

// Security headers + response compression
app.use(helmet());
app.use(compression());

// Middlewares
// CROSS_ORIGIN can be "*" (allow all) or a comma-separated allowlist of origins.
// When credentials are enabled the browser rejects a literal "*", so we reflect the
// caller's origin instead whenever it is permitted.
const allowedOrigins = (process.env.CROSS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Rate limiting — generous global cap, stricter on auth (brute-force protection)
const rlOptions = { standardHeaders: true, legacyHeaders: false };
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 600),
  message: { success: false, statusCode: 429, message: "Too many requests, please try again later", errors: [] },
  ...rlOptions
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  message: { success: false, statusCode: 429, message: "Too many attempts, please try again later", errors: [] },
  skipSuccessfulRequests: true,
  ...rlOptions
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authLimiter);

// Health check / API root
app.get(["/", "/health", "/api/v1/health"], (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Eternal API is running",
    data: { service: "eternal-api", version: "v1" }
  });
});

// Routes imports
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import productRouter from "./routes/product.routes.js";
import inventoryRouter from "./routes/inventory.routes.js";
import addressRouter from "./routes/address.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import orderRouter from "./routes/order.routes.js";
import userRouter from "./routes/user.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import reviewRouter from "./routes/review.routes.js";
import blogRouter from "./routes/blog.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import loyaltyRouter from "./routes/loyalty.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import marketingRouter from "./routes/marketing.routes.js";
import referralRouter from "./routes/referral.routes.js";
import paymentMethodRouter from "./routes/paymentMethod.routes.js";

// Routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/collections", collectionRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/loyalty", loyaltyRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/marketing", marketingRouter);
app.use("/api/v1/referrals", referralRouter);
app.use("/api/v1/payment-methods", paymentMethodRouter);

// 404 handler for unmatched routes — keeps the JSON envelope the frontend expects
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Multer upload errors → 400
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)" : `Upload error: ${err.message}`,
      errors: []
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export { app };
