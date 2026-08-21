import { Op, fn, col, literal } from "sequelize";
import sequelize from "../db/index.js";
import User from "../models/users.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Total Revenue (from COMPLETED payments)
  const totalRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "totalRevenue"]],
    where: { status: "COMPLETED" },
    raw: true
  });

  // Revenue This Month
  const monthlyRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "monthlyRevenue"]],
    where: {
      status: "COMPLETED",
      createdAt: { [Op.gte]: startOfMonth }
    },
    raw: true
  });

  // Revenue Last Month
  const lastMonthRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "lastMonthRevenue"]],
    where: {
      status: "COMPLETED",
      createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
    },
    raw: true
  });

  // Total Orders
  const totalOrders = await Order.count();
  const newOrdersThisMonth = await Order.count({
    where: { createdAt: { [Op.gte]: startOfMonth } }
  });

  // Total Customers
  const totalCustomers = await User.count({ where: { role: "CUSTOMER" } });
  const newCustomersThisMonth = await User.count({
    where: { role: "CUSTOMER", createdAt: { [Op.gte]: startOfMonth } }
  });

  // Total Published Products
  const totalProducts = await Product.count({ where: { status: "PUBLISHED" } });

  // Pending Reviews
  const pendingReviews = await Review.count({ where: { status: "PENDING" } });

  // Orders by Status Breakdown
  const ordersByStatus = await Order.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true
  });

  // Recent 5 Orders
  const recentOrders = await Order.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
    include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email"] }]
  });

  // Top 5 Best Selling Products (by total quantity sold)
  const topProducts = await OrderItem.findAll({
    attributes: [
      "productVariantId",
      [fn("SUM", col("quantity")), "totalSold"]
    ],
    group: ["productVariantId"],
    order: [[literal("totalSold"), "DESC"]],
    limit: 5,
    raw: true
  });

  const totalRevenue = parseFloat(totalRevenueResult?.totalRevenue || 0);
  const monthlyRevenue = parseFloat(monthlyRevenueResult?.monthlyRevenue || 0);
  const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.lastMonthRevenue || 0);
  const revenueGrowth = lastMonthRevenue === 0
    ? 100
    : (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        revenue: {
          total: totalRevenue,
          thisMonth: monthlyRevenue,
          lastMonth: lastMonthRevenue,
          growthPercent: parseFloat(revenueGrowth)
        },
        orders: {
          total: totalOrders,
          newThisMonth: newOrdersThisMonth,
          byStatus: ordersByStatus
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth
        },
        products: {
          total: totalProducts
        },
        pendingReviews,
        recentOrders,
        topProducts
      },
      "Dashboard stats fetched successfully"
    )
  );
});

const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = "30" } = req.query; // last N days, default 30
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  // Daily revenue for the period
  const dailyRevenue = await Payment.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("id")), "transactions"]
    ],
    where: {
      status: "COMPLETED",
      createdAt: { [Op.gte]: daysAgo }
    },
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true
  });

  // Daily new orders for the period
  const dailyOrders = await Order.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("COUNT", col("id")), "orders"]
    ],
    where: {
      createdAt: { [Op.gte]: daysAgo }
    },
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        period: parseInt(period),
        dailyRevenue,
        dailyOrders
      },
      `Sales analytics for the last ${period} days fetched successfully`
    )
  );
});

export { getDashboardStats, getSalesAnalytics };
