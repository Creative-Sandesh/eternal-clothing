import { useState, useEffect, useCallback } from "react";
import { useMoney, useSettings } from "../../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiX, FiSave, FiRefreshCw, FiCheck } from "react-icons/fi";
import { couponApi } from "../../services/api";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Map a backend coupon row → the shape this page renders.
const toRow = (c) => ({
  id: c.id,
  code: c.code,
  type: c.discountType === "PERCENTAGE" ? "Percentage" : "Fixed",
  value: Number(c.discountValue),
  minOrder: c.minPurchaseAmount != null ? Number(c.minPurchaseAmount) : undefined,
  used: Number(c.timesUsed || 0),
  limit: c.usageLimit != null ? Number(c.usageLimit) : undefined,
  validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "",
  expiry: c.validUntil ? c.validUntil.slice(0, 10) : "",
  isActive: c.isActive,
  status:
    c.status === "ACTIVE" ? "Active"
    : c.status === "EXPIRED" ? "Expired"
    : c.status === "SCHEDULED" ? "Scheduled"
    : c.status === "EXHAUSTED" ? "Exhausted"
    : "Inactive"
});

const emptyForm = {
  code: "",
  type: "Percentage",
  value: "",
  minOrder: "",
  limit: "",
  validFrom: "",
  expiry: "",
  isActive: true
};

