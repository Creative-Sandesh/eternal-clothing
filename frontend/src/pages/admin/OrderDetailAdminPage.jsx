import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPrinter, FiTruck, FiPackage, FiCheck, FiClock, FiMapPin, FiMail } from "react-icons/fi";
import { orderApi } from "../../services/api";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600"
};

const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const badge = (s) => statusColors[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

const timelineEvents = (order) => [
  { label: "Order Placed", time: order.createdAt, icon: <FiPackage size={14} />, done: true },
  { label: "Payment Confirmed", time: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? order.createdAt : null, icon: <FiCheck size={14} />, done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) },
  { label: "Shipped", time: ["SHIPPED", "DELIVERED"].includes(order.status) ? order.updatedAt : null, icon: <FiTruck size={14} />, done: ["SHIPPED", "DELIVERED"].includes(order.status) },
  { label: "Delivered", time: order.status === "DELIVERED" ? order.updatedAt : null, icon: <FiCheck size={14} />, done: order.status === "DELIVERED" }
];

function OrderDetailAdminPage() {
  const money = useMoney();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const mapAddress = (a) => a ? {
    line1: a.addressLine1 || "",
    line2: a.addressLine2 || "",
    city: a.city || "",
    state: a.state || "",
    zip: a.postalCode || "",
    country: a.country || ""
  } : null;

  const mapOrder = (o) => {
    const items = Array.isArray(o.items) ? o.items.map((i) => {
      const v = i.productVariant || {};
      const p = v.product || {};
      return {
        name: p.name || "Item",
        size: v.size || "—",
        color: v.colorName || "—",
        quantity: i.quantity || 1,
        price: Number(i.unitPrice || 0),
        image: Array.isArray(p.images) ? p.images[0] : ""
      };
    }) : [];
    const lineSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      id: o.id,
      orderNumber: o.orderNumber || `ORD-${o.id}`,
      status: o.status || "PENDING",
      createdAt: o.createdAt,
      updatedAt: o.updatedAt || o.createdAt,
      customerName: o.user ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || "Customer" : "Guest",
      customerEmail: o.user?.email || "",
      customerPhone: o.user?.phoneNumber || "",
      trackingNumber: o.trackingNumber || "",
      couponCode: o.coupon?.code || null,
      discount: Number(o.discountAmount || 0),
      shipping: Number(o.shippingFee || 0),
      tax: Number(o.taxAmount || 0),
      total: Number(o.totalAmount || 0),
      // Prefer the stored subtotal; fall back to summing lines for older orders.
      subtotal: o.subtotalAmount != null ? Number(o.subtotalAmount) : lineSubtotal,
      items,
      payment: Array.isArray(o.payments) && o.payments[0] ? o.payments[0] : null,
      shippingAddress: mapAddress(o.shippingAddress) || { line1: "Address unavailable", city: "", zip: "", country: "" },
      billingAddress: mapAddress(o.billingAddress) || mapAddress(o.shippingAddress) || { line1: "Address unavailable", city: "", zip: "", country: "" }
    };
  };

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getAdminOrderById(id);
        if (!active) return;
        const formatted = mapOrder(res.data);
        setOrder(formatted);
        setStatus(formatted.status);
        setTracking(formatted.trackingNumber);
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrder();
    orderApi.getNotes(id).then((r) => { if (active) setNotes(r.data || []); }).catch(() => {});
    return () => { active = false; };
  }, [id]);

  const addNote = async () => {
    if (!noteDraft.trim()) return;
    setNoteSaving(true);
    try {
      const res = await orderApi.addNote(id, noteDraft.trim());
      setNotes((prev) => [res.data, ...prev]);
      setNoteDraft("");
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setNoteSaving(false);
    }
  };
  const removeNote = async (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try { await orderApi.deleteNote(noteId); } catch (err) { console.error(err); }
  };

  const persist = async (patch) => {
    setSaving(true);
    try {
      const res = await orderApi.updateStatus(id, patch);
      const formatted = mapOrder(res.data);
      setOrder(formatted);
      setStatus(formatted.status);
      setTracking(formatted.trackingNumber);
    } catch (err) {
      console.error("Failed to update order", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = (newStatus) => persist({ status: newStatus, trackingNumber: tracking });
  const handleSaveTracking = () => persist({ trackingNumber: tracking });

  const handleRefund = async () => {
    if (!window.confirm("Refund this order? Items will be restocked and the order cancelled.")) return;
    setSaving(true);
    try {
      const res = await orderApi.refund(id);
      const formatted = mapOrder(res.data);
      setOrder(formatted);
      setStatus(formatted.status);
    } catch (err) {
      console.error("Refund failed", err);
      alert(err.message || "Refund failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="py-24 text-center text-gray-500">Order not found</div>;

  return <div className="space-y-5">
      {
    /* Header */
  }
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl text-gray-900">{order.orderNumber}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${badge(status)}`}>{String(status).toLowerCase()}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
    onClick={() => window.print()}
    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
  >
            <FiPrinter size={14} /> Print
          </button>
          <button
    disabled={saving || status === "SHIPPED" || status === "DELIVERED"}
    onClick={() => handleUpdateStatus("SHIPPED")}
    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0a0a0a] text-white rounded-xl hover:bg-[#2d4a3e] transition-colors disabled:opacity-50"
  >
            <FiTruck size={14} /> Mark Shipped
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {
    /* Main content */
  }
        <div className="lg:col-span-2 space-y-4">
          {
    /* Status update */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => <button
    key={s}
    disabled={saving}
    onClick={() => handleUpdateStatus(s)}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize transition-all ${status === s ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
  >
                  {s}
                </button>)}
            </div>
          </motion.div>

          {
    /* Items Table */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Details</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                        <p className="text-xs text-gray-500">Color: {item.color}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{money(item.price)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{money((item.price * item.quantity))}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </motion.div>

          {
    /* Addresses */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
  >
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={14} className="text-[#2d4a3e]" />
                <h2 className="font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <p className="text-sm text-gray-700">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="text-sm text-gray-700">{order.shippingAddress.line2}</p>}
              <p className="text-sm text-gray-700">{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.zip}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
              {order.trackingNumber && <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Tracking: <span className="font-mono font-medium text-gray-800">{order.trackingNumber}</span></p>
                </div>}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={14} className="text-[#2d4a3e]" />
                <h2 className="font-semibold text-gray-900">Billing Address</h2>
              </div>
              <p className="text-sm text-gray-700">{order.billingAddress.line1}</p>
              {order.billingAddress.line2 && <p className="text-sm text-gray-700">{order.billingAddress.line2}</p>}
              <p className="text-sm text-gray-700">{order.billingAddress.city}{order.billingAddress.state ? `, ${order.billingAddress.state}` : ""} {order.billingAddress.zip}</p>
              <p className="text-sm text-gray-700">{order.billingAddress.country}</p>
            </div>
          </motion.div>

          {
    /* Tracking */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.14 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
  >
            <h2 className="font-semibold text-gray-900">Shipment Tracking</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
              <div className="flex gap-2">
                <input
    type="text"
    value={tracking}
    onChange={(e) => setTracking(e.target.value)}
    placeholder="Enter tracking number..."
    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] font-mono"
  />
                <button onClick={handleSaveTracking} disabled={saving} className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Internal notes */}
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.16 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
  >
            <h2 className="font-semibold text-gray-900">Internal Notes</h2>
            <div className="flex gap-2">
              <textarea
    value={noteDraft}
    onChange={(e) => setNoteDraft(e.target.value)}
    rows={2}
    placeholder="Add a note visible to staff only…"
    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] resize-none"
  />
              <button onClick={addNote} disabled={noteSaving || !noteDraft.trim()} className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors self-end disabled:opacity-40">
                {noteSaving ? "…" : "Add"}
              </button>
            </div>
            <div className="space-y-2">
              {notes.map((n) => <div key={n.id} className="group flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.author ? `${n.author.firstName} ${n.author.lastName}` : "Staff"} ·{" "}
                      {new Date(n.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => removeNote(n.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition" title="Delete">✕</button>
                </div>)}
            </div>
          </motion.div>
        </div>

        {
    /* Sidebar */
  }
        <div className="space-y-4">
          {
    /* Customer Info */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.04 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#2d4a3e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {order.customerName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.customerEmail || "—"}</span>
              </div>
              {order.customerPhone && <div className="flex items-center gap-2 text-gray-600">
                <FiMapPin size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.customerPhone}</span>
              </div>}
            </div>
          </motion.div>

          {
    /* Payment Summary */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{money(order.subtotal)}</span>
              </div>
              {order.discount > 0 && <div className="flex justify-between text-gray-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="font-medium text-[#2d4a3e]">−{money(order.discount)}</span>
              </div>}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">{order.shipping === 0 ? "Free" : money(order.shipping)}</span>
              </div>
              {order.tax > 0 && <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">{money(order.tax)}</span>
              </div>}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{money(order.total)}</span>
              </div>
              {order.payment && <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>{order.payment.paymentMethod} · {order.payment.status}</span>
                <span className="font-mono">{order.payment.transactionId}</span>
              </div>}
            </div>
            {order.payment?.status === "COMPLETED" && status !== "CANCELLED" && <button
    onClick={handleRefund}
    disabled={saving}
    className="w-full mt-4 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
  >
              {saving ? "Processing…" : "Issue Refund"}
            </button>}
            {status === "CANCELLED" && order.payment?.status === "REFUNDED" && <p className="mt-4 text-xs text-center text-gray-400">Refunded — items restocked</p>}
          </motion.div>

          {
    /* Order Timeline */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {timelineEvents(order).map((event, i) => <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${event.done ? "bg-[#2d4a3e] text-white" : "bg-gray-100 text-gray-400"}`}>
                    {event.done ? event.icon : <FiClock size={12} />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${event.done ? "text-gray-900" : "text-gray-400"}`}>{event.label}</p>
                    {event.time && <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(event.time).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>}
                  </div>
                </div>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}
export {
  OrderDetailAdminPage as default
};
