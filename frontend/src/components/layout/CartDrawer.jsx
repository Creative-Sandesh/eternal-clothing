import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingBag, FiPlus, FiMinus, FiTrash2, FiArrowRight } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useMoney, useSettings } from "@/context/SettingsContext";
function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();
  const money = useMoney();
  const { freeShippingThreshold } = useSettings();
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const formattedTotal = money(total);
  const threshold = freeShippingThreshold || 0;
  const progress = threshold > 0 ? Math.min((total / threshold) * 100, 100) : 100;
  return <AnimatePresence>
      {isOpen && <>
          {
    /* Backdrop */
  }
          <motion.div
    key="backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="fixed inset-0 z-[80] bg-[#0a0a0a]/40 backdrop-blur-sm"
    onClick={closeCart}
  />

          {
    /* Drawer */
  }
          <motion.div
    key="drawer"
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "tween", duration: 0.4, ease: [0.25, 0, 0, 1] }}
    className="fixed right-0 top-0 bottom-0 z-[90] w-full max-w-[420px] bg-[#fafafa] flex flex-col shadow-2xl"
  >
            {
    /* Header */
  }
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#0a0a0a]/10">
              <div className="flex items-center gap-3">
                <h2 className="text-xs tracking-widest uppercase font-semibold text-[#0a0a0a]">Your Bag</h2>
                {count > 0 && <span className="w-5 h-5 rounded-full bg-[#2d4a3e] text-[#fafafa] text-[10px] flex items-center justify-center font-semibold">
                    {count}
                  </span>}
              </div>
              <button
    onClick={closeCart}
    className="p-1.5 hover:opacity-60 transition-opacity text-[#0a0a0a]"
    aria-label="Close cart"
  >
                <FiX size={20} />
              </button>
            </div>

            {
    /* Body */
  }
            {items.length === 0 ? <EmptyCart onClose={closeCart} /> : <>
                {
    /* Items list */
  }
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6 no-scrollbar">
                  <AnimatePresence initial={false}>
                    {items.map((item) => <motion.div
    key={item.id}
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
    className="flex gap-4"
  >
                        {
    /* Image */
  }
                        <div className="w-24 h-32 flex-shrink-0 bg-[#f0ebe2] overflow-hidden">
                          <img
    src={item.image}
    alt={item.name}
    className="w-full h-full object-cover"
  />
                        </div>

                        {
    /* Details */
  }
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">{item.name}</h3>
                              <button
    onClick={() => removeItem(item.id)}
    className="p-1 text-[#8c8277] hover:text-[#0a0a0a] transition-colors flex-shrink-0 -mt-0.5"
    aria-label="Remove item"
  >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              {item.size && <span className="text-xs text-[#8c8277]">Size: {item.size}</span>}
                              {item.color && <span className="text-xs text-[#8c8277]">{item.color}</span>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {
    /* Quantity controls */
  }
                            <div className="flex items-center border border-[#0a0a0a]/15">
                              <button
    onClick={() => updateQuantity(item.id, item.quantity - 1)}
    className="w-8 h-8 flex items-center justify-center hover:bg-[#f0ebe2] transition-colors text-[#0a0a0a]"
    aria-label="Decrease quantity"
  >
                                <FiMinus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm text-[#0a0a0a]">{item.quantity}</span>
                              <button
    onClick={() => updateQuantity(item.id, item.quantity + 1)}
    className="w-8 h-8 flex items-center justify-center hover:bg-[#f0ebe2] transition-colors text-[#0a0a0a]"
    aria-label="Increase quantity"
  >
                                <FiPlus size={12} />
                              </button>
                            </div>

                            {
    /* Price */
  }
                            <p className="text-sm font-medium text-[#0a0a0a]">
                              {money(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                </div>

                {
    /* Footer */
  }
                <div className="border-t border-[#0a0a0a]/10 px-6 py-6 space-y-4">
                  {
    /* Shipping note */
  }
                  {threshold > 0 && (
                    <>
                      <div className="flex items-center justify-between text-xs text-[#8c8277]">
                        <span>Free shipping on orders over {money(threshold)}</span>
                        {total >= threshold ? <span className="text-[#2d4a3e] font-medium">Qualified</span> : <span>{money(threshold - total)} away</span>}
                      </div>

                      {
    /* Progress bar */
  }
                      <div className="h-px bg-[#0a0a0a]/10 relative overflow-hidden">
                        <motion.div
    className="absolute left-0 top-0 h-full bg-[#2d4a3e]"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
                      </div>
                    </>
                  )}

                  {
    /* Subtotal */
  }
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#0a0a0a]">Subtotal</span>
                    <span className="text-base font-semibold text-[#0a0a0a]">{formattedTotal}</span>
                  </div>
                  <p className="text-xs text-[#8c8277]">Taxes and shipping calculated at checkout</p>

                  {
    /* Checkout button */
  }
                  <Link
    to="/checkout"
    onClick={closeCart}
    className="flex items-center justify-center gap-3 w-full py-4 bg-[#0a0a0a] text-[#fafafa] text-xs tracking-widest uppercase font-semibold hover:bg-[#2d4a3e] transition-colors group"
  >
                    Checkout
                    <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {
    /* Continue shopping */
  }
                  <button
    onClick={closeCart}
    className="w-full py-2 text-xs tracking-widest uppercase text-[#8c8277] hover:text-[#0a0a0a] transition-colors"
  >
                    Continue Shopping
                  </button>
                </div>
              </>}
          </motion.div>
        </>}
    </AnimatePresence>;
}
function EmptyCart({ onClose }) {
  return <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="w-20 h-20 border border-[#0a0a0a]/15 flex items-center justify-center mb-6"
  >
        <FiShoppingBag size={28} className="text-[#8c8277]" />
      </motion.div>
      <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18 }}
  >
        <h3 className="font-display text-xl text-[#0a0a0a] mb-2">Your bag is empty</h3>
        <p className="text-sm text-[#8c8277] mb-8 max-w-[220px] leading-relaxed">
          Discover our curated collections and add your favourites.
        </p>
        <Link
    to="/shop"
    onClick={onClose}
    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0a0a0a] text-[#fafafa] text-xs tracking-widest uppercase font-semibold hover:bg-[#2d4a3e] transition-colors"
  >
          Explore Shop <FiArrowRight size={13} />
        </Link>
        <div className="mt-6">
          <Link
    to="/collections"
    onClick={onClose}
    className="text-xs tracking-widest uppercase text-[#8c8277] hover:text-[#0a0a0a] transition-colors link-underline"
  >
            View Collections
          </Link>
        </div>
      </motion.div>
    </div>;
}
export {
  CartDrawer as default
};