function CouponsPage() {
  const money = useMoney();
  const { symbol } = useSettings();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [rules, setRules] = useState([]);
  const [ruleDraft, setRuleDraft] = useState(null); // null | { …, id? }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [c, r] = await Promise.all([couponApi.getAll(), couponApi.getRules().catch(() => ({ data: [] }))]);
      setCoupons((c.data || []).map(toRow));
      setRules(r.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load coupons", err);
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRule = async () => {
    const payload = {
      name: ruleDraft.name,
      trigger: ruleDraft.trigger,
      threshold: Number(ruleDraft.threshold) || 0,
      reward: ruleDraft.reward,
      rewardValue: Number(ruleDraft.rewardValue) || 0,
      isActive: ruleDraft.isActive ?? true,
    };
    try {
      if (ruleDraft.id) await couponApi.updateRule(ruleDraft.id, payload);
      else await couponApi.createRule(payload);
      setRuleDraft(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to save rule");
    }
  };
  const deleteRule = async (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    try { await couponApi.deleteRule(id); } catch (err) { console.error(err); load(); }
  };
  const rewardText = (r) =>
    r.reward === "FREE_SHIPPING" ? "Free shipping"
    : r.reward === "PERCENT_OFF" ? `${Number(r.rewardValue)}% off order`
    : `${money(r.rewardValue)} off order`;
  const triggerText = (r) =>
    r.trigger === "MIN_ITEMS" ? `${Number(r.threshold)}+ items` : `Order ≥ ${money(r.threshold)}`;

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    { label: "Total Coupons", value: coupons.length },
    { label: "Active", value: coupons.filter((c) => c.status === "Active").length },
    { label: "Total Redemptions", value: coupons.reduce((sum, c) => sum + c.used, 0) },
    { label: "Expired", value: coupons.filter((c) => c.status === "Expired").length }
  ];

  function copyCode(code) {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      code: row.code,
      type: row.type,
      value: String(row.value),
      minOrder: row.minOrder != null ? String(row.minOrder) : "",
      limit: row.limit != null ? String(row.limit) : "",
      validFrom: row.validFrom,
      expiry: row.expiry,
      isActive: row.isActive
    });
    setShowForm(true);
  }

  function buildPayload() {
    return {
      code: form.code.toUpperCase().trim(),
      discountType: form.type === "Percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
      discountValue: parseFloat(form.value),
      minPurchaseAmount: form.minOrder ? parseFloat(form.minOrder) : null,
      usageLimit: form.limit ? parseInt(form.limit, 10) : null,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : new Date().toISOString(),
      validUntil: new Date(form.expiry).toISOString(),
      isActive: form.isActive
    };
  }

  async function handleSubmit() {
    if (!form.code || !form.value || !form.expiry) {
      setError("Code, value and expiry date are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await couponApi.update(editingId, buildPayload());
      } else {
        await couponApi.create(buildPayload());
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error("Failed to save coupon", err);
      setError(err.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(id) {
    try {
      await couponApi.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete coupon", err);
      setError(err.message || "Failed to delete coupon");
    }
  }

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Coupons</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Manage discount codes and promotions</p>
        </div>
        <button
    onClick={showForm ? () => setShowForm(false) : openCreate}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      {error && <div className="px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
            <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
          </div>)}
      </div>

      {/* Create / edit form */}
      <AnimatePresence>
        {showForm && <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
            <p className="font-semibold text-sm text-[#0a0a0a]">{editingId ? "Edit Coupon" : "New Coupon"}</p>
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
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Value {form.type === "Percentage" ? "(%)" : `(${symbol.trim()})`}</label>
                <input
    type="number"
    value={form.value}
    onChange={(e) => setForm({ ...form, value: e.target.value })}
    placeholder={form.type === "Percentage" ? "10" : "25"}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Min Order ({symbol.trim()})</label>
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
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Valid From</label>
                <input
    type="date"
    value={form.validFrom}
    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Expiry Date *</label>
                <input
    type="date"
    value={form.expiry}
    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                  <input
    type="checkbox"
    checked={form.isActive}
    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
    className="rounded border-gray-300 text-[#2d4a3e]"
  />
                  <span className="text-[#0a0a0a]">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors disabled:opacity-60">
                <FiSave size={14} /> {saving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                <FiX size={14} /> Cancel
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Table */}
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
              {loading ? <tr><td colSpan={8} className="px-4 py-10 text-center text-[#8c8277]">Loading coupons…</td></tr>
              : coupons.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-[#8c8277]">No coupons yet. Create your first one.</td></tr>
              : coupons.map((c) => <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-[#0a0a0a] text-xs">{c.code}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.type}</td>
                  <td className="px-4 py-3 font-medium text-[#0a0a0a]">{c.type === "Percentage" ? `${c.value}%` : money(c.value)}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.minOrder ? money(c.minOrder) : "—"}</td>
                  <td className="px-4 py-3 text-[#8c8277]">
                    {c.limit ? <span><span className="text-[#0a0a0a] font-medium">{c.used}</span>/{c.limit}</span> : <span>{c.used} / ∞</span>}
                  </td>
                  <td className="px-4 py-3 text-[#8c8277] whitespace-nowrap">{c.expiry || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : c.status === "Expired" || c.status === "Exhausted" ? "bg-red-50 text-red-500" : c.status === "Scheduled" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyCode(c.code)} className="p-1.5 text-[#8c8277] hover:text-[#2d4a3e] hover:bg-[#2d4a3e]/10 rounded-md transition-colors" title="Copy code">
                        {copied === c.code ? <FiCheck size={13} className="text-[#2d4a3e]" /> : <FiCopy size={13} />}
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automatic discount rules — applied at checkout, no code needed */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-[#0a0a0a]">Automatic Discount Rules</p>
            <p className="text-xs text-[#8c8277] mt-0.5">Applied at checkout automatically — no code required</p>
          </div>
          <button onClick={() => setRuleDraft({ name: "", trigger: "MIN_SUBTOTAL", threshold: 100, reward: "FREE_SHIPPING", rewardValue: 0, isActive: true })} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#0a0a0a]">
            <FiPlus size={12} /> Add Rule
          </button>
        </div>

        {ruleDraft && <div className="p-5 bg-[#f0ebe2]/30 border-b border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input value={ruleDraft.name} onChange={(e) => setRuleDraft({ ...ruleDraft, name: e.target.value })} placeholder="Rule name" className="col-span-2 md:col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select value={ruleDraft.trigger} onChange={(e) => setRuleDraft({ ...ruleDraft, trigger: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="MIN_SUBTOTAL">Order subtotal ≥</option>
            <option value="MIN_ITEMS">Item count ≥</option>
          </select>
          <input type="number" value={ruleDraft.threshold} onChange={(e) => setRuleDraft({ ...ruleDraft, threshold: e.target.value })} placeholder="Threshold" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select value={ruleDraft.reward} onChange={(e) => setRuleDraft({ ...ruleDraft, reward: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="FREE_SHIPPING">Free shipping</option>
            <option value="PERCENT_OFF">% off order</option>
            <option value="FIXED_OFF">Fixed amount off</option>
          </select>
          {ruleDraft.reward !== "FREE_SHIPPING" && <input type="number" value={ruleDraft.rewardValue} onChange={(e) => setRuleDraft({ ...ruleDraft, rewardValue: e.target.value })} placeholder={ruleDraft.reward === "PERCENT_OFF" ? "%" : "amount"} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />}
          <div className="col-span-2 md:col-span-3 flex gap-2">
            <button onClick={saveRule} className="px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e]">Save rule</button>
            <button onClick={() => setRuleDraft(null)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Rule Name", "Trigger", "Discount", "Status", ""].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">No automatic rules.</td></tr>}
            {rules.map((r) => <tr key={r.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 font-medium text-[#0a0a0a]">{r.name}</td>
                <td className="px-5 py-3 text-[#8c8277]">{triggerText(r)}</td>
                <td className="px-5 py-3 text-[#8c8277]">{rewardText(r)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-gray-100 text-gray-500"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setRuleDraft({ ...r, threshold: String(r.threshold), rewardValue: String(r.rewardValue) })} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md"><FiEdit2 size={13} /></button>
                    <button onClick={() => deleteRule(r.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md"><FiTrash2 size={13} /></button>
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
