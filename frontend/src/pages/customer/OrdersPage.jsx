import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiChevronRight, FiLoader } from "react-icons/fi";
import { orderApi } from "../../services/api";

const filters = [
  { label: "All",        value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Shipped",    value: "shipped" },
  { label: "Delivered",  value: "delivered" },
  { label: "Cancelled",  value: "cancelled" }
];

const statusStyles = {
  pending:    { bg: "#f0ebe2", text: "#8c8277" },
  processing: { bg: "#f0ebe2", text: "#8c8277" },
  confirmed:  { bg: "#e8f0ee", text: "#2d4a3e" },
  shipped:    { bg: "#dbeafe", text: "#1d4ed8" },
  delivered:  { bg: "#0a0a0a", text: "#fafafa" },
  cancelled:  { bg: "#fef2f2", text: "#b91c1c" },
  refunded:   { bg: "#fef2f2", text: "#b91c1c" }
};

function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "all"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="space-y-8 pt-20 sm:pt-0">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>My Orders</h1>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-0 border-b overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ borderColor: "#f0ebe2" }}
      >
        {filters.map((f) => (
          <button
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
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <FiLoader size={28} className="animate-spin" style={{ color: "#8c8277" }} />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0ebe2" }}>
            <FiPackage size={32} style={{ color: "#c9b99a" }} />
          </div>
          <h2 className="font-display text-3xl mb-3" style={{ color: "#0a0a0a" }}>No orders found</h2>
          <p className="text-sm max-w-sm mb-8" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            {activeFilter === "all"
              ? "You haven't placed any orders yet."
              : `No ${activeFilter} orders found.`}
          </p>
          <Link
            to="/shop"
            className="px-10 py-4 text-xs uppercase tracking-widest"
            style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
          >
            Browse Collection
          </Link>
        </motion.div>
      )}

      {/* Orders list */}
      {!loading && !error && filtered.length > 0 && (
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border p-6 hover:border-[#0a0a0a] transition-colors duration-200"
                style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                      Order #{order.id}
                    </p>
                    <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                      Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="inline-block px-3 py-1 text-xs uppercase tracking-wider"
                      style={{
                        backgroundColor: statusStyles[order.status]?.bg ?? "#f0ebe2",
                        color: statusStyles[order.status]?.text ?? "#8c8277",
                        fontFamily: "Manrope, sans-serif"
                      }}
                    >
                      {order.status}
                    </span>
                    <span className="font-display text-xl" style={{ color: "#0a0a0a" }}>
                      £{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="flex gap-3 mb-4 overflow-hidden">
                    {order.orderItems.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-14 h-18 flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: "#f0ebe2", aspectRatio: "3/4" }}
                      >
                        {item.productVariant?.product?.images?.[0] && (
                          <img
                            src={item.productVariant.product.images[0]}
                            alt={item.productVariant.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div
                        className="w-14 flex items-center justify-center text-xs"
                        style={{ backgroundColor: "#f0ebe2", color: "#8c8277", fontFamily: "Manrope, sans-serif", aspectRatio: "3/4" }}
                      >
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                    {order.orderItems?.length ?? 0} {(order.orderItems?.length ?? 0) === 1 ? "item" : "items"}
                  </p>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
                    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
                  >
                    View Order <FiChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

export { OrdersPage as default };
