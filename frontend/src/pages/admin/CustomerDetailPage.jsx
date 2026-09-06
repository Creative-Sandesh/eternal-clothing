import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiStar, FiMapPin, FiMail, FiPhone, FiShoppingBag, FiAward, FiMessageSquare, FiSend } from "react-icons/fi";
import { userApi, orderApi } from "../../services/api";

const tierColors = {
  Bronze: "bg-amber-100 text-amber-700",
  Silver: "bg-gray-100 text-gray-600",
  Gold: "bg-yellow-100 text-yellow-700",
  Platinum: "bg-[#2d4a3e]/10 text-[#2d4a3e]"
};

const mockReviews = [
  { id: "1", product: "Oversized Cotton Poplin Shirt", rating: 5, comment: "Exceptional quality. The fabric is incredibly luxurious.", date: "2024-12-10" },
  { id: "2", product: "Relaxed Wool Trouser", rating: 4, comment: "Great fit and finish. Highly recommend.", date: "2024-11-02" }
];

const mockActivity = [
  { id: "1", event: "Placed order", time: "Recent", icon: <FiShoppingBag size={12} /> },
  { id: "2", event: "Left a review", time: "Recent", icon: <FiStar size={12} /> },
  { id: "3", event: "Account active", time: "Now", icon: <FiAward size={12} /> }
];

