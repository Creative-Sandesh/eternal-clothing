import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiHeart, FiMapPin, FiCreditCard, FiExternalLink, FiTruck, FiStar } from "react-icons/fi";
import { orders } from "../../data/orders";
const statusColors = {
  processing: { bg: "#f0ebe2", text: "#8c8277" },
  confirmed: { bg: "#e8f0ee", text: "#2d4a3e" },
  shipped: { bg: "#e8f0ee", text: "#2d4a3e" },
  delivered: { bg: "#0a0a0a", text: "#fafafa" },
  cancelled: { bg: "#fef2f2", text: "#b91c1c" },
  refunded: { bg: "#fef2f2", text: "#b91c1c" }
};
const stats = [
  { label: "Total Orders", value: "12", icon: <FiPackage size={20} />, color: "#2d4a3e" },
  { label: "Total Spent", value: "\xA34,820", icon: <FiCreditCard size={20} />, color: "#0a0a0a" },
  { label: "Loyalty Points", value: "4,820", icon: <FiStar size={20} />, color: "#c9b99a" },
  { label: "Wishlist Items", value: "3", icon: <FiHeart size={20} />, color: "#8c8277" }
];
const quickLinks = [
  { label: "Track an Order", icon: <FiTruck size={18} />, to: "/account/orders" },
  { label: "Saved Addresses", icon: <FiMapPin size={18} />, to: "/account/addresses" },
  { label: "Payment Methods", icon: <FiCreditCard size={18} />, to: "/account/settings" }
];
const recentOrders = orders.slice(0, 3);
function AccountDashboard() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  return <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-10"
  >
      {
    /* Welcome */
  }
      <motion.div variants={itemVariants}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          Account Overview
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>
          Welcome back, Aria
        </h1>
      </motion.div>

      {
    /* Stats */
  }
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <div
    key={s.label}
    className="p-6"
    style={{ backgroundColor: "#f0ebe2" }}
  >
            <div className="flex items-center gap-2 mb-3" style={{ color: s.color }}>
              {s.icon}
            </div>
            <p className="font-display text-3xl mb-1" style={{ color: "#0a0a0a" }}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              {s.label}
            </p>
          </div>)}
      </motion.div>

      {
    /* Recent Orders */
  }
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>Recent Orders</h2>
          <Link
    to="/account/orders"
    className="text-xs uppercase tracking-widest flex items-center gap-1 transition-opacity hover:opacity-60"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
            View all <FiExternalLink size={12} />
          </Link>
        </div>

        <div className="border" style={{ borderColor: "#f0ebe2" }}>
          {
    /* Header */
  }
          <div
    className="hidden md:grid grid-cols-5 px-6 py-3 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
            <span>Order</span>
            <span>Date</span>
            <span>Items</span>
            <span>Status</span>
            <span className="text-right">Total</span>
          </div>

          {recentOrders.map((order, idx) => <div
    key={order.id}
    className="grid grid-cols-2 md:grid-cols-5 gap-y-2 px-6 py-4 items-center border-t"
    style={{
      borderColor: "#f0ebe2",
      backgroundColor: idx % 2 === 0 ? "#fafafa" : "#fafafa"
    }}
  >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="hidden md:block">
                <span
    className="inline-block px-3 py-1 text-xs uppercase tracking-wider"
    style={{
      backgroundColor: statusColors[order.status]?.bg ?? "#f0ebe2",
      color: statusColors[order.status]?.text ?? "#8c8277",
      fontFamily: "Manrope, sans-serif"
    }}
  >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 col-span-2 md:col-span-1">
                <span className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                  £{order.total.toFixed(2)}
                </span>
                <Link
    to={`/account/orders/${order.id}`}
    className="text-xs uppercase tracking-widest underline underline-offset-2"
    style={{ color: "#2d4a3e", fontFamily: "Manrope, sans-serif" }}
  >
                  View
                </Link>
              </div>
            </div>)}
        </div>
      </motion.div>

      {
    /* Quick links */
  }
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-2xl mb-6" style={{ color: "#0a0a0a" }}>Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map((ql) => <Link
    key={ql.to}
    to={ql.to}
    className="flex items-center gap-4 p-5 border transition-colors duration-200 hover:border-[#0a0a0a] group"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
              <span style={{ color: "#2d4a3e" }}>{ql.icon}</span>
              <span
    className="text-sm uppercase tracking-widest transition-colors duration-200 group-hover:text-[#0a0a0a]"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                {ql.label}
              </span>
            </Link>)}
        </div>
      </motion.div>

      {
    /* Loyalty tier */
  }
      <motion.div variants={itemVariants}>
        <div
    className="p-8 relative overflow-hidden"
    style={{ backgroundColor: "#2d4a3e" }}
  >
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#c9b99a", fontFamily: "Manrope, sans-serif" }}>
                  Loyalty Status
                </p>
                <h3 className="font-display text-3xl mb-1" style={{ color: "#fafafa" }}>
                  Gold Member
                </h3>
                <p className="text-sm" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>
                  4,820 points earned
                </p>
              </div>
              <Link
    to="/account/loyalty"
    className="text-xs uppercase tracking-widest px-5 py-3 border transition-colors duration-200 hover:bg-[#fafafa] hover:text-[#2d4a3e]"
    style={{ borderColor: "rgba(250,250,250,0.3)", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                View Details
              </Link>
            </div>

            {
    /* Progress */
  }
            <div className="mt-8">
              <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(250,250,250,0.6)", fontFamily: "Manrope, sans-serif" }}>
                <span>Gold (4,820 pts)</span>
                <span>Platinum (8,000 pts)</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div
    className="h-1.5 rounded-full transition-all duration-1000"
    style={{ backgroundColor: "#c9b99a", width: `${4820 / 8e3 * 100}%` }}
  />
              </div>
              <p className="mt-2 text-xs" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
                3,180 points to Platinum
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>;
}
export {
  AccountDashboard as default
};
