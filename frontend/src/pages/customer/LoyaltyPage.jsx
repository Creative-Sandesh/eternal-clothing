import { useState } from "react";
import { motion } from "framer-motion";
import { FiStar, FiShoppingBag, FiMessageSquare, FiUsers, FiGift, FiCopy, FiCheck } from "react-icons/fi";
const tiers = [
  { name: "Bronze", threshold: 0, color: "#cd7f32", bg: "#fdf6ee" },
  { name: "Silver", threshold: 1e3, color: "#8c8277", bg: "#f5f4f3" },
  { name: "Gold", threshold: 3e3, color: "#c9b99a", bg: "#fdf8f3" },
  { name: "Platinum", threshold: 8e3, color: "#2d4a3e", bg: "#e8f0ee" }
];
const currentPoints = 4820;
const currentTier = tiers.find((t, i) => currentPoints >= t.threshold && (i === tiers.length - 1 || currentPoints < tiers[i + 1].threshold)) ?? tiers[2];
const nextTier = tiers[tiers.findIndex((t) => t.name === currentTier.name) + 1];
const earningMethods = [
  { icon: <FiShoppingBag size={20} />, label: "Purchase", desc: "Earn 1 point for every \xA31 spent", points: "1 pt / \xA31" },
  { icon: <FiMessageSquare size={20} />, label: "Leave a Review", desc: "Share your thoughts on a product", points: "50 pts" },
  { icon: <FiUsers size={20} />, label: "Refer a Friend", desc: "When your friend makes their first purchase", points: "200 pts" },
  { icon: <FiGift size={20} />, label: "Birthday Bonus", desc: "Celebrate with extra points on your birthday", points: "100 pts" }
];
const pointsHistory = [
  { date: "14 Nov 2024", action: "Purchase \u2014 ET-2024-00421", points: 437, type: "earn" },
  { date: "10 Nov 2024", action: "Birthday Bonus", points: 100, type: "earn" },
  { date: "05 Nov 2024", action: "Product Review", points: 50, type: "earn" },
  { date: "01 Nov 2024", action: "Points Redeemed \u2014 Discount", points: -200, type: "spend" },
  { date: "28 Oct 2024", action: "Purchase \u2014 ET-2024-00418", points: 529, type: "earn" },
  { date: "20 Oct 2024", action: "Referral Bonus \u2014 Sofia A.", points: 200, type: "earn" }
];
const referralLink = "https://eternal.com/ref/aria-laurent-ab12c3";
function LoyaltyPage() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const progressPct = nextTier ? Math.min(100, (currentPoints - currentTier.threshold) / (nextTier.threshold - currentTier.threshold) * 100) : 100;
  return <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-10"
  >
      {
    /* Header */
  }
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Loyalty Programme</h1>
      </div>

      {
    /* Tier card */
  }
      <div
    className="p-8 relative overflow-hidden"
    style={{ backgroundColor: currentTier.color === "#2d4a3e" ? "#2d4a3e" : "#0a0a0a" }}
  >
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>
                Current Tier
              </p>
              <div className="flex items-center gap-3 mb-1">
                <FiStar size={24} style={{ color: currentTier.color !== "#0a0a0a" ? currentTier.color : "#c9b99a" }} />
                <h2 className="font-display text-3xl" style={{ color: "#fafafa" }}>{currentTier.name}</h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>
                Points Balance
              </p>
              <p className="font-display text-5xl" style={{ color: "#fafafa" }}>
                {currentPoints.toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>points</p>
            </div>
          </div>

          {nextTier && <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
                <span>{currentTier.name} ({currentPoints.toLocaleString()} pts)</span>
                <span>{nextTier.name} ({nextTier.threshold.toLocaleString()} pts)</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div
    className="h-1.5 rounded-full transition-all duration-1000"
    style={{ backgroundColor: "#c9b99a", width: `${progressPct}%` }}
  />
              </div>
              <p className="mt-2 text-xs" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
                {(nextTier.threshold - currentPoints).toLocaleString()} points to {nextTier.name}
              </p>
            </div>}
        </div>
      </div>

      {
    /* How to earn */
  }
      <div>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>How to Earn Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {earningMethods.map((m) => <div
    key={m.label}
    className="flex gap-4 p-5 border"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
              <div
    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: "#f0ebe2", color: "#2d4a3e" }}
  >
                {m.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                    {m.label}
                  </p>
                  <span
    className="text-xs whitespace-nowrap px-2 py-0.5 font-semibold flex-shrink-0"
    style={{ backgroundColor: "#2d4a3e", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                    {m.points}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {m.desc}
                </p>
              </div>
            </div>)}
        </div>
      </div>

      {
    /* Points history */
  }
      <div>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>Points History</h2>
        <div className="border" style={{ borderColor: "#f0ebe2" }}>
          <div
    className="grid grid-cols-3 px-6 py-3 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
            <span>Date</span>
            <span>Action</span>
            <span className="text-right">Points</span>
          </div>
          {pointsHistory.map((row, idx) => <div
    key={idx}
    className="grid grid-cols-3 px-6 py-4 border-t items-center"
    style={{ borderColor: "#f0ebe2" }}
  >
              <span className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                {row.date}
              </span>
              <span className="text-sm" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                {row.action}
              </span>
              <span
    className="text-sm font-semibold text-right"
    style={{
      color: row.type === "earn" ? "#2d4a3e" : "#b91c1c",
      fontFamily: "Manrope, sans-serif"
    }}
  >
                {row.type === "earn" ? "+" : ""}{row.points.toLocaleString()}
              </span>
            </div>)}
        </div>
      </div>

      {
    /* Referral */
  }
      <div className="border p-8" style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}>
        <div className="flex items-center gap-2 mb-3">
          <FiUsers size={18} style={{ color: "#2d4a3e" }} />
          <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>Refer a Friend</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          Share your unique link. When a friend makes their first purchase, you both earn 200 points.
        </p>
        <div className="flex gap-0">
          <input
    readOnly
    value={referralLink}
    className="flex-1 px-4 py-3 text-sm outline-none border-y border-l"
    style={{
      borderColor: "#8c8277",
      backgroundColor: "#fafafa",
      color: "#8c8277",
      fontFamily: "Manrope, sans-serif"
    }}
  />
          <button
    type="button"
    onClick={handleCopy}
    className="px-5 py-3 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-200"
    style={{
      backgroundColor: copied ? "#2d4a3e" : "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif"
    }}
  >
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </motion.div>;
}
export {
  LoyaltyPage as default
};
