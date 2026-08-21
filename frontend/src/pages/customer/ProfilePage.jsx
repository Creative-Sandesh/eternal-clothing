import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSave, FiLoader, FiCheck } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../services/api";

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm]     = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: ""
  });
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  // Pre-fill from auth context when user loads
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName:  user.lastName  || "",
        email:     user.email     || "",
        phone:     user.phone     || "",
        birthday:  user.birthday  ? user.birthday.slice(0, 10) : ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await userApi.updateMe({
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
        birthday:  form.birthday || undefined
      });
      // Update the auth context with new info if setUser is available
      if (setUser && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBorderStyle = { borderColor: "#8c8277" };
  const inputStyle = { color: "#0a0a0a", fontFamily: "Manrope, sans-serif", caretColor: "#2d4a3e" };
  const labelStyle = { color: "#8c8277", fontFamily: "Manrope, sans-serif" };

  const fields = [
    { name: "firstName", label: "First Name",     placeholder: "Jane",           type: "text" },
    { name: "lastName",  label: "Last Name",      placeholder: "Smith",          type: "text" },
    { name: "email",     label: "Email Address",  placeholder: "jane@email.com", type: "email", readOnly: true },
    { name: "phone",     label: "Phone Number",   placeholder: "+44 7700 900 000", type: "tel" },
    { name: "birthday",  label: "Birthday",       placeholder: "",               type: "date" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-2xl"
    >
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Profile Settings</h1>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display text-white"
          style={{ backgroundColor: "#2d4a3e" }}
        >
          {(form.firstName?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p className="font-display text-xl" style={{ color: "#0a0a0a" }}>
            {form.firstName} {form.lastName}
          </p>
          <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            {form.email}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={`profile-${field.name}`}
              className="block text-xs font-medium tracking-widest uppercase mb-2"
              style={labelStyle}
            >
              {field.label}
              {field.readOnly && (
                <span className="ml-2 normal-case tracking-normal text-xs opacity-50">(cannot change email)</span>
              )}
            </label>
            <input
              id={`profile-${field.name}`}
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              readOnly={field.readOnly}
              className={[
                "w-full border-b py-3 text-sm bg-transparent outline-none transition-colors",
                field.readOnly
                  ? "cursor-not-allowed opacity-50"
                  : "focus:border-[#0a0a0a]"
              ].join(" ")}
              style={{ ...inputBorderStyle, ...inputStyle }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: saved ? "#2d4a3e" : "#0a0a0a",
            color: "#fafafa",
            fontFamily: "Manrope, sans-serif"
          }}
        >
          {loading ? (
            <><FiLoader size={14} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><FiCheck size={14} /> Saved</>
          ) : (
            <><FiSave size={14} /> Save Changes</>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export { ProfilePage as default };
