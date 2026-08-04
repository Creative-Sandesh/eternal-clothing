import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiCheck } from "react-icons/fi";
const initialAddresses = [
  {
    id: "a1",
    name: "Home",
    line1: "12 Redchurch Street",
    city: "London",
    state: "",
    zip: "E2 7DJ",
    country: "United Kingdom",
    isDefault: true
  },
  {
    id: "a2",
    name: "Office",
    line1: "88 Wood Street",
    line2: "4th Floor",
    city: "London",
    state: "",
    zip: "EC2V 7RS",
    country: "United Kingdom",
    isDefault: false
  }
];
const emptyAddress = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: ""
};
function AddressesPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const handleOpenNew = () => {
    setForm(emptyAddress);
    setEditId(null);
    setShowForm(true);
  };
  const handleOpenEdit = (addr) => {
    setForm({ name: addr.name, line1: addr.line1, line2: addr.line2 ?? "", city: addr.city, state: addr.state, zip: addr.zip, country: addr.country });
    setEditId(addr.id);
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.name || !form.line1 || !form.city || !form.zip || !form.country) return;
    if (editId) {
      setAddresses((prev) => prev.map((a) => a.id === editId ? { ...a, ...form } : a));
    } else {
      setAddresses((prev) => [...prev, { ...form, id: `a${Date.now()}`, isDefault: prev.length === 0 }]);
    }
    setShowForm(false);
    setEditId(null);
  };
  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };
  const handleSetDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };
  const inputStyle = {
    color: "#0a0a0a",
    fontFamily: "Manrope, sans-serif",
    caretColor: "#2d4a3e"
  };
  const labelStyle = { color: "#8c8277", fontFamily: "Manrope, sans-serif" };
  const formFields = [
    { name: "name", label: "Address Name (e.g. Home)", colSpan: true },
    { name: "line1", label: "Address Line 1", colSpan: true },
    { name: "line2", label: "Address Line 2 (optional)", colSpan: true },
    { name: "city", label: "City" },
    { name: "state", label: "State / County" },
    { name: "zip", label: "Postcode / ZIP" },
    { name: "country", label: "Country" }
  ];
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            My Account
          </p>
          <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Addresses</h1>
        </div>
        <button
    type="button"
    onClick={handleOpenNew}
    className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest flex-shrink-0"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
          <FiPlus size={14} />
          Add New
        </button>
      </div>

      {
    /* Address cards */
  }
      {addresses.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center">
          <FiMapPin size={40} style={{ color: "#c9b99a" }} className="mb-4" />
          <h3 className="font-display text-2xl mb-2" style={{ color: "#0a0a0a" }}>No addresses saved</h3>
          <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Add an address to speed up your checkout.
          </p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {addresses.map((addr) => <motion.div
    key={addr.id}
    layout
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="border p-6 relative"
    style={{
      borderColor: addr.isDefault ? "#0a0a0a" : "#f0ebe2",
      backgroundColor: "#fafafa"
    }}
  >
                {
    /* Default badge */
  }
                {addr.isDefault && <span
    className="absolute top-4 right-4 text-xs uppercase tracking-widest px-2 py-0.5"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                    Default
                  </span>}

                <div className="flex items-center gap-2 mb-3">
                  <FiMapPin size={15} style={{ color: "#2d4a3e" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                    {addr.name}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed mb-5" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {addr.line1}<br />
                  {addr.line2 && <>{addr.line2}<br /></>}
                  {addr.city}{addr.state && `, ${addr.state}`} {addr.zip}<br />
                  {addr.country}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
    type="button"
    onClick={() => handleOpenEdit(addr)}
    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
    type="button"
    onClick={() => handleDelete(addr.id)}
    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest"
    style={{ color: "#b91c1c", fontFamily: "Manrope, sans-serif" }}
  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                  {!addr.isDefault && <button
    type="button"
    onClick={() => handleSetDefault(addr.id)}
    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                      <FiCheck size={12} /> Set as Default
                    </button>}
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>}

      {
    /* Add/Edit form modal */
  }
      <AnimatePresence>
        {showForm && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
  >
            <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    transition={{ duration: 0.35 }}
    className="w-full max-w-lg relative"
    style={{ backgroundColor: "#fafafa" }}
  >
              <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "#f0ebe2" }}>
                <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>
                  {editId ? "Edit Address" : "New Address"}
                </h2>
                <button
    type="button"
    onClick={() => setShowForm(false)}
    style={{ color: "#8c8277" }}
  >
                  <FiX size={20} />
                </button>
              </div>

              <div className="px-8 py-8">
                <div className="grid grid-cols-2 gap-6">
                  {formFields.map((field) => <div key={field.name} className={field.colSpan ? "col-span-2" : ""}>
                      <label
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                        {field.label}
                      </label>
                      <div className="border-b" style={{ borderColor: "#8c8277" }}>
                        <input
    type="text"
    value={form[field.name]}
    onChange={(e) => setForm((p) => ({ ...p, [field.name]: e.target.value }))}
    className="w-full bg-transparent outline-none py-3 text-sm"
    style={inputStyle}
  />
                      </div>
                    </div>)}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
    type="button"
    onClick={handleSave}
    className="flex-1 py-4 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                    {editId ? "Save Changes" : "Add Address"}
                  </button>
                  <button
    type="button"
    onClick={() => setShowForm(false)}
    className="px-8 py-4 text-xs uppercase tracking-widest border"
    style={{ borderColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
export {
  AddressesPage as default
};
