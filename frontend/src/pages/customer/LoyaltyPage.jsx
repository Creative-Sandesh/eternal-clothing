import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiStar, FiShoppingBag, FiMessageSquare } from "react-icons/fi";
import { loyaltyApi } from "../../services/api";

const tierColor = { Bronze: "#cd7f32", Silver: "#8c8277", Gold: "#c9b99a", Platinum: "#2d4a3e" };
const TIER_FLOOR = { Bronze: 0, Silver: 100, Gold: 500, Platinum: 1000 };

function LoyaltyPage() {
  const money = useMoney();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loyaltyApi.getMine()
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => console.error("Failed to load loyalty", err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="py-24 text-center text-[#8c8277]">Loading your points…</div>;
  if (!data) return <div className="py-24 text-center text-[#8c8277]">Loyalty information is unavailable.</div>;

  const { balance, tier, nextTierAt, pointsPerDollar, redemptionRate, lifetimeEarned, lifetimeSpent, transactions } = data;
  const floor = TIER_FLOOR[tier] ?? 0;
  const progressPct = nextTierAt ? Math.min(100, ((balance - floor) / (nextTierAt - floor)) * 100) : 100;
  const cashValue = (balance * (redemptionRate || 0)).toFixed(2);

  const earningMethods = [
    { icon: <FiShoppingBag size={20} />, label: "Purchase", desc: `Earn ${pointsPerDollar} point${pointsPerDollar === 1 ? "" : "s"} for every unit spent`, points: `${pointsPerDollar} pt` },
    { icon: <FiMessageSquare size={20} />, label: "Leave a Review", desc: "Reviews on delivered orders help other shoppers", points: "—" }
  ];

  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>My Account</p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Loyalty Programme</h1>
      </div>

      {/* Tier card */}
      <div className="p-8 relative overflow-hidden" style={{ backgroundColor: tier === "Platinum" ? "#2d4a3e" : "#0a0a0a" }}>
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>Current Tier</p>
            <div className="flex items-center gap-3">
              <FiStar size={24} style={{ color: tierColor[tier] || "#c9b99a" }} />
              <h2 className="font-display text-3xl" style={{ color: "#fafafa" }}>{tier}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>Points Balance</p>
            <p className="font-display text-5xl" style={{ color: "#fafafa" }}>{balance.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>≈ {money(cashValue)} — redeem at checkout</p>
          </div>
        </div>
        {nextTierAt && <div>
          <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
            <span>{tier} ({balance.toLocaleString()} pts)</span>
            <span>{nextTierAt.toLocaleString()} pts</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <div className="h-1.5 rounded-full transition-all duration-1000" style={{ backgroundColor: "#c9b99a", width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-xs" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
            {(nextTierAt - balance).toLocaleString()} points to the next tier
          </p>
        </div>}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Lifetime Earned", value: lifetimeEarned.toLocaleString() },
          { label: "Lifetime Redeemed", value: lifetimeSpent.toLocaleString() },
          { label: "Reward Value", value: money(cashValue) }
        ].map((s) => <div key={s.label} className="p-5 border text-center" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
            <p className="font-display text-2xl" style={{ color: "#0a0a0a" }}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "#8c8277" }}>{s.label}</p>
          </div>)}
      </div>

      {/* How to earn */}
      <div>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>How to Earn Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {earningMethods.map((m) => <div key={m.label} className="flex gap-4 p-5 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f0ebe2", color: "#2d4a3e" }}>{m.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>{m.label}</p>
                  <span className="text-xs whitespace-nowrap px-2 py-0.5 font-semibold flex-shrink-0" style={{ backgroundColor: "#2d4a3e", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}>{m.points}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>{m.desc}</p>
              </div>
            </div>)}
        </div>
      </div>

      {/* Points history */}
      <div>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>Points History</h2>
        <div className="border" style={{ borderColor: "#f0ebe2" }}>
          <div className="grid grid-cols-3 px-6 py-3 text-xs uppercase tracking-widest" style={{ backgroundColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            <span>Date</span>
            <span>Activity</span>
            <span className="text-right">Points</span>
          </div>
          {transactions.length === 0 ? <div className="px-6 py-8 text-center text-sm" style={{ color: "#8c8277" }}>No points activity yet — your first order will earn points.</div>
          : transactions.map((row) => <div key={row.id} className="grid grid-cols-3 px-6 py-4 border-t items-center" style={{ borderColor: "#f0ebe2" }}>
              <span className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <span className="text-sm" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                {row.description || row.type}{row.orderNumber ? ` · ${row.orderNumber}` : ""}
              </span>
              <span className="text-sm font-semibold text-right" style={{ color: row.points >= 0 ? "#2d4a3e" : "#b91c1c", fontFamily: "Manrope, sans-serif" }}>
                {row.points >= 0 ? "+" : ""}{row.points.toLocaleString()}
              </span>
            </div>)}
        </div>
      </div>
    </motion.div>;
}
export {
  LoyaltyPage as default
};
