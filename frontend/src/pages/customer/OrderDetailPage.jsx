import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiMapPin, FiCreditCard, FiHelpCircle, FiRotateCcw } from "react-icons/fi";
import { orderApi } from "../../services/api";

const statusSteps = [
  { key: "processing", label: "Processing" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" }
];

function getStepIndex(status) {
  const map = {
    pending: 0,
    processing: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3
  };
  return map[status] ?? 0;
}

const statusStyles = {
  pending: { bg: "#f0ebe2", text: "#8c8277" },
  processing: { bg: "#f0ebe2", text: "#8c8277" },
  confirmed: { bg: "#e8f0ee", text: "#2d4a3e" },
  shipped: { bg: "#dbeafe", text: "#1d4ed8" },
  delivered: { bg: "#0a0a0a", text: "#fafafa" },
  cancelled: { bg: "#fef2f2", text: "#b91c1c" },
  refunded: { bg: "#fef2f2", text: "#b91c1c" }
};

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getMyOrderById(id);
        if (!active) return;
        const raw = res.data;
        if (raw) {
          const rawStatus = (raw.status || "pending").toLowerCase();
          const items = Array.isArray(raw.items) ? raw.items.map(i => ({
            name: i.productName || i.name || "Product Item",
            size: i.size || "Default",
            color: i.color || "Default",
            quantity: i.quantity || 1,
            price: Number(i.unitPrice || i.price || 0),
            image: i.image || ""
          })) : [];
          const shippingAddress = typeof raw.shippingAddress === "string" ? JSON.parse(raw.shippingAddress) : (raw.shippingAddress || { line1: "Address on file", city: "", zip: "", country: "" });
          setOrder({
            id: raw.id,
            orderNumber: raw.orderNumber || `ORD-${raw.id}`,
            status: rawStatus,
            createdAt: raw.createdAt,
            trackingNumber: raw.trackingNumber,
            carrier: raw.carrier || "DHL Express",
            items,
            subtotal: Number(raw.subtotalAmount || raw.subtotal || 0),
            shipping: Number(raw.shippingFee || raw.shipping || 0),
            tax: Number(raw.taxAmount || raw.tax || 0),
            total: Number(raw.totalAmount || raw.total || 0),
            shippingAddress
          });
        }
      } catch (err) {
        console.error("Failed to load order detail", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrder();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-[#8c8277]">Loading order details...</div>;
  }
  if (!order) {
    return <div className="flex flex-col items-center justify-center py-24 text-center">
        <FiPackage size={40} style={{ color: "#c9b99a" }} className="mb-4" />
        <h2 className="font-display text-3xl mb-2" style={{ color: "#0a0a0a" }}>Order not found</h2>
        <Link
      to="/account/orders"
      className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest"
      style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
    >
          <FiArrowLeft size={14} /> Back to Orders
        </Link>
      </div>;
  }
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";
  return <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8"
  >
      {
    /* Back + header */
  }
      <div>
        <Link
    to="/account/orders"
    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-6"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
          <FiArrowLeft size={14} /> All Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl mb-1" style={{ color: "#0a0a0a" }}>{order.orderNumber}</h1>
            <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span
    className="px-4 py-1.5 text-xs uppercase tracking-wider"
    style={{
      backgroundColor: statusStyles[order.status]?.bg ?? "#f0ebe2",
      color: statusStyles[order.status]?.text ?? "#8c8277",
      fontFamily: "Manrope, sans-serif"
    }}
  >
            {order.status}
          </span>
        </div>
      </div>

      {
    /* Status tracker */
  }
      {!isCancelled && <div className="border p-6" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Order Status
          </h2>
          <div className="relative flex items-start justify-between">
            {
    /* connector line */
  }
            <div
    className="absolute top-4 left-0 right-0 h-px"
    style={{ backgroundColor: "#f0ebe2", zIndex: 0 }}
  />
            <div
    className="absolute top-4 left-0 h-px transition-all duration-1000"
    style={{
      backgroundColor: "#2d4a3e",
      width: `${currentStep / (statusSteps.length - 1) * 100}%`,
      zIndex: 1
    }}
  />

            {statusSteps.map((step, idx) => {
    const done = idx <= currentStep;
    return <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                  <div
      className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500"
      style={{
        backgroundColor: done ? "#2d4a3e" : "#fafafa",
        borderColor: done ? "#2d4a3e" : "#f0ebe2"
      }}
    >
                    <FiCheck size={14} color={done ? "#fafafa" : "#f0ebe2"} strokeWidth={3} />
                  </div>
                  <p
      className="mt-3 text-xs uppercase tracking-widest text-center"
      style={{
        color: done ? "#0a0a0a" : "#8c8277",
        fontFamily: "Manrope, sans-serif",
        fontWeight: done ? 600 : 400
      }}
    >
                    {step.label}
                  </p>
                </div>;
  })}
          </div>

          {
    /* Tracking */
  }
          {order.trackingNumber && <div
    className="mt-8 p-4 flex flex-wrap items-center justify-between gap-4"
    style={{ backgroundColor: "#f0ebe2" }}
  >
              <div className="flex items-center gap-3">
                <FiTruck size={18} style={{ color: "#2d4a3e" }} />
                <div>
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                    {order.carrier}
                  </p>
                  <p className="text-sm font-medium" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
              <button
    type="button"
    className="px-5 py-2 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#2d4a3e", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
                Track Package
              </button>
            </div>}
        </div>}

      {
    /* Items */
  }
      <div className="border" style={{ borderColor: "#f0ebe2" }}>
        <h2
    className="px-6 py-4 text-xs uppercase tracking-widest border-b"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif", borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}
  >
          Order Items
        </h2>
        {order.items.map((item, idx) => <div
    key={idx}
    className="flex gap-5 px-6 py-5 border-b last:border-0"
    style={{ borderColor: "#f0ebe2" }}
  >
            <img
    src={item.image}
    alt={item.name}
    className="w-20 object-cover flex-shrink-0"
    style={{ aspectRatio: "3/4" }}
  />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                {item.name}
              </p>
              <p className="text-xs mb-0.5" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                Size: {item.size} · Colour: {item.color}
              </p>
              <p className="text-xs" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                Qty: {item.quantity}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                £{(item.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                £{item.price.toFixed(2)} each
              </p>
            </div>
          </div>)}
      </div>

      {
    /* Summary columns */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {
    /* Shipping address */
  }
        <div className="border p-6" style={{ borderColor: "#f0ebe2" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiMapPin size={16} style={{ color: "#2d4a3e" }} />
            <h3 className="text-xs uppercase tracking-widest" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              Shipping Address
            </h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
            {order.shippingAddress.line1}<br />
            {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
            {order.shippingAddress.city}
            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
            {order.shippingAddress.zip}<br />
            {order.shippingAddress.country}
          </p>
        </div>

        {
    /* Payment & totals */
  }
        <div className="border p-6" style={{ borderColor: "#f0ebe2" }}>
          <div className="flex items-center gap-2 mb-4">
            <FiCreditCard size={16} style={{ color: "#2d4a3e" }} />
            <h3 className="text-xs uppercase tracking-widest" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              Payment & Totals
            </h3>
          </div>
          <div className="space-y-2">
            {[
    { label: "Subtotal", value: `\xA3${order.subtotal.toFixed(2)}` },
    { label: "Shipping", value: order.shipping === 0 ? "Free" : `\xA3${order.shipping.toFixed(2)}` },
    { label: "Tax", value: `\xA3${order.tax.toFixed(2)}` }
  ].map((row) => <div key={row.label} className="flex justify-between text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
                <span style={{ color: "#8c8277" }}>{row.label}</span>
                <span style={{ color: "#0a0a0a" }}>{row.value}</span>
              </div>)}
            <div
    className="flex justify-between text-sm pt-3 mt-3 border-t font-semibold"
    style={{ borderColor: "#f0ebe2", fontFamily: "Manrope, sans-serif" }}
  >
              <span style={{ color: "#0a0a0a" }}>Total</span>
              <span style={{ color: "#0a0a0a" }}>£{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {
    /* Actions */
  }
      <div className="flex flex-wrap gap-4">
        <button
    type="button"
    className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest border transition-colors duration-200 hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a]"
    style={{ borderColor: "#8c8277", color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
          <FiHelpCircle size={14} /> Need Help?
        </button>
        {order.status === "delivered" && <button
    type="button"
    className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest border transition-colors duration-200 hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a]"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
            <FiRotateCcw size={14} /> Return Items
          </button>}
      </div>
    </motion.div>;
}
export {
  OrderDetailPage as default
};
