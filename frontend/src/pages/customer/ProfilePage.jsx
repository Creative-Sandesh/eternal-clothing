import { useState } from "react";
import { motion } from "framer-motion";
import { FiCamera, FiSave } from "react-icons/fi";
const mockUser = {
  firstName: "Aria",
  lastName: "Laurent",
  email: "aria.laurent@email.com",
  phone: "+44 7700 900 123",
  birthday: "1992-04-15",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format"
};
function ProfilePage() {
  const [form, setForm] = useState(mockUser);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
    }, 1e3);
  };
  const inputBorderStyle = { borderColor: "#8c8277" };
  const inputStyle = {
    color: "#0a0a0a",
    fontFamily: "Manrope, sans-serif",
    caretColor: "#2d4a3e"
  };
  const labelStyle = { color: "#8c8277", fontFamily: "Manrope, sans-serif" };
  const fields = [
    { name: "firstName", label: "First Name", placeholder: "Aria" },
    { name: "lastName", label: "Last Name", placeholder: "Laurent" },
    { name: "email", label: "Email Address", type: "email", placeholder: "aria@email.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+44 7700 900 000" },
    { name: "birthday", label: "Birthday", type: "date", placeholder: "" }
  ];
  return <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8 max-w-2xl"
  >
      {
    /* Header */
  }
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Profile Settings</h1>
      </div>

      {
    /* Avatar */
  }
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
    src={form.avatar}
    alt={`${form.firstName} ${form.lastName}`}
    className="w-24 h-24 rounded-full object-cover"
  />
          <button
    type="button"
    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[#2d4a3e]"
    style={{ backgroundColor: "#0a0a0a" }}
    aria-label="Upload new photo"
  >
            <FiCamera size={14} color="#fafafa" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
            {form.firstName} {form.lastName}
          </p>
          <button
    type="button"
    className="text-xs uppercase tracking-widest underline underline-offset-2 mt-1"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
            Change photo
          </button>
        </div>
      </div>

      {
    /* Form */
  }
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
          {fields.map((field) => <div key={field.name} className={field.name === "email" ? "sm:col-span-2" : ""}>
              <label
    htmlFor={field.name}
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                {field.label}
              </label>
              <div className="flex items-center border-b" style={inputBorderStyle}>
                <input
    id={field.name}
    name={field.name}
    type={field.type ?? "text"}
    value={form[field.name]}
    onChange={handleChange}
    placeholder={field.placeholder}
    className="flex-1 bg-transparent outline-none py-3 text-sm"
    style={inputStyle}
  />
              </div>
            </div>)}
        </div>

        <div className="flex items-center gap-4">
          <button
    type="submit"
    disabled={loading}
    className="inline-flex items-center gap-3 px-8 py-4 text-xs uppercase tracking-widest transition-opacity duration-200"
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif",
      opacity: loading ? 0.6 : 1
    }}
  >
            <FiSave size={14} />
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {saved && <motion.p
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className="text-sm"
    style={{ color: "#2d4a3e", fontFamily: "Manrope, sans-serif" }}
  >
              Profile updated successfully
            </motion.p>}
        </div>
      </form>

      {
    /* Danger zone */
  }
      <div className="border-t pt-8" style={{ borderColor: "#f0ebe2" }}>
        <h3 className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          Account Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
    type="button"
    className="text-xs uppercase tracking-widest px-6 py-3 border transition-colors duration-200 hover:bg-[#f0ebe2]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
            Change Password
          </button>
          <button
    type="button"
    className="text-xs uppercase tracking-widest px-6 py-3 border transition-colors duration-200 hover:bg-red-50"
    style={{ borderColor: "#fecaca", color: "#b91c1c", fontFamily: "Manrope, sans-serif" }}
  >
            Delete Account
          </button>
        </div>
      </div>
    </motion.div>;
}
export {
  ProfilePage as default
};