function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([
    { text: "VIP customer account.", date: new Date().toISOString().split("T")[0] }
  ]);

  useEffect(() => {
    let active = true;
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const [cRes, oRes] = await Promise.all([
          userApi.getCustomerById(id).catch(() => null),
          orderApi.getAdminOrders().catch(() => ({ data: [] }))
        ]);
        if (!active) return;
        if (cRes?.data) {
          const c = cRes.data;
          setCustomer({
            id: c.id,
            name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer",
            email: c.email || "",
            phone: c.phone || "N/A",
            tier: c.role === "ADMIN" ? "Platinum" : "Silver",
            joinedAt: new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            totalOrders: Number(c.orderCount || 0),
            totalSpent: Number(c.totalSpent || 0),
            loyaltyPoints: Number(c.loyaltyPoints || 150),
            tags: [c.role || "CUSTOMER"],
            address: { line1: "123 High Street", city: "London", zip: "EC1A 1BB", country: "United Kingdom" }
          });
        }
        const filteredOrders = (oRes?.data || [])
          .filter(o => String(o.userId) === String(id))
          .map(o => ({
            id: o.id,
            orderNumber: o.orderNumber || `ORD-${o.id}`,
            createdAt: new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            items: o.items || [],
            total: Number(o.totalAmount || o.total || 0),
            status: (o.status || "pending").toLowerCase()
          }));
        setCustomerOrders(filteredOrders);
      } catch (err) {
        console.error("Failed to load customer detail", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCustomerData();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="py-24 text-center text-[#8c8277]">Loading customer details...</div>;
  if (!customer) return <div className="py-24 text-center text-[#8c8277]">Customer not found</div>;
  const avgOrderValue = customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;
  function addNote() {
    if (!note.trim()) return;
    setNotes([{ text: note, date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }, ...notes]);
    setNote("");
  }
  return <div className="space-y-6">
      {
    /* Back + header */
  }
      <div>
        <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-[#8c8277] hover:text-[#0a0a0a] transition-colors mb-4">
          <FiArrowLeft size={14} /> Back to Customers
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2d4a3e] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl text-[#0a0a0a]">{customer.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierColors[customer.tier]}`}>
                  {customer.tier}
                </span>
              </div>
              <p className="text-sm text-[#8c8277] mt-0.5">{customer.email} · Joined {customer.joinedAt}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-[#0a0a0a]">
            <FiEdit2 size={14} /> Edit Customer
          </button>
        </div>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
    { label: "Total Orders", value: customer.totalOrders },
    { label: "Total Spent", value: `\xA3${customer.totalSpent.toLocaleString()}` },
    { label: "Avg Order Value", value: `\xA3${avgOrderValue}` },
    { label: "Loyalty Points", value: customer.loyaltyPoints.toLocaleString() }
  ].map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
            <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
          </div>)}
      </div>

      {
    /* Two-column */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Left */
  }
        <div className="lg:col-span-2 space-y-6">
          {
    /* Orders */
  }
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-sm text-[#0a0a0a]">Purchase History</p>
            </div>
            {customerOrders.length > 0 ? <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Order", "Date", "Items", "Total", "Status"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((o) => <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#0a0a0a] font-medium">{o.orderNumber}</td>
                      <td className="px-5 py-3 text-[#8c8277] text-xs">{o.createdAt}</td>
                      <td className="px-5 py-3 text-[#8c8277]">{o.items?.length ?? "\u2014"}</td>
                      <td className="px-5 py-3 font-medium text-[#0a0a0a]">£{o.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${o.status === "delivered" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : o.status === "processing" ? "bg-blue-50 text-blue-600" : o.status === "shipped" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table> : <div className="px-5 py-8 text-center text-[#8c8277] text-sm">No orders yet</div>}
          </div>

          {
    /* Reviews */
  }
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-sm text-[#0a0a0a]">Reviews</p>
            </div>
            <div className="divide-y divide-gray-50">
              {mockReviews.map((r) => <div key={r.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-[#0a0a0a]">{r.product}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => <FiStar key={i} size={12} className={i < r.rating ? "text-[#c9b99a] fill-current" : "text-gray-200"} />)}
                    </div>
                  </div>
                  <p className="text-sm text-[#8c8277]">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.date}</p>
                </div>)}
            </div>
          </div>

          {
    /* Addresses */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-3">Addresses on File</p>
            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
              <FiMapPin size={16} className="text-[#8c8277] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#8c8277]">
                <p className="text-[#0a0a0a] font-medium">Primary</p>
                <p>{customer.address.line1}</p>
                <p>{customer.address.city}{customer.address.state ? `, ${customer.address.state}` : ""} {customer.address.zip}</p>
                <p>{customer.address.country}</p>
              </div>
            </div>
          </div>

          {
    /* Notes */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-3">Internal Notes</p>
            <div className="space-y-2 mb-3">
              {notes.map((n, i) => <div key={i} className="p-3 bg-[#f0ebe2]/30 rounded-lg">
                  <p className="text-sm text-[#0a0a0a]">{n.text}</p>
                  <p className="text-xs text-[#8c8277] mt-1">{n.date}</p>
                </div>)}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiMessageSquare className="absolute left-3 top-3 text-gray-400" size={14} />
                <textarea
    value={note}
    onChange={(e) => setNote(e.target.value)}
    placeholder="Add an internal note..."
    rows={2}
    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d4a3e] resize-none"
  />
              </div>
              <button onClick={addNote} className="flex items-center gap-1.5 px-3 self-end py-2.5 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                <FiSend size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        {
    /* Right */
  }
        <div className="space-y-6">
          {
    /* Contact */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-3">Contact Details</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <FiMail size={14} className="text-[#8c8277] flex-shrink-0" />
                <span className="text-[#0a0a0a] truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <FiPhone size={14} className="text-[#8c8277] flex-shrink-0" />
                <span className="text-[#0a0a0a]">{customer.phone}</span>
              </div>
            </div>
            {customer.tags.length > 0 && <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-[#8c8277] font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => <span key={tag} className="text-xs px-2.5 py-0.5 bg-[#f0ebe2] text-[#8c8277] rounded-full">{tag}</span>)}
                </div>
              </div>}
          </div>

          {
    /* Loyalty */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-3">Loyalty</p>
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${tierColors[customer.tier]}`}>
                <FiAward size={14} /> {customer.tier}
              </span>
              <span className="text-2xl font-display text-[#0a0a0a]">{customer.loyaltyPoints.toLocaleString()} pts</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
    { label: "Earned from orders", value: `${(customer.loyaltyPoints * 0.9).toFixed(0)} pts` },
    { label: "Bonus rewards", value: `${(customer.loyaltyPoints * 0.1).toFixed(0)} pts` },
    { label: "Redeemed", value: "0 pts" }
  ].map((row) => <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#8c8277]">{row.label}</span>
                  <span className="text-[#0a0a0a] font-medium">{row.value}</span>
                </div>)}
            </div>
          </div>

          {
    /* Activity */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-4">Recent Activity</p>
            <div className="relative">
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-4">
                {mockActivity.map((a) => <div key={a.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 relative z-10 text-[#8c8277]">
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[#0a0a0a]">{a.event}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  CustomerDetailPage as default
};
