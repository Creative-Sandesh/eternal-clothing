import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    newsletter: false,
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) return;
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const inputClass = "flex-1 bg-transparent outline-none py-3 pl-3 text-sm";
  const inputStyle = {
    color: "#0a0a0a",
    fontFamily: "Manrope, sans-serif",
    caretColor: "#2d4a3e"
  };
  const labelStyle = {
    color: "#8c8277",
    fontFamily: "Manrope, sans-serif"
  };
  const borderStyle = { borderColor: "#8c8277" };
  return <div className="min-h-screen flex" style={{ backgroundColor: "#fafafa" }}>
      {
    /* Left editorial panel */
  }
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80"
    alt="Eternal editorial"
    className="absolute inset-0 w-full h-full object-cover"
  />
        <div
    className="absolute inset-0"
    style={{ background: "linear-gradient(to bottom right, rgba(10,10,10,0.3), rgba(10,10,10,0.65))" }}
  />
        <div className="relative z-10 flex flex-col justify-end p-16">
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#c9b99a" }}>
            Join Eternal
          </p>
          <h2 className="font-display text-5xl leading-tight" style={{ color: "#fafafa" }}>
            Begin Your<br />Journey
          </h2>
          <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,250,250,0.7)" }}>
            Become a member and unlock access to exclusive collections and private events.
          </p>
        </div>
      </div>

      {
    /* Right form panel */
  }
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 lg:px-16 overflow-y-auto">
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="w-full max-w-md"
  >
          {
    /* Logo */
  }
          <Link to="/" className="block mb-12">
            <span className="font-display text-2xl tracking-[0.2em] uppercase" style={{ color: "#0a0a0a" }}>
              Eternal
            </span>
          </Link>

          {
    /* Heading */
  }
          <h1 className="font-display text-4xl mb-2" style={{ color: "#0a0a0a" }}>
            Create account
          </h1>
          <p className="text-sm mb-10" style={{ ...labelStyle }}>
            Join the Eternal community
          </p>

          <form onSubmit={handleSubmit} className="space-y-7">
            {
    /* Name row */
  }
            <div className="grid grid-cols-2 gap-6">
              {
    /* First name */
  }
              <div>
                <label
    htmlFor="firstName"
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                  First Name
                </label>
                <div className="flex items-center border-b" style={borderStyle}>
                  <FiUser size={14} style={{ color: "#8c8277", flexShrink: 0 }} />
                  <input
    id="firstName"
    name="firstName"
    type="text"
    value={form.firstName}
    onChange={handleChange}
    required
    placeholder="Aria"
    className={inputClass}
    style={inputStyle}
  />
                </div>
              </div>

              {
    /* Last name */
  }
              <div>
                <label
    htmlFor="lastName"
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                  Last Name
                </label>
                <div className="flex items-center border-b" style={borderStyle}>
                  <FiUser size={14} style={{ color: "#8c8277", flexShrink: 0 }} />
                  <input
    id="lastName"
    name="lastName"
    type="text"
    value={form.lastName}
    onChange={handleChange}
    required
    placeholder="Laurent"
    className={inputClass}
    style={inputStyle}
  />
                </div>
              </div>
            </div>

            {
    /* Email */
  }
            <div>
              <label
    htmlFor="email"
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                Email Address
              </label>
              <div className="flex items-center border-b" style={borderStyle}>
                <FiMail size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                <input
    id="email"
    name="email"
    type="email"
    value={form.email}
    onChange={handleChange}
    required
    placeholder="your@email.com"
    className={inputClass}
    style={inputStyle}
  />
              </div>
            </div>

            {
    /* Password */
  }
            <div>
              <label
    htmlFor="password"
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                Password
              </label>
              <div className="flex items-center border-b" style={borderStyle}>
                <FiLock size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                <input
    id="password"
    name="password"
    type="password"
    value={form.password}
    onChange={handleChange}
    required
    placeholder="••••••••"
    className={inputClass}
    style={inputStyle}
  />
              </div>
            </div>

            {
    /* Confirm password */
  }
            <div>
              <label
    htmlFor="confirmPassword"
    className="block text-xs uppercase tracking-widest mb-2"
    style={labelStyle}
  >
                Confirm Password
              </label>
              <div className="flex items-center border-b" style={borderStyle}>
                <FiLock size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                <input
    id="confirmPassword"
    name="confirmPassword"
    type="password"
    value={form.confirmPassword}
    onChange={handleChange}
    required
    placeholder="••••••••"
    className={inputClass}
    style={inputStyle}
  />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && <p className="mt-2 text-xs" style={{ color: "#c0392b", fontFamily: "Manrope, sans-serif" }}>
                  Passwords do not match
                </p>}
            </div>

            {
    /* Checkboxes */
  }
            <div className="space-y-4 pt-1">
              {
    /* Newsletter */
  }
              <label className="flex items-start gap-3 cursor-pointer group">
                <button
    type="button"
    role="checkbox"
    aria-checked={form.newsletter}
    onClick={() => setForm((p) => ({ ...p, newsletter: !p.newsletter }))}
    className="mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors"
    style={{
      borderColor: form.newsletter ? "#2d4a3e" : "#8c8277",
      backgroundColor: form.newsletter ? "#2d4a3e" : "transparent"
    }}
  >
                  {form.newsletter && <FiCheck size={10} color="#fafafa" strokeWidth={3} />}
                </button>
                <span className="text-xs leading-relaxed" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  Subscribe to our newsletter for exclusive offers and new arrivals
                </span>
              </label>

              {
    /* Terms */
  }
              <label className="flex items-start gap-3 cursor-pointer group">
                <button
    type="button"
    role="checkbox"
    aria-checked={form.terms}
    onClick={() => setForm((p) => ({ ...p, terms: !p.terms }))}
    className="mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors"
    style={{
      borderColor: form.terms ? "#2d4a3e" : "#8c8277",
      backgroundColor: form.terms ? "#2d4a3e" : "transparent"
    }}
  >
                  {form.terms && <FiCheck size={10} color="#fafafa" strokeWidth={3} />}
                </button>
                <span className="text-xs leading-relaxed" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  I agree to the{" "}
                  <Link to="/terms" className="underline underline-offset-2" style={{ color: "#0a0a0a" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline underline-offset-2" style={{ color: "#0a0a0a" }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {
    /* Submit */
  }
            <button
    type="submit"
    disabled={loading || !form.terms}
    className="w-full flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-widest transition-opacity duration-200"
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif",
      opacity: loading || !form.terms ? 0.5 : 1,
      cursor: !form.terms ? "not-allowed" : "pointer"
    }}
  >
              {loading ? "Creating account..." : <>
                  Create Account
                  <FiArrowRight size={14} />
                </>}
            </button>
          </form>

          {
    /* Sign in link */
  }
          <p className="mt-8 text-center text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Already have an account?{" "}
            <Link
    to="/login"
    className="underline underline-offset-2"
    style={{ color: "#0a0a0a" }}
  >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>;
}
export {
  RegisterPage as default
};
