import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMoney } from "../../context/SettingsContext";
import { currencySymbol, formatMoney } from "../../utils/money";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import { analyticsApi } from "../../services/api";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const shortDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{shortDate(label)}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === "revenue" ? formatMoney(p.value) : p.value}
        </p>)}
    </div>;
};

function Sparkline({ series }) {
  const data = (series || []).map((pt, j) => ({ v: Number(pt.value) || 0, j }));
  if (data.length === 0) return <div className="w-16 h-8" />;
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke="#2d4a3e" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AdminDashboard() {
  const money = useMoney();
  const [chartMode, setChartMode] = useState("revenue");
  const [stats, setStats] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dash, sales] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getSales(30).catch(() => ({ data: {} }))
        ]);
        if (!active) return;
        setStats(dash.data);
        const daily = sales.data?.dailyRevenue ?? [];
        setSalesHistory(daily.map((d) => ({
          date: d.date,
          revenue: Number(d.revenue) || 0,
          orders: Number(d.transactions) || 0
        })));
      } catch (err) {
        console.error("AdminDashboard: failed to load", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const totalRevenue = stats?.revenue?.total ?? 0;
  const totalOrders = stats?.orders?.total ?? 0;
  const activeCustomers = stats?.customers?.total ?? 0;
  const avgOrderValue = stats?.avgOrderValue ?? 0;
  const spark = stats?.sparklines ?? {};

  const growth = stats?.revenue?.growthPercent ?? 0;
  const cards = [
    {
      label: "Total Revenue",
      value: money(totalRevenue.toLocaleString()),
      change: `${growth >= 0 ? "+" : ""}${growth}% MoM`,
      trend: growth >= 0 ? "up" : "down",
      series: spark.revenue
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: `${stats?.orders?.newThisMonth ?? 0} this month`,
      trend: "up",
      series: spark.orders
    },
    {
      label: "Avg Order Value",
      value: money(avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })),
      change: "14-day trend",
      trend: "up",
      series: spark.avgOrderValue
    },
    {
      label: "Customers",
      value: activeCustomers.toLocaleString(),
      change: `${stats?.customers?.newThisMonth ?? 0} this month`,
      trend: "up",
      series: spark.customers
    }
  ];

  const recentOrders = (stats?.recentOrders ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber || `ORD-${o.id}`,
    customerName: o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : "Guest Customer",
    status: (o.status || "pending").toLowerCase(),
    total: Number(o.totalAmount || 0)
  }));

  const topProducts = (stats?.topProducts ?? []).map((tp) => ({
    name: tp.name || `Product ${tp.productId}`,
    sales: Number(tp.totalSold || 0)
  }));

  const lowStock = (stats?.lowStock ?? []).map((v) => ({
    id: v.id,
    name: `${v.productName} — ${v.colorName} ${v.size}`.trim(),
    sku: v.sku,
    stock: Number(v.stock)
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#f0ebe2] border-t-[#2d4a3e] animate-spin" /></div>;
  }

  return <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => <motion.div
    key={card.label}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
  >
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
            <p className="font-display text-2xl lg:text-3xl text-gray-900 mt-1 mb-2">{card.value}</p>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1 text-xs font-semibold ${card.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {card.trend === "up" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {card.change}
              </span>
              <Sparkline series={card.series} />
            </div>
          </motion.div>)}
      </div>

      {/* Revenue / Orders chart */}
      <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">{chartMode === "revenue" ? "Revenue" : "Orders"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {["revenue", "orders"].map((m) => <button
    key={m}
    onClick={() => setChartMode(m)}
    className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${chartMode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
              {m}
            </button>)}
          </div>
        </div>
        {salesHistory.length === 0 ? <p className="text-sm text-gray-400 py-16 text-center">No sales in the last 30 days yet.</p>
        : <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={salesHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d4a3e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2d4a3e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis
    tick={{ fontSize: 11, fill: "#9ca3af" }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(v) => chartMode === "revenue" ? `${currencySymbol()}${(v / 1e3).toFixed(1)}k` : String(v)}
  />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey={chartMode} name={chartMode} stroke="#2d4a3e" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>}
      </motion.div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.38 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-[#2d4a3e] hover:underline flex items-center gap-1">
              View all <FiArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && <p className="text-sm text-gray-400 py-4">No orders yet.</p>}
            {recentOrders.map((order) => <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{order.customerName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">{money(order.total)}</p>
              </div>)}
          </div>
        </motion.div>

        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.42 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-[#2d4a3e] hover:underline flex items-center gap-1">
              View all <FiArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 && <p className="text-sm text-gray-400 py-4">No sales data yet.</p>}
            {topProducts.map((product, i) => <div key={product.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-400 tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} sold</p>
                </div>
              </div>)}
          </div>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.48 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
        <div className="flex items-center gap-2 mb-4">
          <FiAlertTriangle className="text-amber-500" size={16} />
          <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
          <span className="text-xs text-gray-400">(under 10 units)</span>
        </div>
        <div className="space-y-3">
          {lowStock.length === 0 ? <p className="text-sm text-gray-400">Nothing running low right now.</p>
          : lowStock.map((product) => <div key={product.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
              </div>
              <span className={`text-sm font-bold ${product.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
              </span>
            </div>)}
        </div>
        <Link to="/admin/inventory" className="flex items-center gap-1 mt-3 text-xs text-[#2d4a3e] hover:underline">
          Manage inventory <FiArrowRight size={11} />
        </Link>
      </motion.div>
    </div>;
}
export {
  AdminDashboard as default
};
