import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiCheck, FiCheckCircle } from "react-icons/fi";
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
function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const strength = getStrength(newPass);
  const requirements = [
    { label: "8+ characters", met: newPass.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPass) },
    { label: "Number", met: /[0-9]/.test(newPass) },
    { label: "Special character", met: /[^a-zA-Z0-9]/.test(newPass) }
  ];
  function handleSubmit(e) {
    e.preventDefault();
    if (!current || !newPass || newPass !== confirm) return;
    setSuccess(true);
  }
  if (success) {
    return <div className="max-w-md mx-auto">
        <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-10 border text-center"
      style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}
    >
          <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ backgroundColor: "#2d4a3e" }}
    >
            <FiCheckCircle size={32} style={{ color: "#fafafa" }} />
          </motion.div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "#0a0a0a" }}>Password Updated</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#8c8277" }}>
            Your password has been changed successfully. You are still signed in.
          </p>
          <button
      type="button"
      onClick={() => {
        setSuccess(false);
        setCurrent("");
        setNewPass("");
        setConfirm("");
      }}
      className="mt-8 px-8 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-[#2d4a3e]"
      style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
    >
            Done
          </button>
        </motion.div>
      </div>;
  }
  return <div className="max-w-md mx-auto">
      <h1 className="font-display text-3xl mb-8" style={{ color: "#0a0a0a" }}>Change Password</h1>

      <form onSubmit={handleSubmit} className="border p-6 sm:p-8 flex flex-col gap-6" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>

        {
    /* Current password */
  }
        <div>
          <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Current Password</label>
          <div className="relative">
            <input
    type={showCurrent ? "text" : "password"}
    value={current}
    onChange={(e) => setCurrent(e.target.value)}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a] pr-10"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
    required
  />
            <button
    type="button"
    onClick={() => setShowCurrent((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
    style={{ color: "#8c8277" }}
  >
              {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
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
    /* Strength bar */
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
    /* Requirements */
  }
        <div className="p-4 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#8c8277" }}>Requirements</p>
          <div className="flex flex-col gap-2">
            {requirements.map((req) => <div key={req.label} className="flex items-center gap-2">
                <div
    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
    style={{ backgroundColor: req.met ? "#2d4a3e" : "transparent", border: req.met ? "none" : "1.5px solid #c9b99a" }}
  >
                  {req.met && <FiCheck size={9} style={{ color: "#fafafa" }} />}
                </div>
                <span className="text-xs" style={{ color: req.met ? "#2d4a3e" : "#8c8277", fontWeight: req.met ? 600 : 400 }}>
                  {req.label}
                </span>
              </div>)}
          </div>
        </div>

        {
    /* Confirm password */
  }
        <div>
          <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Confirm New Password</label>
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
    disabled={!current || !newPass || newPass !== confirm || strength.level < 2}
  >
          Update Password
        </button>
      </form>
    </div>;
}
export {
  ChangePasswordPage as default
};
