import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { addressApi } from "../../services/api";

const emptyForm = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "United Kingdom",
  isDefault: false
};

function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Fetch addresses on mount
  useEffect(() => {
    addressApi
      .getAll()
      .then((res) => setAddresses(res.data ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenNew = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setForm({
      firstName:    addr.firstName    || "",
      lastName:     addr.lastName     || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city:         addr.city         || "",
      postalCode:   addr.postalCode   || "",
      country:      addr.country      || "United Kingdom",
      isDefault:    addr.isDefault    || false
    });
    setEditId(addr.id);
    setFormError("");
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditId(null);
    setFormError("");
  };

  const handleSave = async () => {
    if (!form.firstName || !form.addressLine1 || !form.city || !form.postalCode || !form.country) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editId) {
        const res = await addressApi.update(editId, form);
        setAddresses((prev) => prev.map((a) => a.id === editId ? res.data : a));
      } else {
        const res = await addressApi.create(form);
        setAddresses((prev) => [...prev, res.data]);
      }
      handleClose();
    } catch (err) {
      setFormError(err.message || "Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete address.");
    }
  };

  const inputClass = "w-full border-b border-[#8c8277] bg-transparent py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#8c8277]/50";
  const labelClass = "block text-xs font-medium tracking-widest uppercase text-[#8c8277] mb-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            My Account
          </p>
          <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Saved Addresses</h1>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-[#f0ebe2]"
          style={{ border: "1px solid #0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
        >
          <FiPlus size={14} /> New Address
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <FiLoader size={28} className="animate-spin" style={{ color: "#8c8277" }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && addresses.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0ebe2" }}>
            <FiMapPin size={32} style={{ color: "#c9b99a" }} />
          </div>
          <h2 className="font-display text-3xl mb-3" style={{ color: "#0a0a0a" }}>No saved addresses</h2>
          <p className="text-sm max-w-sm mb-8" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Add a delivery address to speed up your checkout experience.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-10 py-4 text-xs uppercase tracking-widest"
            style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
          >
            Add Address
          </button>
        </motion.div>
      )}

      {/* Address cards */}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative border p-6"
                style={{
                  borderColor: addr.isDefault ? "#0a0a0a" : "#f0ebe2",
                  backgroundColor: "#fafafa"
                }}
              >
                {/* Default badge */}
                {addr.isDefault && (
                  <span
                    className="absolute top-4 right-4 text-xs uppercase tracking-widest px-2 py-0.5"
                    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
                  >
                    Default
                  </span>
                )}

                <FiMapPin size={18} style={{ color: "#2d4a3e" }} className="mb-4" />
                <p className="font-medium text-sm mb-1" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {addr.city}, {addr.postalCode}
                </p>
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {addr.country}
                </p>

                <div className="flex items-center gap-4 mt-5 pt-4 border-t" style={{ borderColor: "#f0ebe2" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
                    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
                    style={{ color: "#b91c1c", fontFamily: "Manrope, sans-serif" }}
                  >
                    <FiTrash2 size={12} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,10,10,0.4)" }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg bg-white p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 transition-opacity hover:opacity-60"
                style={{ color: "#8c8277" }}
              >
                <FiX size={18} />
              </button>

              <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>
                {editId ? "Edit Address" : "New Address"}
              </h2>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Address Line 1 *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="12 Mayfair Lane"
                  value={form.addressLine1}
                  onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Address Line 2</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Apt 4B (optional)"
                  value={form.addressLine2}
                  onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="London"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postcode *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="W1K 1AB"
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Country *</label>
                <select
                  className={inputClass + " cursor-pointer"}
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                >
                  {["United Kingdom","United States","France","Germany","Italy","Spain","Netherlands","Australia","Canada"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors"
                  style={{
                    backgroundColor: form.isDefault ? "#0a0a0a" : "transparent",
                    borderColor: form.isDefault ? "#0a0a0a" : "#8c8277"
                  }}
                  onClick={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))}
                >
                  {form.isDefault && <FiCheck size={10} className="text-white" />}
                </div>
                <span className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  Set as default address
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
                >
                  {saving ? <><FiLoader size={13} className="animate-spin" /> Saving...</> : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-4 text-xs uppercase tracking-widest border transition-colors hover:bg-[#f0ebe2]"
                  style={{ borderColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { AddressesPage as default };
