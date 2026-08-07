import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };
  return <div
    className="min-h-screen flex items-center justify-center px-6 py-16"
    style={{ backgroundColor: "#f0ebe2" }}
  >
      <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="w-full max-w-md"
  >
        {
    /* Logo */
  }
        <Link to="/" className="block mb-8 sm:mb-12 text-center">
          <span className="font-display text-2xl tracking-[0.2em] uppercase" style={{ color: "#0a0a0a" }}>
            Eternal
          </span>
        </Link>

        <div
    className="px-6 py-10 sm:px-10 sm:py-12"
    style={{ backgroundColor: "#fafafa" }}
  >
          <AnimatePresence mode="wait">
            {!sent ? <motion.div
    key="form"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
                <h1 className="font-display text-3xl mb-3" style={{ color: "#0a0a0a" }}>
                  Reset password
                </h1>
                <p className="text-sm mb-10 leading-relaxed" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  Enter your email address and we will send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label
    htmlFor="email"
    className="block text-xs uppercase tracking-widest mb-2"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                      Email Address
                    </label>
                    <div className="flex items-center border-b" style={{ borderColor: "#8c8277" }}>
                      <FiMail size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                      <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    placeholder="your@email.com"
    className="flex-1 bg-transparent outline-none py-3 pl-3 text-sm"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif", caretColor: "#2d4a3e" }}
  />
                    </div>
                  </div>

                  <button
    type="submit"
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-widest transition-opacity duration-200"
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif",
      opacity: loading ? 0.6 : 1
    }}
  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </motion.div> : <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="text-center py-4"
  >
                <div className="flex justify-center mb-6">
                  <FiCheckCircle size={48} style={{ color: "#2d4a3e" }} />
                </div>
                <h2 className="font-display text-3xl mb-3" style={{ color: "#0a0a0a" }}>
                  Check your email
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  We have sent a password reset link to{" "}
                  <span style={{ color: "#0a0a0a", fontWeight: 500 }}>{email}</span>.
                  Please check your inbox and spam folder.
                </p>
                <p className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {"Didn't receive the email?"}{" "}
                  <button
    type="button"
    onClick={() => setSent(false)}
    className="underline underline-offset-2"
    style={{ color: "#0a0a0a" }}
  >
                    Try again
                  </button>
                </p>
              </motion.div>}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <Link
    to="/login"
    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
            <FiArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>;
}
export {
  ForgotPasswordPage as default
};
