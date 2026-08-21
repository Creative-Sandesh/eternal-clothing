import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiPackage, FiArrowRight } from "react-icons/fi";
const orderItems = [
  {
    name: "Oversized Cotton Poplin Shirt",
    size: "M",
    color: "Chalk White",
    price: 185,
    qty: 1,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=267&fit=crop&auto=format"
  },
  {
    name: "Relaxed Wool Trouser",
    size: "32",
    color: "Camel",
    price: 295,
    qty: 1,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=267&fit=crop&auto=format"
  }
];
function OrderConfirmationPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const deliveryDate = /* @__PURE__ */ new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return <div className="bg-[#fafafa] min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {
    /* Checkmark */
  }
        <div className="flex justify-center mb-8">
          <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
    className="w-20 h-20 rounded-full bg-[#2d4a3e] flex items-center justify-center"
  >
            <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
  >
              <FiCheck className="w-9 h-9 text-white stroke-[2.5]" />
            </motion.div>
          </motion.div>
        </div>

        {
    /* Heading */
  }
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="text-center mb-10"
  >
          <h1 className="font-display text-5xl text-[#0a0a0a] mb-3">Order Confirmed</h1>
          <p className="text-[#8c8277] text-base">Thank you for your order. We're preparing it now.</p>
        </motion.div>

        {
    /* Order Details Card */
  }
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.45 }}
    className="bg-white border border-[#0a0a0a]/8 p-8 mb-6"
  >
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f0ebe2]">
            <div>
              <p className="text-[#8c8277] text-xs tracking-widest uppercase mb-1">Order Number</p>
              <p className="font-display text-2xl text-[#0a0a0a]">
                {orderId ? `#${orderId}` : "ET-2024-00422"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#8c8277] text-xs tracking-widest uppercase mb-1">Estimated Delivery</p>
              <p className="text-[#0a0a0a] text-sm font-medium">{formattedDelivery}</p>
            </div>
          </div>

          <p className="text-[#8c8277] text-sm mb-4 flex items-center gap-2">
            <FiPackage className="w-4 h-4" />
            We'll send a confirmation email to <span className="text-[#0a0a0a]">guest@example.com</span>
          </p>

          {
    /* Order Items */
  }
          <div className="space-y-4 mb-6 pt-2">
            {orderItems.map((item, i) => <div key={i} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-[#f0ebe2] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#0a0a0a] text-sm font-medium mb-1">{item.name}</h4>
                  <p className="text-[#8c8277] text-xs">Size: {item.size} · {item.color}</p>
                  <p className="text-[#8c8277] text-xs">Qty: {item.qty}</p>
                </div>
                <p className="text-[#0a0a0a] text-sm font-medium">£{item.price}</p>
              </div>)}
          </div>

          <div className="border-t border-[#f0ebe2] pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-[#8c8277]">
              <span>Subtotal</span><span>£{orderItems.reduce((s, i) => s + i.price, 0)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#8c8277]">
              <span>Shipping</span><span>Free</span>
            </div>
            <div className="flex justify-between text-base font-medium text-[#0a0a0a] pt-1">
              <span>Total</span><span>£{orderItems.reduce((s, i) => s + i.price, 0)}</span>
            </div>
          </div>
        </motion.div>

        {
    /* Actions */
  }
        <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="flex flex-col sm:flex-row gap-3"
  >
          <Link
    to="/account/orders"
    className="flex-1 flex items-center justify-center gap-2 bg-[#2d4a3e] text-white text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#243d32] transition-colors"
  >
            <FiPackage className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
    to="/shop"
    className="flex-1 flex items-center justify-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#f0ebe2] transition-colors"
  >
            Continue Shopping
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>;
}
export {
  OrderConfirmationPage as default
};
