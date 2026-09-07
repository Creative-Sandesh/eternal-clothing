import { Op, fn, col } from "sequelize";
import sequelize from "../db/index.js";
import User from "../models/users.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const LOW_STOCK_THRESHOLD = 10;

// Local YYYY-MM-DD for a Date.
const ymd = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

// Turn grouped-by-date rows into a dense array of numbers for the last `days` days
// (oldest → newest), filling gaps with 0.
const denseSeries = (rows, days, dateKey, valueKey) => {
  const map = Object.fromEntries(rows.map((r) => [String(r[dateKey]).slice(0, 10), Number(r[valueKey]) || 0]));
  const out = [];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: ymd(d), value: map[ymd(d)] ?? 0 });
  }
  return out;
};

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const sparkDays = 14;
  const sparkSince = new Date();
  sparkSince.setDate(sparkSince.getDate() - sparkDays);

  const totalRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "totalRevenue"]],
    where: { status: "COMPLETED" },
    raw: true
  });
  const monthlyRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "monthlyRevenue"]],
    where: { status: "COMPLETED", createdAt: { [Op.gte]: startOfMonth } },
    raw: true
  });
  const lastMonthRevenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "lastMonthRevenue"]],
    where: { status: "COMPLETED", createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } },
    raw: true
  });

  const totalOrders = await Order.count();
  const newOrdersThisMonth = await Order.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });
  const totalCustomers = await User.count({ where: { role: "CUSTOMER" } });
  const newCustomersThisMonth = await User.count({
    where: { role: "CUSTOMER", createdAt: { [Op.gte]: startOfMonth } }
  });
  const totalProducts = await Product.count({ where: { status: "PUBLISHED" } });
  const pendingReviews = await Review.count({ where: { status: "PENDING" } });

  const ordersByStatus = await Order.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true
  });

  const recentOrders = await Order.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
    include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email"] }]
  });

  const [topProducts] = await sequelize.query(
    `SELECT p.id AS productId, p.name, p.slug, SUM(oi.quantity) AS totalSold
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.product_variant_id
       JOIN products p ON p.id = pv.product_id
      GROUP BY p.id, p.name, p.slug
      ORDER BY totalSold DESC
      LIMIT 5`
  );

  const [categoryRevenue] = await sequelize.query(
    `SELECT c.name AS category, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
       FROM categories c
       JOIN products p ON p.category_id = c.id
       JOIN product_variants pv ON pv.product_id = p.id
       JOIN order_items oi ON oi.product_variant_id = pv.id
       JOIN orders o ON o.id = oi.order_id
       JOIN payments pay ON pay.order_id = o.id AND pay.status = 'COMPLETED'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC`
  );

  // ── Low stock ────────────────────────────────────────────────────────────
  const [lowStock] = await sequelize.query(
    `SELECT pv.id, pv.sku, pv.stock_quantity AS stock, pv.color_name AS colorName,
            pv.size, p.id AS productId, p.name AS productName
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
      WHERE pv.stock_quantity < :threshold AND p.deleted_at IS NULL
      ORDER BY pv.stock_quantity ASC
      LIMIT 8`,
    { replacements: { threshold: LOW_STOCK_THRESHOLD } }
  );

  // ── Sparklines (last 14 days) ────────────────────────────────────────────
  const revRows = await Payment.findAll({
    attributes: [[fn("DATE", col("created_at")), "date"], [fn("SUM", col("amount")), "value"], [fn("COUNT", col("id")), "cnt"]],
    where: { status: "COMPLETED", createdAt: { [Op.gte]: sparkSince } },
    group: [fn("DATE", col("created_at"))],
    raw: true
  });
  const ordRows = await Order.findAll({
    attributes: [[fn("DATE", col("created_at")), "date"], [fn("COUNT", col("id")), "value"]],
    where: { createdAt: { [Op.gte]: sparkSince } },
    group: [fn("DATE", col("created_at"))],
    raw: true
  });
  const custRows = await User.findAll({
    attributes: [[fn("DATE", col("created_at")), "date"], [fn("COUNT", col("id")), "value"]],
    where: { role: "CUSTOMER", createdAt: { [Op.gte]: sparkSince } },
    group: [fn("DATE", col("created_at"))],
    raw: true
  });

  const revSeries = denseSeries(revRows, sparkDays, "date", "value");
  const txSeries = denseSeries(revRows, sparkDays, "date", "cnt");
  const ordSeries = denseSeries(ordRows, sparkDays, "date", "value");
  const custSeries = denseSeries(custRows, sparkDays, "date", "value");
  const aovSeries = revSeries.map((r, i) => ({
    date: r.date,
    value: txSeries[i].value ? Math.round((r.value / txSeries[i].value) * 100) / 100 : 0
  }));

  const totalRevenue = parseFloat(totalRevenueResult?.totalRevenue || 0);
  const monthlyRevenue = parseFloat(monthlyRevenueResult?.monthlyRevenue || 0);
  const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.lastMonthRevenue || 0);
  const revenueGrowth = lastMonthRevenue === 0
    ? (monthlyRevenue > 0 ? 100 : 0)
    : Number((((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        revenue: {
          total: totalRevenue,
          thisMonth: monthlyRevenue,
          lastMonth: lastMonthRevenue,
          growthPercent: revenueGrowth
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
        products: { total: totalProducts },
        avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        pendingReviews,
        recentOrders,
        topProducts,
        categoryRevenue,
        lowStock,
        sparklines: {
          days: sparkDays,
          revenue: revSeries,
          orders: ordSeries,
          customers: custSeries,
          avgOrderValue: aovSeries
        }
      },
      "Dashboard stats fetched successfully"
    )
  );
});

