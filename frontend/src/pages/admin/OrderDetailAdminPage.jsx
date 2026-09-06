import { useState, useEffect } from "react";
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

const timelineEvents = (order) => [
  { label: "Order Placed", time: order.createdAt, icon: <FiPackage size={14} />, done: true },
  { label: "Order Confirmed", time: order.status !== "PENDING" && order.status !== "PROCESSING" ? order.updatedAt : null, icon: <FiCheck size={14} />, done: ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) },
  { label: "Shipped", time: order.trackingNumber ? order.updatedAt : null, icon: <FiTruck size={14} />, done: ["SHIPPED", "DELIVERED"].includes(order.status) },
  { label: "Delivered", time: order.status === "DELIVERED" ? order.updatedAt : null, icon: <FiCheck size={14} />, done: order.status === "DELIVERED" }
];

function OrderDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getAdminOrders();
        if (!active) return;
        const found = (res.data || []).find(o => String(o.id) === String(id));
        if (found) {
          const formatted = {
            id: found.id,
            orderNumber: found.orderNumber || `ORD-${found.id}`,
            status: found.status || "PENDING",
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
            customerName: found.user ? `${found.user.firstName || ""} ${found.user.lastName || ""}`.trim() || "Customer" : "Guest",
            customerEmail: found.user?.email || "",
            trackingNumber: found.trackingNumber || "",
            carrier: found.carrier || "DHL Express",
            subtotal: Number(found.subtotalAmount || 0),
            shipping: Number(found.shippingFee || 0),
            tax: Number(found.taxAmount || 0),
            total: Number(found.totalAmount || 0),
            items: Array.isArray(found.items) ? found.items.map(i => ({
              name: i.productName || i.name || "Item",
              size: i.size || "Default",
              color: i.color || "Default",
              quantity: i.quantity || 1,
              price: Number(i.unitPrice || i.price || 0),
              image: i.image || ""
            })) : [],
            shippingAddress: typeof found.shippingAddress === "string" ? JSON.parse(found.shippingAddress) : (found.shippingAddress || { line1: "Address on file", city: "", zip: "", country: "" })
          };
          setOrder(formatted);
          setStatus(formatted.status);
          setTracking(formatted.trackingNumber);
        }
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrder();
    return () => { active = false; };
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      await orderApi.updateStatus(id, { status: newStatus, trackingNumber: tracking });
      setStatus(newStatus);
      if (order) setOrder({ ...order, status: newStatus, trackingNumber: tracking });
    } catch (err) {
      console.error("Failed to update status", err);
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
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[status]}`}>{status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            <FiPrinter size={14} /> Invoice
          </button>
          <button
    onClick={() => setStatus("shipped")}
    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0a0a0a] text-white rounded-xl hover:bg-[#2d4a3e] transition-colors"
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
                      <td className="px-4 py-3 text-right text-gray-700">£{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</td>
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
              <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
              {order.trackingNumber && <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Tracking: <span className="font-mono font-medium text-gray-800">{order.trackingNumber}</span></p>
                  {order.carrier && <p className="text-xs text-gray-500">Carrier: {order.carrier}</p>}
                </div>}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={14} className="text-[#2d4a3e]" />
                <h2 className="font-semibold text-gray-900">Billing Address</h2>
              </div>
              <p className="text-sm text-gray-700">{order.shippingAddress.line1}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
            </div>
          </motion.div>

          {
    /* Add Note + Tracking */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.14 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
  >
            <h2 className="font-semibold text-gray-900">Add Note / Tracking</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Note</label>
              <div className="flex gap-2">
                <textarea
    value={note}
    onChange={(e) => setNote(e.target.value)}
    rows={2}
    placeholder="Add a note about this order..."
    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] resize-none"
  />
                <button className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors self-end">
                  Add
                </button>
              </div>
            </div>
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
                <button className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors">
                  Save
                </button>
              </div>
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
                <span className="truncate">{order.customerEmail}</span>
              </div>
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
                <span className="font-medium">£{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">{order.shipping === 0 ? "Free" : `\xA3${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (VAT 20%)</span>
                <span className="font-medium">£{order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
              Issue Refund
            </button>
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
