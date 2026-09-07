import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiStar, FiAward, FiBell, FiCheck } from "react-icons/fi";
import { notificationApi } from "../../services/api";

const iconFor = (type) => {
  if (type?.startsWith("ORDER")) return <FiPackage size={16} />;
  if (type?.startsWith("REVIEW")) return <FiStar size={16} />;
  if (type?.startsWith("LOYALTY")) return <FiAward size={16} />;
  return <FiBell size={16} />;
};
const groupOf = (type) => {
  if (type?.startsWith("ORDER")) return "Orders";
  if (type?.startsWith("REVIEW")) return "Reviews";
  return "Account";
};
const relative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const TABS = ["All", "Orders", "Reviews", "Account"];

function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const load = useCallback(async () => {
    try {
      const res = await notificationApi.getMine();
      setItems((res.data?.notifications ?? []).map((n) => ({ ...n, group: groupOf(n.type) })));
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unreadCount = items.filter((n) => !n.isRead).length;
  const filtered = items.filter((n) => activeTab === "All" || n.group === activeTab);

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try { await notificationApi.markAllRead(); } catch (err) { console.error(err); load(); }
  };

  const open = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      notificationApi.markRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  if (loading) return <div className="py-24 text-center text-[#8c8277]">Loading notifications…</div>;

  return <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1" style={{ color: "#0a0a0a" }}>Notifications</h1>
          {unreadCount > 0 && <span className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>{unreadCount} unread</span>}
        </div>
        {unreadCount > 0 && <button
    type="button"
    onClick={markAllRead}
    className="flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-widest uppercase border transition-all hover:bg-[#0a0a0a] hover:text-[#fafafa] w-full sm:w-auto"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
            <FiCheck size={13} /> Mark all as read
          </button>}
      </div>

      <div className="flex gap-0 mb-6 border-b overflow-x-auto" style={{ borderColor: "#f0ebe2" }}>
        {TABS.map((tab) => {
          const unread = tab === "All" ? unreadCount : items.filter((n) => n.group === tab && !n.isRead).length;
          return <button
      key={tab}
      type="button"
      onClick={() => setActiveTab(tab)}
      className="relative px-3 sm:px-5 py-3 text-xs tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap"
      style={{
        color: activeTab === tab ? "#0a0a0a" : "#8c8277",
        fontFamily: "Manrope, sans-serif",
        borderBottom: activeTab === tab ? "2px solid #0a0a0a" : "2px solid transparent",
        marginBottom: "-1px"
      }}
    >
              {tab}
              {unread > 0 && <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-semibold" style={{ backgroundColor: "#2d4a3e", color: "#fafafa" }}>{unread}</span>}
            </button>;
        })}
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? <div className="py-20 flex flex-col items-center gap-3">
              <FiBell size={32} style={{ color: "#c9b99a" }} />
              <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>Nothing here yet</p>
            </div>
          : filtered.map((n) => <motion.div
    key={n.id}
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    onClick={() => open(n)}
    className="relative flex items-start gap-3 p-3 sm:p-4 border cursor-pointer transition-colors"
    style={{ borderColor: "#f0ebe2", backgroundColor: n.isRead ? "#fafafa" : "#f0ebe2", fontFamily: "Manrope, sans-serif" }}
  >
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: "#2d4a3e" }} />}
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "#f0ebe2", color: "#2d4a3e" }}>
                  {iconFor(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-0.5 leading-snug" style={{ color: "#0a0a0a", fontWeight: n.isRead ? 400 : 600 }}>{n.title}</p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "#8c8277" }}>{n.message}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#c9b99a" }}>{n.group}</span>
                    <span className="text-[10px]" style={{ color: "#8c8277" }}>{relative(n.createdAt)}</span>
                  </div>
                </div>
                {!n.isRead && <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: "#2d4a3e" }} />}
              </motion.div>)}
        </AnimatePresence>
      </div>
    </div>;
}
export {
  NotificationsPage as default
};
