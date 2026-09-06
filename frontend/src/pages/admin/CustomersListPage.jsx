import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiDownload, FiEye, FiUsers, FiStar, FiTrendingUp, FiUserPlus } from "react-icons/fi";
import { userApi } from "../../services/api";

const tierColors = {
  Platinum: "bg-purple-100 text-purple-700",
  Gold: "bg-amber-100 text-amber-700",
  Silver: "bg-gray-100 text-gray-600",
  Bronze: "bg-orange-100 text-orange-700"
};

const tiers = ["All", "Platinum", "Gold", "Silver", "Bronze"];

function CustomersListPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("All");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCustomers = async () => {
      try {
        const res = await userApi.getCustomers();
        if (!active) return;
        const fetched = (res.data || []).map((c) => ({
          id: c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer",
          email: c.email || "",
          tier: c.role === "ADMIN" ? "Platinum" : "Silver",
          totalOrders: Number(c.orderCount || 0),
          totalSpent: Number(c.totalSpent || 0),
          tags: [c.role || "CUSTOMER"],
          joinedAt: c.createdAt
        }));
        setCustomers(fetched);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCustomers();
    return () => { active = false; };
  }, []);

  const stats = [
    { label: "Total Customers", value: customers.length, icon: <FiUsers size={18} /> },
    { label: "New This Month", value: customers.filter(c => new Date(c.joinedAt) > new Date(Date.now() - 30 * 86400000)).length, icon: <FiUserPlus size={18} /> },
    { label: "VIP Customers", value: customers.filter((c) => c.tier === "Platinum").length, icon: <FiStar size={18} /> },
    { label: "Avg Lifetime Value", value: "£" + (customers.length ? Math.round(customers.reduce((a, c) => a + c.totalSpent, 0) / customers.length).toLocaleString() : 0), icon: <FiTrendingUp size={18} /> }
  ];
  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tier === "All" || c.tier === tier;
    return matchSearch && matchTier;
  });
  return <div className="space-y-5">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} customers total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          <FiDownload size={14} /> Export
        </button>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => <motion.div
    key={s.label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
  >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0ebe2] text-[#2d4a3e] flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </motion.div>)}
      </div>

      {
    /* Table */
  }
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {
    /* Tier tabs */
  }
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tiers.map((t) => <button
    key={t}
    onClick={() => setTier(t)}
    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tier === t ? "border-[#2d4a3e] text-[#2d4a3e]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
  >
              {t}
              {t !== "All" && <span className="ml-1.5 text-xs text-gray-400">({customers.filter((c) => c.tier === t).length})</span>}
            </button>)}
        </div>

        {
    /* Search */
  }
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
    type="text"
    placeholder="Search customers..."
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => <tr key={customer.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#f0ebe2] flex items-center justify-center text-[#2d4a3e] font-bold text-sm flex-shrink-0">
                        {customer.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {customer.tags.map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs">{customer.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[customer.tier]}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{customer.totalOrders}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">£{customer.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                    {new Date(customer.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-gray-400 hover:text-[#2d4a3e] hover:bg-green-50 rounded-lg transition-colors" title="View">
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">No customers found</p>
            </div>}
        </div>
      </div>
    </div>;
}
export {
  CustomersListPage as default
};
