import { useState, useEffect } from "react";
import { useMoney, useSettings } from "../../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiX, FiPlus, FiMinus, FiArrowLeft, FiTag } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { productApi, normalizeProduct } from "../../services/api";
function CartPage() {
  const money = useMoney();
  const { settings, freeShippingThreshold, shippingFee } = useSettings();
  const { items, addItem, removeItem, updateQuantity, total, count } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchSuggested = async () => {
      try {
        const res = await productApi.getProducts({ limit: 4 });
        if (!active) return;
        const normalized = (res.data?.products ?? res.data ?? []).map(normalizeProduct);
        setSuggestedProducts(normalized);
      } catch (err) {
        console.error("CartPage: failed to fetch suggestions", err);
      }
    };
    fetchSuggested();
    return () => { active = false; };
  }, []);

  const handleApplyPromo = () => {
    setPromoError(false);
    setPromoApplied(false);
    if (promoCode.toUpperCase() === "ETERNAL10") {
      setPromoApplied(true);
    } else {
      setPromoError(true);
    }
  };
  const qualifiesFreeShipping = freeShippingThreshold > 0 && total >= freeShippingThreshold;
  const shipping = total === 0 || qualifiesFreeShipping ? 0 : shippingFee;
  const tax = total * ((Number(settings.tax_rate_percent) || 0) / 100);
  const grandTotal = total + shipping + tax;
  if (items.length === 0) {
    return <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-6 px-4">
        <FiShoppingBag size={64} className="text-[#8c8277]" />
        <h1 className="font-display text-3xl text-[#0a0a0a]">Your cart is empty</h1>
        <p className="text-[#8c8277] text-center max-w-sm">
          Discover our curated collection of premium essentials.
        </p>
        <Link
      to="/shop"
      className="bg-[#0a0a0a] text-[#fafafa] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#2d4a3e] transition"
    >
          Continue Shopping
        </Link>
      </div>;
  }
  return <div className="min-h-screen bg-[#fafafa]">
      {
    /* Page Header */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 border-b border-[#f0ebe2]">
        <Link
    to="/shop"
    className="inline-flex items-center gap-2 text-xs text-[#8c8277] uppercase tracking-widest hover:text-[#0a0a0a] transition mb-6"
  >
          <FiArrowLeft size={14} />
          Continue Shopping
        </Link>
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-4xl text-[#0a0a0a]">Shopping Bag</h1>
          <span className="text-[#8c8277] text-sm">{count} {count === 1 ? "item" : "items"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {
    /* Left Column — Cart Items */
  }
        <div className="lg:col-span-8">
          {
    /* Desktop Table */
  }
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0ebe2]">
                  <th className="text-xs uppercase tracking-widest text-[#8c8277] text-left pb-4 font-normal">Product</th>
                  <th className="text-xs uppercase tracking-widest text-[#8c8277] text-left pb-4 font-normal">Details</th>
                  <th className="text-xs uppercase tracking-widest text-[#8c8277] text-center pb-4 font-normal">Quantity</th>
                  <th className="text-xs uppercase tracking-widest text-[#8c8277] text-right pb-4 font-normal">Price</th>
                  <th className="pb-4" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item) => <motion.tr
    key={item.id}
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
    className="border-b border-[#f0ebe2]"
  >
                      <td className="py-6 pr-4">
                        <div className="flex items-start gap-4">
                          <Link to={`/product/${item.productId}`}>
                            <img
    src={item.image}
    alt={item.name}
    className="w-20 h-[100px] object-cover rounded"
  />
                          </Link>
                          <div className="pt-1">
                            <Link
    to={`/product/${item.productId}`}
    className="font-display text-sm text-[#0a0a0a] hover:text-[#2d4a3e] transition block leading-snug"
  >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <p className="text-xs text-[#8c8277]">{item.color}</p>
                        <p className="text-xs text-[#8c8277]">Size: {item.size}</p>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
    onClick={() => updateQuantity(item.id, item.quantity - 1)}
    className="w-7 h-7 flex items-center justify-center border border-[#c9b99a] hover:border-[#0a0a0a] transition text-[#0a0a0a]"
    aria-label="Decrease quantity"
  >
                            <FiMinus size={12} />
                          </button>
                          <span className="text-sm w-5 text-center">{item.quantity}</span>
                          <button
    onClick={() => updateQuantity(item.id, item.quantity + 1)}
    className="w-7 h-7 flex items-center justify-center border border-[#c9b99a] hover:border-[#0a0a0a] transition text-[#0a0a0a]"
    aria-label="Increase quantity"
  >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-6 pl-4 text-right">
                        <span className="text-sm text-[#0a0a0a]">
                          {money((item.price * item.quantity))}
                        </span>
                      </td>
                      <td className="py-6 pl-4">
                        <button
    onClick={() => removeItem(item.id)}
    className="text-[#8c8277] hover:text-[#0a0a0a] transition"
    aria-label="Remove item"
  >
                          <FiX size={16} />
                        </button>
                      </td>
                    </motion.tr>)}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {
    /* Mobile Stacked Cards */
  }
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {items.map((item) => <motion.div
    key={item.id}
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
    className="flex gap-4 border-b border-[#f0ebe2] pb-4"
  >
                  <Link to={`/product/${item.productId}`} className="shrink-0">
                    <img
    src={item.image}
    alt={item.name}
    className="w-24 h-32 object-cover rounded"
  />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
    to={`/product/${item.productId}`}
    className="font-display text-sm text-[#0a0a0a] hover:text-[#2d4a3e] transition leading-snug block"
  >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[#8c8277] mt-1">{item.color} · Size {item.size}</p>
                      <p className="text-sm text-[#0a0a0a] mt-1">{money((item.price * item.quantity))}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
    onClick={() => updateQuantity(item.id, item.quantity - 1)}
    className="w-7 h-7 flex items-center justify-center border border-[#c9b99a] hover:border-[#0a0a0a] transition"
    aria-label="Decrease quantity"
  >
                          <FiMinus size={12} />
                        </button>
                        <span className="text-sm w-5 text-center">{item.quantity}</span>
                        <button
    onClick={() => updateQuantity(item.id, item.quantity + 1)}
    className="w-7 h-7 flex items-center justify-center border border-[#c9b99a] hover:border-[#0a0a0a] transition"
    aria-label="Increase quantity"
  >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button
    onClick={() => removeItem(item.id)}
    className="text-[#8c8277] hover:text-[#0a0a0a] transition"
    aria-label="Remove item"
  >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </div>

        {
    /* Right Column — Order Summary */
  }
        <div className="lg:col-span-4">
          <div className="bg-[#f0ebe2] p-6 sticky top-8">
            <h2 className="font-display text-2xl text-[#0a0a0a] mb-6">Order Summary</h2>

            {
    /* Line Items */
  }
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#8c8277]">Subtotal</span>
                <span className="text-[#0a0a0a]">{money(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8c8277]">Shipping</span>
                <span className="text-[#0a0a0a]">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              {freeShippingThreshold > 0 && !qualifiesFreeShipping && total > 0 && (
                <p className="text-xs text-[#8c8277]">Free shipping on orders over {money(freeShippingThreshold)}</p>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8c8277]">Estimated Tax</span>
                  <span className="text-[#0a0a0a]">{money(tax)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#c9b99a] my-4" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="font-display text-xl text-[#0a0a0a]">Total</span>
              <span className="font-display text-xl text-[#0a0a0a]">{money(grandTotal)}</span>
            </div>

            {
    /* Promo Code */
  }
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <FiTag size={14} className="text-[#8c8277] shrink-0" />
                <input
    type="text"
    value={promoCode}
    onChange={(e) => {
      setPromoCode(e.target.value);
      setPromoError(false);
      setPromoApplied(false);
    }}
    placeholder="Promo code"
    className="bg-transparent border-b border-[#8c8277] text-sm px-2 py-2 flex-1 outline-none placeholder-[#8c8277] text-[#0a0a0a]"
  />
                <button
    onClick={handleApplyPromo}
    className="text-sm underline text-[#0a0a0a] hover:text-[#2d4a3e] transition whitespace-nowrap"
  >
                  Apply
                </button>
              </div>
              {promoApplied && <p className="text-xs text-[#2d4a3e] mt-2">10% discount applied</p>}
              {promoError && <p className="text-xs text-red-500 mt-2">Invalid code</p>}
            </div>

            {
    /* Checkout Button */
  }
            <button
    onClick={() => navigate("/checkout")}
    className="w-full py-4 bg-[#0a0a0a] text-[#fafafa] text-sm tracking-widest uppercase hover:bg-[#2d4a3e] transition"
  >
              Proceed to Checkout
            </button>

            <div className="text-center mt-3">
              <Link
    to="/shop"
    className="text-xs text-[#8c8277] underline hover:text-[#0a0a0a] transition"
  >
                or continue shopping
              </Link>
            </div>

            {
    /* Payment Icons */
  }
            <div className="mt-6">
              <p className="text-xs text-[#8c8277] mb-2">We accept</p>
              <div className="flex gap-2 flex-wrap">
                {["VISA", "MC", "AMEX", "PAYPAL"].map((method) => <span
    key={method}
    className="rounded border border-[#8c8277] px-2 py-1 text-xs text-[#8c8277]"
  >
                    {method}
                  </span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {
    /* You Might Also Like */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="border-t border-[#f0ebe2] pt-12">
          <h2 className="font-display text-2xl text-[#0a0a0a] mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestedProducts.map((product) => <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="overflow-hidden rounded mb-3">
                  <img
    src={product.images[0]}
    alt={product.name}
    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition duration-500"
  />
                </div>
                <p className="font-display text-sm text-[#0a0a0a] leading-snug">{product.name}</p>
                <p className="text-[#8c8277] text-sm mt-0.5">{money(product.price)}</p>
              </Link>)}
          </div>
        </div>
      </div>
    </div>;
}
export {
  CartPage as default
};
