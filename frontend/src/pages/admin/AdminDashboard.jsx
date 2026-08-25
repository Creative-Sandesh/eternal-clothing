import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import { analyticsApi } from "../../services/api";
const sparkData = [
  [40, 55, 48, 62, 58, 71, 68, 80, 76, 88],
  [120, 145, 132, 158, 148, 172, 165, 195, 188, 210],
  [280, 310, 295, 320, 305, 335, 318, 345, 330, 358],
  [850, 920, 880, 960, 930, 1010, 980, 1050, 1020, 1080]
];
const lowStockProducts = [
  { name: "Merino Crewneck Knit \u2014 Stone", sku: "ET-004-STN", stock: 3 },
  { name: "Leather Chelsea Boot \u2014 Tan 42", sku: "ET-009-TAN", stock: 5 },
  { name: "Cashmere Ribbed Beanie \u2014 Black", sku: "ET-008-BLK", stock: 7 },
  { name: "Slim Straight Denim \u2014 30W", sku: "ET-006-30W", stock: 2 }
];
const statusColors = {
  processing: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600"
};
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name === "revenue" ? `\xA3${p.value.toLocaleString()}` : p.name === "target" ? `\xA3${p.value.toLocaleString()}` : p.value}
        </p>)}
    </div>;
};
function AdminDashboard() {
  const [chartMode, setChartMode] = useState("revenue");
  const [stats, setStats] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getDashboard();
        if (!active) return;
        setStats(res.data);
      } catch (err) {
        console.error("AdminDashboard: failed to load stats", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStats();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchSales = async () => {
      try {
        const res = await analyticsApi.getSales(30);
        if (!active) return;
        const daily = res.data?.dailyRevenue ?? [];
        if (daily.length > 0) {
          const mapped = daily.map(d => ({
            month: d.date,
            revenue: Number(d.revenue),
            orders: Number(d.transactions),
            target: 0
          }));
          setSalesHistory(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSales();
    return () => { active = false; };
  }, []);

  const totalRevenue = stats?.revenue?.total ?? 0;
  const totalOrders = stats?.orders?.total ?? 0;
  const activeCustomers = stats?.customers?.total ?? 0;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const liveStatsCards = [
    {
      label: "Total Revenue",
      value: `£${totalRevenue.toLocaleString()}`,
      change: stats?.revenue?.growthPercent >= 0 ? `+${stats?.revenue?.growthPercent}%` : `${stats?.revenue?.growthPercent}%`,
      trend: (stats?.revenue?.growthPercent ?? 0) >= 0 ? "up" : "down"
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: stats?.orders?.newThisMonth ? `+${stats?.orders?.newThisMonth} new` : "0 new",
      trend: "up"
    },
    {
      label: "Avg Order Value",
      value: `£${avgOrderValue.toFixed(0)}`,
      change: "--",
      trend: "up"
    },
    {
      label: "Active Customers",
      value: activeCustomers.toLocaleString(),
      change: stats?.customers?.newThisMonth ? `+${stats?.customers?.newThisMonth} new` : "0 new",
      trend: "up"
    }
  ];

  const recentOrdersList = (stats?.recentOrders ?? []).map(o => ({
    id: o.id,
    orderNumber: o.orderNumber || `ORD-${o.id}`,
    customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : "Guest Customer",
    status: o.status ? o.status.toLowerCase() : "pending",
    total: Number(o.totalAmount || o.total || 0)
  }));

  const topProductsList = (stats?.topProducts ?? []).map((tp, idx) => ({
    name: `Variant ID: ${tp.productVariantId}`,
    sales: Number(tp.totalSold || 0),
    revenue: 0,
    growth: 0
  }));

  const chartData = salesHistory.length > 0 ? salesHistory : [
    { month: "Jan", revenue: 0, orders: 0, target: 0 },
    { month: "Feb", revenue: 0, orders: 0, target: 0 },
    { month: "Mar", revenue: 0, orders: 0, target: 0 }
  ];
  return <div className="space-y-6">
      {
    /* Stats Row */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {liveStatsCards.map((card, i) => <motion.div
    key={card.label}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08 }}
    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
  >
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
            <p className="font-display text-2xl lg:text-3xl text-gray-900 mt-1 mb-2">{card.value}</p>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1 text-xs font-semibold ${card.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {card.trend === "up" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {card.change}
              </span>
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData[i].map((v, j) => ({ v, j }))}>
                    <Line type="monotone" dataKey="v" stroke="#2d4a3e" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>)}
      </div>

      {
    /* Revenue Chart */
  }
      <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.32 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">12-month performance vs target</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
    onClick={() => setChartMode("revenue")}
    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMode === "revenue" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
              Revenue
            </button>
            <button
    onClick={() => setChartMode("orders")}
    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMode === "orders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
              Orders
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d4a3e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2d4a3e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9b99a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#c9b99a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
    tick={{ fontSize: 11, fill: "#9ca3af" }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(v) => chartMode === "revenue" ? `\xA3${(v / 1e3).toFixed(0)}k` : String(v)}
  />
            <Tooltip content={<CustomTooltip />} />
            {chartMode === "revenue" ? <>
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#2d4a3e" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="target" name="target" stroke="#c9b99a" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#tgtGrad)" />
              </> : <Area type="monotone" dataKey="orders" name="orders" stroke="#2d4a3e" strokeWidth={2} fill="url(#revGrad)" />}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {
    /* Two-column: Recent Orders + Top Products */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {
    /* Recent Orders */
  }
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-[#2d4a3e] hover:underline flex items-center gap-1">
              View all <FiArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrdersList.map((order) => <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{order.customerName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">£{order.total.toFixed(0)}</p>
              </div>)}
          </div>
        </motion.div>

        {
    /* Top Products */
  }
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.44 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-[#2d4a3e] hover:underline flex items-center gap-1">
              View all <FiArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {topProductsList.map((product, i) => <div key={product.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-400 tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} sold · £{product.revenue.toLocaleString()}</p>
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${product.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.growth >= 0 ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
                  {Math.abs(product.growth)}%
                </span>
              </div>)}
          </div>
        </motion.div>
      </div>

      {
    /* Two-column: Category PieChart + Low Stock */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {
    /* Category Revenue PieChart */
  }
        </motion.div>

        {
    /* Low Stock Alerts */
  }
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.52 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-amber-500" size={16} />
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product) => <div key={product.sku} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-600">{product.stock} left</span>
                  <button className="text-xs px-2.5 py-1 bg-[#2d4a3e] text-white rounded-md hover:bg-[#3d6355] transition-colors font-medium">
                    Restock
                  </button>
                </div>
              </div>)}
          </div>
          <Link to="/admin/inventory" className="flex items-center gap-1 mt-3 text-xs text-[#2d4a3e] hover:underline">
            View all inventory <FiArrowRight size={11} />
          </Link>
        </motion.div>
      </div>
    </div>;
}
export {
  AdminDashboard as default
};
