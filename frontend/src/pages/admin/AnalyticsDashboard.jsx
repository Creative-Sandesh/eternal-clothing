import { useState, useEffect } from "react";
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
  CartesianGrid,
  Legend
} from "recharts";
import { FiTrendingUp, FiRepeat, FiUsers, FiShoppingBag } from "react-icons/fi";
import { analyticsApi } from "../../services/api";
const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"];
const kpis = [
  { label: "Conversion Rate", value: "3.4%", sub: "+0.2% vs last period", icon: <FiTrendingUp size={18} />, up: true },
  { label: "Return Rate", value: "8.2%", sub: "-1.1% vs last period", icon: <FiRepeat size={18} />, up: false },
  { label: "Customer LTV", value: "\xA3402", sub: "+\xA328 vs last period", icon: <FiUsers size={18} />, up: true },
  { label: "Repeat Purchase", value: "41%", sub: "+3% vs last period", icon: <FiShoppingBag size={18} />, up: true }
];
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }} className="capitalize">
          {p.name}: {typeof p.value === "number" && (p.name === "revenue" || p.name === "target") ? `\xA3${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>)}
    </div>;
};
function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const dashboardRes = await analyticsApi.getDashboard();
        const salesRes = await analyticsApi.getSales(30);
        if (!active) return;
        // Map sales data to chart format
        const daily = salesRes.data?.dailyRevenue ?? [];
        const mappedChart = daily.map(d => ({ month: d.date, revenue: Number(d.revenue), orders: Number(d.transactions), target: 0 }));
        setChartData(mappedChart);
        // Category and traffic data may be part of dashboard stats; using placeholders if missing
        setCategoryData(dashboardRes.data?.categoryBreakdown || []);
        setTrafficData(dashboardRes.data?.traffic || []);
        setTopProductsData(dashboardRes.data?.topProducts || []);
        setLoading(false);
      } catch (err) {
        console.error("AnalyticsDashboard fetch error", err);
        setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  // Fallback to static data while loading or if API missing
  const revenueChart = loading ? [] : chartData.length ? chartData : [];
  const categoryRevenue = loading ? [] : (categoryData.length ? categoryData : []);
  const trafficData = loading ? [] : (trafficData.length ? trafficData : []);
  const topProducts = loading ? [] : (topProductsData.length ? topProductsData : []);

  return (
    <div className="space-y-5">
      {
    /* Header */
  }
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Performance overview and insights</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {dateRanges.map((r) => <button
    key={r}
    onClick={() => setDateRange(r)}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${dateRange === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
              {r}
            </button>)}
        </div>
      </div>

      {
    /* KPI Row */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => <motion.div
    key={kpi.label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
  >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#f0ebe2] text-[#2d4a3e] flex items-center justify-center">
                {kpi.icon}
              </div>
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
            </div>
            <p className="font-display text-2xl text-gray-900">{kpi.value}</p>
            <p className={`text-xs mt-1 font-medium ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>{kpi.sub}</p>
          </motion.div>)}
      </div>

      {
    /* Revenue + Orders charts */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.24 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <h2 className="font-semibold text-gray-900 mb-4">Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d4a3e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2d4a3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
    tick={{ fontSize: 11, fill: "#9ca3af" }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(v) => `\xA3${(v / 1e3).toFixed(0)}k`}
  />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#2d4a3e" strokeWidth={2} fill="url(#aRevGrad)" />
              <Area type="monotone" dataKey="target" name="target" stroke="#c9b99a" strokeWidth={1.5} strokeDasharray="4 2" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.28 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <h2 className="font-semibold text-gray-900 mb-4">Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#2d4a3e" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {
    /* Category Pie + Traffic Line */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.32 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
    data={categoryRevenue}
    cx="50%"
    cy="50%"
    innerRadius={48}
    outerRadius={76}
    paddingAngle={2}
    dataKey="value"
  >
                  {categoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {categoryRevenue.map((cat) => <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-600 flex-1">{cat.name}</span>
                  <span className="text-xs font-semibold text-gray-900">{cat.value}%</span>
                </div>)}
            </div>
          </div>
        </motion.div>

        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.36 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
          <h2 className="font-semibold text-gray-900 mb-4">Traffic</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="sessions" name="sessions" stroke="#2d4a3e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pageviews" name="pageviews" stroke="#c9b99a" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {
    /* Top Products Table */
  }
      <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Sales Bar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => {
    const maxSales = Math.max(...topProducts.map((p) => p.sales));
    return <tr key={product.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-bold">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.sales}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">£{product.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
      className="h-1.5 rounded-full bg-[#2d4a3e] transition-all"
      style={{ width: `${product.sales / maxSales * 100}%` }}
    />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${product.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {product.growth >= 0 ? "+" : ""}{product.growth}%
                      </span>
                    </td>
                  </tr>;
  })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
);
export {
  AnalyticsDashboard as default
};
