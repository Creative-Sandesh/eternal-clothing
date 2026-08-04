import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
function getStrength(password) {
  if (!password) return { label: "", level: 0, color: "#f0ebe2" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const map = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Strong", color: "#2d4a3e" },
    { label: "Very Strong", color: "#2d4a3e" }
  ];
  return { label: map[score - 1]?.label ?? "Weak", level: score, color: map[score - 1]?.color ?? "#ef4444" };
}
function ResetPasswordPage() {
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const strength = getStrength(newPass);
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      window.location.href = "/login";
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1e3);
    return () => clearTimeout(timer);
  }, [success, countdown]);
  function handleSubmit(e) {
    e.preventDefault();
    if (!newPass || newPass !== confirm) return;
    setSuccess(true);
  }
  return <div
    className="min-h-screen flex items-center justify-center px-4 py-16"
    style={{ backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
      <div className="w-full max-w-md">
        {
    /* Logo */
  }
        <div className="text-center mb-10">
          <Link to="/" className="font-display tracking-[0.3em] text-xl uppercase" style={{ color: "#0a0a0a" }}>
            ETERNAL
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {success ? <motion.div
    key="success"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="border p-10 text-center"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
              <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
    style={{ backgroundColor: "#2d4a3e" }}
  >
                <FiCheckCircle size={32} style={{ color: "#fafafa" }} />
              </motion.div>
              <h2 className="font-display text-2xl mb-3" style={{ color: "#0a0a0a" }}>Password Reset Successfully</h2>
              <p className="text-sm mb-2" style={{ color: "#8c8277" }}>
                Your password has been updated.
              </p>
              <p className="text-sm" style={{ color: "#8c8277" }}>
                Redirecting to login in{" "}
                <span className="font-semibold" style={{ color: "#2d4a3e" }}>{countdown}</span>
                {countdown === 1 ? " second" : " seconds"}...
              </p>
              <Link
    to="/login"
    className="inline-block mt-6 text-xs tracking-widest uppercase underline"
    style={{ color: "#8c8277" }}
  >
                Go now
              </Link>
            </motion.div> : <motion.form
    key="form"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onSubmit={handleSubmit}
    className="border p-8 flex flex-col gap-6"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
              <div>
                <h1 className="font-display text-2xl mb-1" style={{ color: "#0a0a0a" }}>Create new password</h1>
                <p className="text-sm" style={{ color: "#8c8277" }}>Choose a strong password for your account.</p>
              </div>

              {
    /* New password */
  }
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>New Password</label>
                <div className="relative">
                  <input
    type={showNew ? "text" : "password"}
    value={newPass}
    onChange={(e) => setNewPass(e.target.value)}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a] pr-10"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
    required
  />
                  <button
    type="button"
    onClick={() => setShowNew((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
    style={{ color: "#8c8277" }}
  >
                    {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {
    /* Strength */
  }
                <AnimatePresence>
                  {newPass && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3">
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3, 4].map((n) => <div
    key={n}
    className="h-1 flex-1 rounded-full transition-all duration-300"
    style={{ backgroundColor: n <= strength.level ? strength.color : "#f0ebe2" }}
  />)}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                    </motion.div>}
                </AnimatePresence>
              </div>

              {
    /* Confirm password */
  }
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Confirm Password</label>
                <div className="relative">
                  <input
    type={showConfirm ? "text" : "password"}
    value={confirm}
    onChange={(e) => setConfirm(e.target.value)}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a] pr-10"
    style={{
      borderColor: confirm && confirm !== newPass ? "#ef4444" : "#f0ebe2",
      color: "#0a0a0a"
    }}
    required
  />
                  <button
    type="button"
    onClick={() => setShowConfirm((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
    style={{ color: "#8c8277" }}
  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {confirm && confirm !== newPass && <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>Passwords do not match</p>}
              </div>

              <button
    type="submit"
    className="w-full py-3.5 text-xs tracking-widest uppercase transition-colors hover:bg-[#2d4a3e] disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
    disabled={!newPass || newPass !== confirm || strength.level < 2}
  >
                Reset Password
              </button>

              <p className="text-center text-xs" style={{ color: "#8c8277" }}>
                Remember it?{" "}
                <Link to="/login" className="underline hover:opacity-60 transition-opacity" style={{ color: "#0a0a0a" }}>
                  Back to login
                </Link>
              </p>
            </motion.form>}
        </AnimatePresence>
      </div>
    </div>;
}
export {
  ResetPasswordPage as default
};
