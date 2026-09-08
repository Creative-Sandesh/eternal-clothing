import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMoney, useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FiCheck, FiPackage, FiArrowRight, FiLoader, FiAlertCircle } from "react-icons/fi";
import { orderApi } from "../../services/api";

// Recover the details a real gateway redirect drops when it bounces back here
// without React Router state (checkout stashed them before redirecting).
function readPendingVerify() {
  try {
    const raw = sessionStorage.getItem("eternal_pending_verify");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function OrderConfirmationPage() {
  const money = useMoney();
  const { settings } = useSettings();
  const { user } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();

  // Read the redirect stash once — the effect clears it, and we don't want that
  // clearing to change the derived values below on a later render.
  const [pending] = useState(() => (location.state ? null : readPendingVerify()));

  // Order id / provider / guest email come from checkout navigation state, the
  // gateway redirect query, or the sessionStorage stash left before a redirect.
  const orderId = location.state?.orderId || params.get("orderId") || pending?.orderId;
  const provider = location.state?.provider || params.get("provider") || pending?.provider;
  const guestEmail = location.state?.guestEmail || pending?.guestEmail;
  const stateOrder = location.state?.order || null;
  const needsVerify = location.state?.verify || (provider && !location.state) || !!pending;

  const [order, setOrder] = useState(stateOrder);
  const [phase, setPhase] = useState(needsVerify ? "verifying" : stateOrder ? "done" : "loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!orderId) { setPhase("done"); return; }
    if (!needsVerify && stateOrder) { setPhase("done"); return; }
    let active = true;

    const finish = (data) => { if (active) { setOrder(data); setPhase("done"); } };

    const run = async () => {
      try {
        if (needsVerify && provider) {
          const ref = params.get("data") || params.get("pidx") || params.get("refId") || "sandbox";
          const res = await orderApi.verifyPayment({
            orderId,
            provider: provider.toUpperCase(),
            ref,
            ...(guestEmail ? { guestEmail } : {}),
          });
          try { sessionStorage.removeItem("eternal_pending_verify"); } catch { /* ignore */ }
          finish(res.data);
          return;
        }
        // No verification needed. Logged-in customers can re-fetch; guests rely on
        // the order object handed over from checkout.
        if (user) {
          const res = await orderApi.getMyOrderById(orderId);
          finish(res.data);
        } else {
          finish(stateOrder);
        }
      } catch (err) {
        if (!active) return;
        setPhase("error");
        setMessage(err.message || "We couldn't confirm your payment.");
      }
    };
    run();
    return () => { active = false; };
  }, [orderId, provider, needsVerify]); // eslint-disable-line react-hooks/exhaustive-deps

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const items = (order?.items || []).map((i) => {
    const v = i.productVariant || {};
    const p = v.product || {};
    return {
      name: p.name || "Item",
      size: v.size, color: v.colorName,
      qty: i.quantity,
      price: Number(i.unitPrice || 0),
      image: Array.isArray(p.images) ? p.images[0] : "",
    };
  });

  if (phase === "verifying") {
    return <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center gap-4">
        <FiLoader className="w-8 h-8 animate-spin text-[#2d4a3e]" />
        <p className="text-sm text-[#8c8277]">Confirming your payment…</p>
      </div>;
  }

  if (phase === "error") {
    return <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <FiAlertCircle className="w-10 h-10 text-red-500" />
        <h1 className="font-display text-3xl text-[#0a0a0a]">Payment not confirmed</h1>
        <p className="text-sm text-[#8c8277] max-w-sm">{message}</p>
        <Link to={user ? "/account/orders" : "/shop"} className="mt-2 px-6 py-3 bg-[#0a0a0a] text-white text-xs tracking-widest uppercase">
          {user ? "View my orders" : "Back to shop"}
        </Link>
      </div>;
  }

  return <div className="bg-[#fafafa] min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex justify-center mb-8">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }} className="w-20 h-20 rounded-full bg-[#2d4a3e] flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 300 }}>
              <FiCheck className="w-9 h-9 text-white stroke-[2.5]" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mb-10">
          <h1 className="font-display text-5xl text-[#0a0a0a] mb-3">Order Confirmed</h1>
          <p className="text-[#8c8277] text-base">
            {order?.payments?.[0]?.status === "PENDING"
              ? "Thanks for your order — payment on delivery."
              : "Thank you for your order. We're preparing it now."}
          </p>
          {!user && (order?.guestEmail || guestEmail) && (
            <p className="text-[#8c8277] text-sm mt-2">
              A confirmation has been sent to {order?.guestEmail || guestEmail}.
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="bg-white border border-[#0a0a0a]/8 p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f0ebe2]">
            <div>
              <p className="text-[#8c8277] text-xs tracking-widest uppercase mb-1">Order Number</p>
              <p className="font-display text-2xl text-[#0a0a0a]">{order?.orderNumber || (orderId ? `#${String(orderId).slice(0, 8)}` : "—")}</p>
            </div>
            <div className="text-right">
              <p className="text-[#8c8277] text-xs tracking-widest uppercase mb-1">Estimated Delivery</p>
              <p className="text-[#0a0a0a] text-sm font-medium">{formattedDelivery}</p>
            </div>
          </div>

          {items.length > 0 && <div className="space-y-4 mb-6 pt-2">
            {items.map((item, i) => <div key={i} className="flex gap-4">
                {item.image && <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-[#f0ebe2] flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#0a0a0a] text-sm font-medium mb-1">{item.name}</h4>
                  <p className="text-[#8c8277] text-xs">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                  <p className="text-[#8c8277] text-xs">Qty: {item.qty}</p>
                </div>
                <p className="text-[#0a0a0a] text-sm font-medium">{money((item.price * item.qty))}</p>
              </div>)}
          </div>}

          {order && <div className="border-t border-[#f0ebe2] pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-[#8c8277]"><span>Subtotal</span><span>{money(Number(order.subtotalAmount || 0))}</span></div>
            {Number(order.discountAmount) > 0 && <div className="flex justify-between text-sm text-[#2d4a3e]"><span>Discount</span><span>−{money(Number(order.discountAmount))}</span></div>}
            {Number(order.loyaltyPointsUsed) > 0 && <div className="flex justify-between text-sm text-[#2d4a3e]"><span>Loyalty points ({Number(order.loyaltyPointsUsed).toLocaleString()})</span><span>−{money(Math.round(Number(order.loyaltyPointsUsed) * (Number(settings.loyalty_points_redemption_rate) || 0) * 100) / 100)}</span></div>}
            <div className="flex justify-between text-sm text-[#8c8277]"><span>Shipping</span><span>{Number(order.shippingFee) === 0 ? "Free" : money(Number(order.shippingFee))}</span></div>
            {Number(order.taxAmount) > 0 && <div className="flex justify-between text-sm text-[#8c8277]"><span>Tax</span><span>{money(Number(order.taxAmount))}</span></div>}
            <div className="flex justify-between text-base font-medium text-[#0a0a0a] pt-1"><span>Total</span><span>{money(Number(order.totalAmount || 0))}</span></div>
          </div>}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex flex-col sm:flex-row gap-3">
          {user ? (
            <Link to="/account/orders" className="flex-1 flex items-center justify-center gap-2 bg-[#2d4a3e] text-white text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#243d32] transition-colors">
              <FiPackage className="w-4 h-4" /> View My Orders
            </Link>
          ) : (
            <Link to="/register" className="flex-1 flex items-center justify-center gap-2 bg-[#2d4a3e] text-white text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#243d32] transition-colors">
              <FiPackage className="w-4 h-4" /> Create an account
            </Link>
          )}
          <Link to="/shop" className="flex-1 flex items-center justify-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#f0ebe2] transition-colors">
            Continue Shopping <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>;
}
export {
  OrderConfirmationPage as default
};
