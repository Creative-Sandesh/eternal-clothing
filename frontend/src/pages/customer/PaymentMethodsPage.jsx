import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiCreditCard, FiCheck, FiX } from "react-icons/fi";
import { paymentMethodApi } from "../../services/api";

const TYPES = [
  { value: "CARD", label: "Card" },
  { value: "ESEWA", label: "eSewa" },
  { value: "KHALTI", label: "Khalti" },
  { value: "COD", label: "Cash on Delivery" },
];

const brandDot = (type) =>
  ({ CARD: "#1a1a1a", ESEWA: "#60bb46", KHALTI: "#5c2d91", COD: "#8c8277" }[type] || "#8c8277");

function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "CARD", cardNumber: "", expiryMonth: "", expiryYear: "", walletId: "" });

  const load = useCallback(async () => {
    try {
      const res = await paymentMethodApi.getAll();
      setMethods(res.data || []);
    } catch (err) {
      console.error("Failed to load payment methods", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError("");
    if (form.type === "CARD" && form.cardNumber.replace(/\D/g, "").length < 12) {
      setError("Enter a valid card number");
      return;
    }
    if ((form.type === "ESEWA" || form.type === "KHALTI") && !form.walletId) {
      setError("Enter your wallet phone or email");
      return;
    }
    setSaving(true);
    try {
      await paymentMethodApi.add(form);
      setShowForm(false);
      setForm({ type: "CARD", cardNumber: "", expiryMonth: "", expiryYear: "", walletId: "" });
      await load();
    } catch (err) {
      setError(err.message || "Could not save payment method");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    try { await paymentMethodApi.remove(id); } catch (err) { console.error(err); load(); }
  };
  const makeDefault = async (id) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    try { await paymentMethodApi.setDefault(id); } catch (err) { console.error(err); load(); }
  };

  return <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1" style={{ color: "#0a0a0a" }}>Payment Methods</h1>
          <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>Saved instruments for faster checkout</p>
        </div>
        <button
    type="button"
    onClick={() => setShowForm((s) => !s)}
    className="flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-widest uppercase border transition-all hover:bg-[#0a0a0a] hover:text-[#fafafa]"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
          <FiPlus size={13} /> Add method
        </button>
      </div>

      <AnimatePresence>
        {showForm && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="mb-8 border p-6 overflow-hidden"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}
  >
            {error && <p className="text-xs mb-3" style={{ color: "#b91c1c" }}>{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8c8277" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 text-sm border bg-[#fafafa] outline-none" style={{ borderColor: "#8c8277" }}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {form.type === "CARD" && <>
                <div className="col-span-2">
                  <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8c8277" }}>Card Number</label>
                  <input value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full px-3 py-2.5 text-sm border bg-[#fafafa] outline-none font-mono" style={{ borderColor: "#8c8277" }} />
                  <p className="text-[10px] mt-1" style={{ color: "#8c8277" }}>Only the last 4 digits are stored.</p>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8c8277" }}>Expiry Month</label>
                  <input value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })} placeholder="MM" className="w-full px-3 py-2.5 text-sm border bg-[#fafafa] outline-none" style={{ borderColor: "#8c8277" }} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8c8277" }}>Expiry Year</label>
                  <input value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: e.target.value })} placeholder="YYYY" className="w-full px-3 py-2.5 text-sm border bg-[#fafafa] outline-none" style={{ borderColor: "#8c8277" }} />
                </div>
              </>}

              {(form.type === "ESEWA" || form.type === "KHALTI") && <div className="col-span-2">
                <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8c8277" }}>Wallet phone / email</label>
                <input value={form.walletId} onChange={(e) => setForm({ ...form, walletId: e.target.value })} placeholder="98XXXXXXXX" className="w-full px-3 py-2.5 text-sm border bg-[#fafafa] outline-none" style={{ borderColor: "#8c8277" }} />
              </div>}

              {form.type === "COD" && <p className="col-span-2 text-sm" style={{ color: "#8c8277" }}>Cash on delivery has nothing to configure — just add it.</p>}
            </div>

            <div className="flex gap-3 mt-5">
              <button type="button" onClick={submit} disabled={saving} className="px-5 py-2.5 text-xs tracking-widest uppercase" style={{ backgroundColor: "#0a0a0a", color: "#fafafa", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Save method"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-xs tracking-widest uppercase border flex items-center gap-1.5" style={{ borderColor: "#8c8277", color: "#8c8277" }}>
                <FiX size={12} /> Cancel
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {loading ? <p className="text-sm py-10 text-center" style={{ color: "#8c8277" }}>Loading…</p>
      : methods.length === 0 ? <div className="py-16 flex flex-col items-center gap-3">
          <FiCreditCard size={32} style={{ color: "#c9b99a" }} />
          <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>No payment methods saved yet</p>
        </div>
      : <div className="flex flex-col gap-3">
          {methods.map((m) => <div key={m.id} className="flex items-center gap-4 p-4 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandDot(m.type) + "22", color: brandDot(m.type) }}>
                <FiCreditCard size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#0a0a0a" }}>{m.label}</p>
                <p className="text-xs" style={{ color: "#8c8277" }}>
                  {m.type}{m.expiryMonth ? ` · exp ${String(m.expiryMonth).padStart(2, "0")}/${m.expiryYear}` : ""}
                </p>
              </div>
              {m.isDefault ? <span className="text-[10px] uppercase tracking-widest px-2 py-1" style={{ backgroundColor: "#2d4a3e", color: "#fafafa" }}>Default</span>
              : <button type="button" onClick={() => makeDefault(m.id)} className="text-xs underline" style={{ color: "#8c8277" }}>Make default</button>}
              <button type="button" onClick={() => remove(m.id)} className="p-2 transition-colors hover:text-red-500" style={{ color: "#8c8277" }} aria-label="Remove">
                <FiTrash2 size={14} />
              </button>
            </div>)}
        </div>}
    </div>;
}
export {
  PaymentMethodsPage as default
};