const getSalesAnalytics = asyncHandler(async (req, res) => {
  const period = Math.max(1, Math.min(365, parseInt(req.query.period, 10) || 30));
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - period);

  const dailyRevenueRows = await Payment.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("SUM", col("amount")), "revenue"],
      [fn("COUNT", col("id")), "transactions"]
    ],
    where: { status: "COMPLETED", createdAt: { [Op.gte]: daysAgo } },
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true
  });

  const dailyOrderRows = await Order.findAll({
    attributes: [[fn("DATE", col("created_at")), "date"], [fn("COUNT", col("id")), "orders"]],
    where: { createdAt: { [Op.gte]: daysAgo } },
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true
  });

  const dailyCustomerRows = await User.findAll({
    attributes: [[fn("DATE", col("created_at")), "date"], [fn("COUNT", col("id")), "customers"]],
    where: { role: "CUSTOMER", createdAt: { [Op.gte]: daysAgo } },
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true
  });

  // Dense series so the charts have a point per day.
  const revValues = denseSeries(dailyRevenueRows, period, "date", "revenue");
  const txValues = denseSeries(dailyRevenueRows, period, "date", "transactions");
  const dailyRevenue = revValues.map((r, i) => ({ date: r.date, revenue: r.value, transactions: txValues[i].value }));
  const dailyOrders = denseSeries(dailyOrderRows, period, "date", "orders").map((r) => ({ date: r.date, orders: r.value }));
  const dailyCustomers = denseSeries(dailyCustomerRows, period, "date", "customers").map((r) => ({ date: r.date, customers: r.value }));

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const [[totals]] = await sequelize.query(
    `SELECT
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='COMPLETED') AS revenue,
        (SELECT COUNT(*) FROM orders) AS orders,
        (SELECT COALESCE(SUM(quantity),0) FROM order_items) AS units,
        (SELECT COUNT(*) FROM users WHERE role='CUSTOMER') AS customers,
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='REFUNDED') AS refunded`
  );
  const [[repeat]] = await sequelize.query(
    `SELECT
        COUNT(*) AS buyers,
        SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) AS repeat_buyers
       FROM (SELECT user_id, COUNT(*) AS order_count FROM orders WHERE user_id IS NOT NULL GROUP BY user_id) t`
  );

  const revenue = Number(totals.revenue) || 0;
  const orders = Number(totals.orders) || 0;
  const units = Number(totals.units) || 0;
  const customers = Number(totals.customers) || 0;
  const buyers = Number(repeat.buyers) || 0;
  const repeatBuyers = Number(repeat.repeat_buyers) || 0;
  const refunded = Number(totals.refunded) || 0;

  const kpis = {
    avgOrderValue: orders ? Math.round((revenue / orders) * 100) / 100 : 0,
    unitsPerOrder: orders ? Math.round((units / orders) * 100) / 100 : 0,
    customerLtv: customers ? Math.round((revenue / customers) * 100) / 100 : 0,
    repeatPurchaseRate: buyers ? Math.round((repeatBuyers / buyers) * 1000) / 10 : 0, // %
    refundRate: revenue ? Math.round((refunded / revenue) * 1000) / 10 : 0 // %
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { period, dailyRevenue, dailyOrders, dailyCustomers, kpis },
      `Sales analytics for the last ${period} days fetched successfully`
    )
  );
});

export { getDashboardStats, getSalesAnalytics };
