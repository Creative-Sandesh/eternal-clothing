import { useState, useEffect, useCallback } from "react";
import { useMoney } from "../../context/SettingsContext";
import { formatMoney, currencySymbol } from "../../utils/money";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { FiDollarSign, FiRepeat, FiUsers, FiShoppingBag } from "react-icons/fi";
import { analyticsApi } from "../../services/api";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 }
];
const PALETTE = ["#2d4a3e", "#c9b99a", "#8c8277", "#1e3a5f", "#7c3aed", "#b45309"];

const shortDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const ChartTooltip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null;
  return <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{shortDate(label)}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }} className="capitalize">
          {p.name}: {money && p.name === "revenue" ? formatMoney(p.value) : Number(p.value).toLocaleString()}
        </p>)}
    </div>;
};

function AnalyticsDashboard() {
  const money = useMoney();
  const [days, setDays] = useState(30);
  const [sales, setSales] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async (d) => {
    setLoading(true);
    try {
      const res = await analyticsApi.getSales(d);
      setSales(res.data);
    } catch (err) {
      console.error("AnalyticsDashboard: sales fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSales(days); }, [days, loadSales]);

  // Category + top products come from the dashboard endpoint (period-independent).
  useEffect(() => {
    let active = true;
    analyticsApi.getDashboard().then((res) => {
      if (!active) return;
      const rows = res.data?.categoryRevenue ?? [];
      const total = rows.reduce((s, c) => s + Number(c.revenue || 0), 0) || 1;
      setCategoryData(rows.map((c, i) => ({
        name: c.category,
        value: Math.round((Number(c.revenue || 0) / total) * 100),
        revenue: Number(c.revenue || 0),
        color: PALETTE[i % PALETTE.length]
      })));
      setTopProducts((res.data?.topProducts ?? []).map((p) => ({
        name: p.name || `#${p.productId}`,
        sales: Number(p.totalSold || 0)
      })));
    }).catch((err) => console.error("AnalyticsDashboard: dashboard fetch failed", err));
    return () => { active = false; };
  }, []);

  const revenueSeries = (sales?.dailyRevenue ?? []).map((d) => ({ date: d.date, revenue: Number(d.revenue) || 0 }));
  const ordersSeries = (sales?.dailyOrders ?? []).map((d) => ({ date: d.date, orders: Number(d.orders) || 0 }));
  const customerSeries = (sales?.dailyCustomers ?? []).map((d) => ({ date: d.date, customers: Number(d.customers) || 0 }));
  const k = sales?.kpis ?? {};

  const kpiCards = [
    { label: "Avg Order Value", value: money((k.avgOrderValue ?? 0).toLocaleString()), sub: "all-time", icon: <FiDollarSign size={18} /> },
    { label: "Repeat Purchase Rate", value: `${k.repeatPurchaseRate ?? 0}%`, sub: "of buyers order again", icon: <FiRepeat size={18} /> },
    { label: "Customer LTV", value: money((k.customerLtv ?? 0).toLocaleString()), sub: "revenue per customer", icon: <FiUsers size={18} /> },
    { label: "Units per Order", value: `${k.unitsPerOrder ?? 0}`, sub: "items per basket", icon: <FiShoppingBag size={18} /> }
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Performance over the last {days} days</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {RANGES.map((r) => <button
    key={r.days}
    onClick={() => setDays(r.days)}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${days === r.days ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
              {r.label}
            </button>)}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => <motion.div
    key={kpi.label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
  >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#f0ebe2] text-[#2d4a3e] flex items-center justify-center">{kpi.icon}</div>
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
            </div>
            <p className="font-display text-2xl text-gray-900">{kpi.value}</p>
            <p className="text-xs mt-1 text-gray-400">{kpi.sub}</p>
          </motion.div>)}
      </div>

      {/* Revenue + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d4a3e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2d4a3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currencySymbol()}${(v / 1e3).toFixed(1)}k`} />
              <Tooltip content={<ChartTooltip money />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#2d4a3e" strokeWidth={2} fill="url(#aRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#2d4a3e" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Pie + New Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          {categoryData.length === 0 ? <p className="text-sm text-gray-400 py-12 text-center">No category sales yet.</p>
          : <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [`${formatMoney(p.payload.revenue)} (${v}%)`, p.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {categoryData.map((cat) => <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-600 flex-1">{cat.name}</span>
                  <span className="text-xs font-semibold text-gray-900">{cat.value}%</span>
                </div>)}
            </div>
          </div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Customers</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={customerSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="customers" name="new customers" stroke="#2d4a3e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Top Products (all-time units sold)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Share</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No sales data yet.</td></tr>}
              {topProducts.map((product, i) => {
                const max = Math.max(...topProducts.map((p) => p.sales), 1);
                return <tr key={product.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-bold">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.sales}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#2d4a3e] transition-all" style={{ width: `${(product.sales / max) * 100}%` }} />
                      </div>
                    </td>
                  </tr>;
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {loading && <p className="text-xs text-gray-400 text-center">Updating…</p>}
    </div>
  );
}
export {
  AnalyticsDashboard as default
};
