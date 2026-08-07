import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCreditCard, FiPlus, FiEdit2, FiTrash2, FiCheck, FiLock, FiX } from "react-icons/fi";
const initialCards = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "09/26", name: "Aria Laurent", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "8888", expiry: "03/25", name: "Aria Laurent", isDefault: false }
];
const brandColors = {
  Visa: { bg: "#1a1f71", text: "#fafafa" },
  Mastercard: { bg: "#eb001b", text: "#fafafa" }
};
function PaymentMethodsPage() {
  const [cards, setCards] = useState(initialCards);
  const [showForm, setShowForm] = useState(false);
  const [paypalLinked] = useState(true);
  const [form, setForm] = useState({ number: "", expiry: "", cvv: "", name: "", useBilling: true });
  const [saved, setSaved] = useState(false);
  function setDefault(id) {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  }
  function remove(id) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }
  function formatCardNumber(val) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(val) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }
  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setForm({ number: "", expiry: "", cvv: "", name: "", useBilling: true });
    }, 1500);
  }
  return <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="font-display text-3xl" style={{ color: "#0a0a0a" }}>Payment Methods</h1>
        <button
    type="button"
    onClick={() => setShowForm(true)}
    className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase transition-all hover:bg-[#2d4a3e] w-full sm:w-auto"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
          <FiPlus size={14} />
          Add New Card
        </button>
      </div>

      {
    /* Saved cards */
  }
      <div className="mb-8">
        <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>Saved Cards</h2>
        <div className="flex flex-col gap-3">
          {cards.map((card) => <div
    key={card.id}
    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 p-4 border"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
              {
    /* Card visual */
  }
              <div
    className="flex-shrink-0 w-14 h-9 rounded flex items-center justify-center text-xs font-bold tracking-wider"
    style={{ backgroundColor: brandColors[card.brand].bg, color: brandColors[card.brand].text }}
  >
                {card.brand === "Visa" ? "VISA" : "MC"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: "#0a0a0a" }}>
                    •••• •••• •••• {card.last4}
                  </p>
                  {card.isDefault && <span
    className="text-[10px] px-2 py-0.5 uppercase tracking-widest font-semibold"
    style={{ backgroundColor: "#2d4a3e", color: "#fafafa" }}
  >
                      Default
                    </span>}
                </div>
                <p className="text-xs" style={{ color: "#8c8277" }}>
                  {card.name} · Expires {card.expiry}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                {!card.isDefault && <button
    type="button"
    onClick={() => setDefault(card.id)}
    className="text-xs px-3 py-1.5 border transition-colors hover:bg-[#f0ebe2]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277" }}
  >
                    Set Default
                  </button>}
                <button
    type="button"
    className="p-2 hover:opacity-60 transition-opacity"
    style={{ color: "#8c8277" }}
    aria-label="Edit card"
  >
                  <FiEdit2 size={14} />
                </button>
                <button
    type="button"
    onClick={() => remove(card.id)}
    className="p-2 hover:opacity-60 transition-opacity"
    style={{ color: "#8c8277" }}
    aria-label="Remove card"
  >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>)}
        </div>
      </div>

      {
    /* Security note */
  }
      <div
    className="flex items-center gap-3 px-4 py-3 mb-8 border"
    style={{ borderColor: "#c9b99a", backgroundColor: "#f0ebe2", fontFamily: "Manrope, sans-serif" }}
  >
        <FiLock size={14} style={{ color: "#8c8277" }} />
        <p className="text-xs" style={{ color: "#8c8277" }}>
          Your payment info is encrypted and stored securely. We never store your full card number.
        </p>
      </div>

      {
    /* PayPal section */
  }
      <div>
        <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>PayPal</h2>
        <div className="p-4 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
          {paypalLinked ? <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
    className="w-10 h-10 rounded flex items-center justify-center text-xs font-bold"
    style={{ backgroundColor: "#003087", color: "#fafafa" }}
  >
                  PP
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#0a0a0a" }}>PayPal linked</p>
                  <p className="text-xs" style={{ color: "#8c8277" }}>aria.laurent@email.com</p>
                </div>
              </div>
              <button
    type="button"
    className="text-xs px-4 py-2 border transition-colors hover:bg-[#f0ebe2]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277" }}
  >
                Unlink
              </button>
            </div> : <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "#8c8277" }}>No PayPal account linked</p>
              <button
    type="button"
    className="text-xs px-4 py-2 transition-colors hover:bg-[#2d4a3e]"
    style={{ backgroundColor: "#003087", color: "#fafafa" }}
  >
                Link PayPal
              </button>
            </div>}
        </div>
      </div>

      {
    /* Add card form panel */
  }
      <AnimatePresence>
        {showForm && <>
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-40 bg-[#0a0a0a]/40"
    onClick={() => setShowForm(false)}
  />
            <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "tween", duration: 0.32, ease: [0.25, 0, 0, 1] }}
    className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#fafafa] flex flex-col shadow-2xl"
    style={{ fontFamily: "Manrope, sans-serif" }}
  >
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#f0ebe2" }}>
                <h2 className="font-display text-xl" style={{ color: "#0a0a0a" }}>Add New Card</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:opacity-60 transition-opacity" style={{ color: "#0a0a0a" }}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Card Number</label>
                  <div className="relative">
                    <FiCreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8c8277" }} />
                    <input
    type="text"
    placeholder="1234 5678 9012 3456"
    value={form.number}
    onChange={(e) => setForm((f) => ({ ...f, number: formatCardNumber(e.target.value) }))}
    className="w-full pl-10 pr-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Expiry (MM/YY)</label>
                    <input
    type="text"
    placeholder="MM/YY"
    value={form.expiry}
    onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>CVV</label>
                    <input
    type="text"
    placeholder="•••"
    maxLength={4}
    value={form.cvv}
    onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }))}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Cardholder Name</label>
                  <input
    type="text"
    placeholder="As it appears on your card"
    value={form.name}
    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
    className="w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors"
    style={{ borderColor: form.useBilling ? "#0a0a0a" : "#c9b99a", backgroundColor: form.useBilling ? "#0a0a0a" : "transparent" }}
    onClick={() => setForm((f) => ({ ...f, useBilling: !f.useBilling }))}
  >
                    {form.useBilling && <FiCheck size={10} style={{ color: "#fafafa" }} />}
                  </div>
                  <span className="text-sm" style={{ color: "#0a0a0a" }}>Use saved billing address</span>
                </label>
              </div>

              <div className="px-6 py-5 border-t" style={{ borderColor: "#f0ebe2" }}>
                <button
    type="button"
    onClick={handleSave}
    className="w-full py-3.5 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
    style={{ backgroundColor: saved ? "#2d4a3e" : "#0a0a0a", color: "#fafafa" }}
  >
                  {saved ? <><FiCheck size={14} /> Saved!</> : "Save Card"}
                </button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}
export {
  PaymentMethodsPage as default
};
