import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiCopy, FiCheck, FiGift, FiClock } from "react-icons/fi";
import { referralApi } from "../../services/api";

function ReferralPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    let active = true;
    referralApi.getMine()
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => console.error("Failed to load referrals", err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  if (loading) return <div className="py-24 text-center" style={{ color: "#8c8277" }}>Loading…</div>;
  if (!data) return <div className="py-24 text-center" style={{ color: "#8c8277" }}>Referral information is unavailable.</div>;

  const { code, link, rewardPoints, stats, referrals } = data;

  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>My Account</p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Referral Programme</h1>
      </div>

      {/* Hero */}
      <div className="border p-8" style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}>
        <div className="flex items-center gap-2 mb-3">
          <FiGift size={18} style={{ color: "#2d4a3e" }} />
          <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>Give {rewardPoints}, get {rewardPoints}</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          Share your link. When a friend places their first order, you both earn {rewardPoints} loyalty points.
        </p>

        <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#8c8277" }}>Your referral link</label>
        <div className="flex gap-0 mb-4">
          <input readOnly value={link} className="flex-1 px-4 py-3 text-sm outline-none border-y border-l" style={{ borderColor: "#8c8277", backgroundColor: "#fafafa", color: "#8c8277", fontFamily: "Manrope, sans-serif" }} />
          <button type="button" onClick={() => copy(link, "link")} className="px-5 py-3 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors" style={{ backgroundColor: copied === "link" ? "#2d4a3e" : "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
            {copied === "link" ? <FiCheck size={14} /> : <FiCopy size={14} />}
            {copied === "link" ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          Or share your code:{" "}
          <button type="button" onClick={() => copy(code, "code")} className="font-mono font-semibold underline" style={{ color: "#0a0a0a" }}>
            {code}{copied === "code" ? " ✓" : ""}
          </button>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Friends Joined", value: stats.joined },
          { label: "Completed", value: stats.completed },
          { label: "Points Earned", value: stats.pointsEarned.toLocaleString() },
        ].map((s) => <div key={s.label} className="p-5 border text-center" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
            <p className="font-display text-2xl" style={{ color: "#0a0a0a" }}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "#8c8277" }}>{s.label}</p>
          </div>)}
      </div>

      {/* List */}
      <div>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>Your Referrals</h2>
        {referrals.length === 0 ? <p className="text-sm py-8 text-center border" style={{ color: "#8c8277", borderColor: "#f0ebe2" }}>
            No one has signed up with your link yet.
          </p>
        : <div className="border" style={{ borderColor: "#f0ebe2" }}>
            {referrals.map((r) => <div key={r.id} className="flex items-center gap-4 px-5 py-4 border-t first:border-t-0" style={{ borderColor: "#f0ebe2", fontFamily: "Manrope, sans-serif" }}>
                <div className="w-9 h-9 rounded-full bg-[#f0ebe2] flex items-center justify-center flex-shrink-0" style={{ color: "#2d4a3e" }}>
                  <FiUsers size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "#0a0a0a" }}>{r.name}</p>
                  <p className="text-xs" style={{ color: "#8c8277" }}>
                    {r.email || "Joined"} · {new Date(r.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                {r.status === "COMPLETED"
                  ? <span className="flex items-center gap-1 text-xs px-2.5 py-1" style={{ backgroundColor: "#2d4a3e", color: "#fafafa" }}><FiCheck size={11} /> +{r.rewardPoints}</span>
                  : <span className="flex items-center gap-1 text-xs px-2.5 py-1" style={{ backgroundColor: "#f0ebe2", color: "#8c8277" }}><FiClock size={11} /> Pending</span>}
              </div>)}
          </div>}
      </div>
    </motion.div>;
}
export {
  ReferralPage as default
};
