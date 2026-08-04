import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import { orders } from "../../data/orders";
const filters = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];
const statusStyles = {
  processing: { bg: "#f0ebe2", text: "#8c8277" },
  confirmed: { bg: "#e8f0ee", text: "#2d4a3e" },
  shipped: { bg: "#dbeafe", text: "#1d4ed8" },
  delivered: { bg: "#0a0a0a", text: "#fafafa" },
  cancelled: { bg: "#fef2f2", text: "#b91c1c" },
  refunded: { bg: "#fef2f2", text: "#b91c1c" }
};
function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const filtered = activeFilter === "all" ? orders : orders.filter((o) => o.status === activeFilter);
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>My Orders</h1>
      </div>

      {
    /* Filter tabs */
  }
      <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: "#f0ebe2" }}>
        {filters.map((f) => <button
    key={f.value}
    type="button"
    onClick={() => setActiveFilter(f.value)}
    className="px-5 py-3 text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-200 border-b-2 -mb-px"
    style={{
      fontFamily: "Manrope, sans-serif",
      borderBottomColor: activeFilter === f.value ? "#0a0a0a" : "transparent",
      color: activeFilter === f.value ? "#0a0a0a" : "#8c8277",
      backgroundColor: "transparent"
    }}
  >
            {f.label}
          </button>)}
      </div>

      {
    /* Orders list */
  }
      <AnimatePresence mode="wait">
        <motion.div
    key={activeFilter}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
          {filtered.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiPackage size={40} style={{ color: "#c9b99a" }} className="mb-4" />
              <h3 className="font-display text-2xl mb-2" style={{ color: "#0a0a0a" }}>No orders found</h3>
              <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                You have no {activeFilter !== "all" ? activeFilter : ""} orders yet.
              </p>
              <Link
    to="/shop"
    className="mt-6 px-8 py-3 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                Browse Shop
              </Link>
            </div> : filtered.map((order) => <div
    key={order.id}
    className="border p-6 hover:border-[#0a0a0a] transition-colors duration-200"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                      {order.orderNumber}
                    </p>
                    <p className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
    className="px-3 py-1 text-xs uppercase tracking-wider"
    style={{
      backgroundColor: statusStyles[order.status]?.bg ?? "#f0ebe2",
      color: statusStyles[order.status]?.text ?? "#8c8277",
      fontFamily: "Manrope, sans-serif"
    }}
  >
                      {order.status}
                    </span>
                    <span className="font-semibold text-sm" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                      £{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {
    /* Items */
  }
                <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
                  {order.items.map((item, idx) => <div key={idx} className="flex-shrink-0 flex items-center gap-2">
                      <img
    src={item.image}
    alt={item.name}
    className="w-14 h-18 object-cover"
    style={{ aspectRatio: "3/4", width: 56 }}
  />
                    </div>)}
                  <div className="flex-shrink-0 flex flex-col justify-center">
                    <p className="text-sm font-medium" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                      {order.items[0].name}
                      {order.items.length > 1 && <span style={{ color: "#8c8277" }}> +{order.items.length - 1} more</span>}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
    to={`/account/orders/${order.id}`}
    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest px-6 py-3 border transition-colors duration-200 hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a]"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
                    View Details <FiChevronRight size={14} />
                  </Link>
                </div>
              </div>)}
        </motion.div>
      </AnimatePresence>
    </div>;
}
export {
  OrdersPage as default
};
