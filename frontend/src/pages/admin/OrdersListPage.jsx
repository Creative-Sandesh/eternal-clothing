import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiDownload, FiEye, FiChevronRight, FiLoader } from "react-icons/fi";
import { orderApi } from "../../services/api";
import { downloadCsv } from "../../utils/csv";

// Forward-only status progression the quick-advance button steps through.
const NEXT_STATUS = { pending: "processing", processing: "shipped", shipped: "delivered" };

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600"
};

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];

function OrdersListPage() {
  const money = useMoney();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAdminOrders();
      const fetched = (res.data || []).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || `ORD-${o.id}`,
        customerName: o.user ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || "Customer" : "Guest",
        customerEmail: o.user?.email || "",
        items: Array.isArray(o.items) ? o.items : [],
        total: Number(o.totalAmount || o.total || 0),
        status: (o.status || "pending").toLowerCase(),
        createdAt: o.createdAt
      }));
      setOrders(fetched);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  async function advanceStatus(order) {
    const next = NEXT_STATUS[order.status];
    if (!next || advancingId) return;
    setAdvancingId(order.id);
    try {
      await orderApi.updateStatus(order.id, { status: next.toUpperCase() });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    } catch (err) {
      console.error("Failed to advance order status", err);
    } finally {
      setAdvancingId(null);
    }
  }

  function exportCsv() {
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "orderNumber", label: "Order #" },
        { key: "customerName", label: "Customer" },
        { key: "customerEmail", label: "Email" },
        { label: "Items", format: (o) => o.items.length },
        { label: "Total", format: (o) => o.total.toFixed(2) },
        { key: "status", label: "Status" },
        { label: "Date", format: (o) => (o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : "") },
      ],
      filtered
    );
  }
  const counts = tabs.reduce((acc, t) => {
    acc[t.value] = t.value === "all" ? orders.length : orders.filter((o) => o.status === t.value).length;
    return acc;
  }, {});
  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });
  const miniStats = [
    { label: "Processing", value: counts.processing, color: "text-amber-600 bg-amber-50" },
    { label: "Shipped", value: counts.shipped, color: "text-purple-600 bg-purple-50" },
    { label: "Delivered", value: counts.delivered, color: "text-green-600 bg-green-50" },
    { label: "Cancelled", value: counts.cancelled, color: "text-red-600 bg-red-50" }
  ];
  return <div className="space-y-5">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} orders total</p>
        </div>
        <button
    onClick={exportCsv}
    disabled={filtered.length === 0}
    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
  >
          <FiDownload size={14} /> Export
        </button>
      </div>

      {
    /* Mini stats */
  }
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {miniStats.map((s) => <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-0.5">{s.label}</p>
          </div>)}
      </div>

      {
    /* Filters */
  }
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {
    /* Tabs */
  }
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => <button
    key={tab.value}
    onClick={() => setActiveTab(tab.value)}
    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.value ? "border-[#2d4a3e] text-[#2d4a3e]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
  >
              {tab.label}
              {counts[tab.value] > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.value ? "bg-[#2d4a3e] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {counts[tab.value]}
                </span>}
            </button>)}
        </div>

        {
    /* Search + Date filter */
  }
        <div className="p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
    type="text"
    placeholder="Search order number or customer..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
          </div>
        </div>

        {
    /* Table */
  }
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{money(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
    onClick={() => navigate(`/admin/orders/${order.id}`)}
    className="p-1.5 text-gray-400 hover:text-[#2d4a3e] hover:bg-green-50 rounded-lg transition-colors"
    title="View"
  >
                        <FiEye size={14} />
                      </button>
                      {NEXT_STATUS[order.status] && (
                        <button
    onClick={() => advanceStatus(order)}
    disabled={advancingId === order.id}
    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
    title={`Mark as ${NEXT_STATUS[order.status]}`}
  >
                          {advancingId === order.id ? <FiLoader size={14} className="animate-spin" /> : <FiChevronRight size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">No orders found</p>
            </div>}
        </div>
      </div>
    </div>;
}
export {
  OrdersListPage as default
};
