import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiTag, FiUser, FiBell, FiCheck } from "react-icons/fi";
const initialNotifications = [
  { id: 1, title: "Your order ET-2024-00421 has been delivered", description: "Your package was delivered to your front door. We hope you love it!", timestamp: "2 hours ago", category: "Orders", read: false },
  { id: 2, title: "New arrivals: Summer Edit is now live", description: "Discover our latest Summer Edit collection \u2014 lightweight fabrics, sun-washed tones.", timestamp: "1 day ago", category: "Promotions", read: false },
  { id: 3, title: "Your return request has been approved", description: "Return for order ET-2024-00418 approved. Refund will appear in 3\u20135 business days.", timestamp: "3 days ago", category: "Orders", read: true },
  { id: 4, title: "You've earned 220 loyalty points!", description: "Points from your recent purchase have been credited to your account.", timestamp: "5 days ago", category: "Account", read: true },
  { id: 5, title: "Flash Sale: 30% off Archive \u2014 48 hours only", description: "Shop our Archive collection at 30% off. Ends midnight Sunday.", timestamp: "1 week ago", category: "Promotions", read: true },
  { id: 6, title: "Order ET-2024-00419 has shipped \u2014 track it now", description: "Your order is on its way. Expected delivery: Thursday.", timestamp: "1 week ago", category: "Orders", read: true },
  { id: 7, title: "Welcome to Gold tier! Enjoy exclusive benefits", description: "You have reached Gold status. Enjoy free shipping, early access, and more.", timestamp: "2 weeks ago", category: "Account", read: true },
  { id: 8, title: "Your review has been published", description: 'Your review for "Relaxed Wool Trouser" is now live on the site.', timestamp: "3 weeks ago", category: "Account", read: true },
  { id: 9, title: "Last chance: items in your cart are selling fast", description: "The Cashmere Wrap Coat in your cart is almost sold out. Complete your purchase now.", timestamp: "1 month ago", category: "Promotions", read: true },
  { id: 10, title: "Password changed successfully", description: "Your account password was updated. If you did not make this change, contact us immediately.", timestamp: "1 month ago", category: "Account", read: true }
];
const categoryIcon = {
  Orders: <FiPackage size={16} />,
  Promotions: <FiTag size={16} />,
  Account: <FiUser size={16} />
};
const tabs = ["All", "Orders", "Promotions", "Account"];
function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("All");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => activeTab === "All" || n.category === activeTab);
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function markRead(id) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }
  return <div>
      {
    /* Header */
  }
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1" style={{ color: "#0a0a0a" }}>Notifications</h1>
          {unreadCount > 0 && <span className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              {unreadCount} unread
            </span>}
        </div>
        {unreadCount > 0 && <button
    type="button"
    onClick={markAllRead}
    className="flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-widest uppercase border transition-all hover:bg-[#0a0a0a] hover:text-[#fafafa] w-full sm:w-auto"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
            <FiCheck size={13} />
            Mark all as read
          </button>}
      </div>

      {
    /* Filter tabs */
  }
      <div className="flex gap-0 mb-6 border-b overflow-x-auto" style={{ borderColor: "#f0ebe2" }}>
        {tabs.map((tab) => {
    const count = tab === "All" ? notifications.length : notifications.filter((n) => n.category === tab).length;
    const unread = tab === "All" ? unreadCount : notifications.filter((n) => n.category === tab && !n.read).length;
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
              {unread > 0 && <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-semibold" style={{ backgroundColor: "#2d4a3e", color: "#fafafa" }}>
                  {unread}
                </span>}
            </button>;
  })}
      </div>

      {
    /* Notification list */
  }
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? <div className="py-20 flex flex-col items-center gap-3">
              <FiBell size={32} style={{ color: "#c9b99a" }} />
              <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>No notifications in this category</p>
            </div> : filtered.map((n) => <motion.div
    key={n.id}
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    onClick={() => markRead(n.id)}
    className="relative flex items-start gap-3 p-3 sm:p-4 border cursor-pointer transition-colors"
    style={{
      borderColor: "#f0ebe2",
      backgroundColor: n.read ? "#fafafa" : "#f0ebe2",
      fontFamily: "Manrope, sans-serif"
    }}
  >
                {
    /* Unread dot */
  }
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: "#2d4a3e" }} />}

                {
    /* Icon */
  }
                <div
    className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mt-0.5"
    style={{ backgroundColor: "#f0ebe2", color: "#2d4a3e" }}
  >
                  {categoryIcon[n.category]}
                </div>

                {
    /* Content */
  }
                <div className="flex-1 min-w-0">
                  <p
    className="text-sm mb-0.5 leading-snug"
    style={{ color: "#0a0a0a", fontWeight: n.read ? 400 : 600 }}
  >
                    {n.title}
                  </p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "#8c8277" }}>
                    {n.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#c9b99a" }}>{n.category}</span>
                    <span className="text-[10px]" style={{ color: "#8c8277" }}>{n.timestamp}</span>
                  </div>
                </div>

                {
    /* Unread indicator */
  }
                {!n.read && <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: "#2d4a3e" }} />}
              </motion.div>)}
        </AnimatePresence>
      </div>
    </div>;
}
export {
  NotificationsPage as default
};
