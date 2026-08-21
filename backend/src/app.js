import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CROSS_ORIGIN || "*",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

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

// Global Error Handler
app.use((err, req, res, next) => {
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
