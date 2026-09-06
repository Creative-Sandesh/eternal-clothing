import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiX, FiSave, FiRefreshCw, FiCheck } from "react-icons/fi";
import { couponApi } from "../../services/api";
const initialCoupons = [
  { id: "1", code: "ETERNAL10", type: "Percentage", value: 10, used: 148, limit: void 0, expiry: void 0, status: "Active" },
  { id: "2", code: "WELCOME20", type: "Percentage", value: 20, used: 67, limit: 100, expiry: "2025-06-30", status: "Active" },
  { id: "3", code: "SUMMER30", type: "Percentage", value: 30, minOrder: 150, used: 89, limit: void 0, expiry: "2024-08-31", status: "Expired" },
  { id: "4", code: "FRIENDS15", type: "Percentage", value: 15, used: 34, limit: void 0, expiry: void 0, status: "Active", note: "Referral" },
  { id: "5", code: "FLASH50", type: "Percentage", value: 50, used: 23, limit: 50, expiry: "2025-01-02", status: "Active" },
  { id: "6", code: "SAVE25", type: "Fixed", value: 25, minOrder: 100, used: 12, limit: 200, expiry: "2025-12-31", status: "Active" }
];
const discountRules = [
  { id: "1", name: "Free Shipping on \xA3200+", trigger: "Order total \u2265 \xA3200", discount: "Free shipping", status: "Active" },
  { id: "2", name: "Buy 3 Get 10% Off", trigger: "3 or more items", discount: "10% off order", status: "Active" },
  { id: "3", name: "Platinum Member Bonus", trigger: "Platinum loyalty tier", discount: "5% always on", status: "Active" }
];
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function CouponsPage() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState({
    code: "",
    type: "Percentage",
    value: "",
    minOrder: "",
    limit: "",
    expiry: "",
    categories: [],
    status: "Active"
  });
  const stats = [
    { label: "Total Coupons", value: coupons.length },
    { label: "Active", value: coupons.filter((c) => c.status === "Active").length },
    { label: "Used Today", value: 34 },
    { label: "Revenue from Coupons", value: "\xA32,840" }
  ];
  function copyCode(code) {
    navigator.clipboard.writeText(code).catch(() => {
    });
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  async function handleCreate() {
    if (!form.code || !form.value) return;
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.type === "Percentage" ? "PERCENTAGE" : "FIXED",
        discountValue: parseFloat(form.value),
        minPurchaseAmount: form.minOrder ? parseFloat(form.minOrder) : 0,
        maxUses: form.limit ? parseInt(form.limit) : null,
        expiresAt: form.expiry || null
      };
      const res = await couponApi.create(payload);
      if (res.data) {
        setCoupons([...coupons, {
          id: res.data.id,
          code: res.data.code,
          type: form.type,
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : void 0,
          used: 0,
          limit: form.limit ? parseInt(form.limit) : void 0,
          expiry: form.expiry || void 0,
          status: form.status
        }]);
      }
    } catch (err) {
      console.error("Failed to create coupon", err);
    }
    setForm({ code: "", type: "Percentage", value: "", minOrder: "", limit: "", expiry: "", categories: [], status: "Active" });
    setShowForm(false);
  }

  async function deleteCoupon(id) {
    try {
      await couponApi.delete(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  }
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Coupons</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Manage discount codes and promotions</p>
        </div>
        <button
    onClick={() => setShowForm(!showForm)}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
            <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
          </div>)}
      </div>

      {
    /* Create form */
  }
      <AnimatePresence>
        {showForm && <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
            <p className="font-semibold text-sm text-[#0a0a0a]">New Coupon</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Code</label>
                <div className="flex gap-2">
                  <input
    value={form.code}
    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
    placeholder="ETERNAL10"
    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] uppercase"
  />
                  <button
    onClick={() => setForm({ ...form, code: generateCode() })}
    className="px-2 border border-gray-200 rounded-lg text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
    title="Auto-generate"
  >
                    <FiRefreshCw size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Type</label>
                <select
    value={form.type}
    onChange={(e) => setForm({ ...form, type: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                  <option>Percentage</option>
                  <option>Fixed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Value {form.type === "Percentage" ? "(%)" : "(\xA3)"}</label>
                <input
    type="number"
    value={form.value}
    onChange={(e) => setForm({ ...form, value: e.target.value })}
    placeholder={form.type === "Percentage" ? "10" : "25"}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Min Order (£)</label>
                <input
    type="number"
    value={form.minOrder}
    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
    placeholder="Optional"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Usage Limit</label>
                <input
    type="number"
    value={form.limit}
    onChange={(e) => setForm({ ...form, limit: e.target.value })}
    placeholder="Unlimited"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Expiry Date</label>
                <input
    type="date"
    value={form.expiry}
    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8c8277] font-medium block mb-1">Apply to Categories</label>
              <div className="flex flex-wrap gap-2">
                {["Tops", "Bottoms", "Outerwear", "Knitwear", "Footwear", "Accessories"].map((cat) => <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
    type="checkbox"
    checked={form.categories.includes(cat)}
    onChange={(e) => setForm({
      ...form,
      categories: e.target.checked ? [...form.categories, cat] : form.categories.filter((c) => c !== cat)
    })}
    className="rounded border-gray-300 text-[#2d4a3e]"
  />
                    <span className="text-[#0a0a0a]">{cat}</span>
                  </label>)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <span className="text-[#8c8277]">Status:</span>
                <select
    value={form.status}
    onChange={(e) => setForm({ ...form, status: e.target.value })}
    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                <FiSave size={14} /> Create Coupon
              </button>
              <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                <FiX size={14} /> Cancel
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {
    /* Table */
  }
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-sm text-[#0a0a0a]">Coupon Codes</p>
          <span className="text-xs text-[#8c8277]">{coupons.length} codes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Code", "Type", "Value", "Min Order", "Usage", "Expiry", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-[#0a0a0a] text-xs">{c.code}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.type}</td>
                  <td className="px-4 py-3 font-medium text-[#0a0a0a]">{c.type === "Percentage" ? `${c.value}%` : `\xA3${c.value}`}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.minOrder ? `\xA3${c.minOrder}` : "\u2014"}</td>
                  <td className="px-4 py-3 text-[#8c8277]">
                    {c.limit ? <span>
                        <span className="text-[#0a0a0a] font-medium">{c.used}</span>/{c.limit}
                      </span> : <span>{c.used} / ∞</span>}
                  </td>
                  <td className="px-4 py-3 text-[#8c8277] whitespace-nowrap">{c.expiry ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : c.status === "Expired" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyCode(c.code)} className="p-1.5 text-[#8c8277] hover:text-[#2d4a3e] hover:bg-[#2d4a3e]/10 rounded-md transition-colors" title="Copy code">
                        {copied === c.code ? <FiCheck size={13} className="text-[#2d4a3e]" /> : <FiCopy size={13} />}
                      </button>
                      <button className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors">
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Discount Rules */
  }
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-[#0a0a0a]">Automatic Discount Rules</p>
            <p className="text-xs text-[#8c8277] mt-0.5">Applied automatically at checkout — no code required</p>
          </div>
          <button className="flex items-center gap-2 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#0a0a0a]">
            <FiPlus size={12} /> Add Rule
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Rule Name", "Trigger", "Discount", "Status", ""].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {discountRules.map((r) => <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                <td className="px-5 py-3 font-medium text-[#0a0a0a]">{r.name}</td>
                <td className="px-5 py-3 text-[#8c8277]">{r.trigger}</td>
                <td className="px-5 py-3 text-[#8c8277]">{r.discount}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2d4a3e]/10 text-[#2d4a3e]">{r.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors"><FiEdit2 size={13} /></button>
                    <button className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><FiTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
export {
  CouponsPage as default
};
