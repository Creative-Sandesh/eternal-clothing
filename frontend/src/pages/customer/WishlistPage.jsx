import { Link } from "react-router-dom";
import { useMoney } from "../../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingBag, FiX } from "react-icons/fi";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
function WishlistPage() {
  const money = useMoney();
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const handleMoveToCart = (item) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      size: "M",
      color: "Default",
      image: item.image,
      quantity: 1
    });
    toggle(item);
  };
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
          My Account
        </p>
        <h1 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>
          Wishlist
          {items.length > 0 && <span className="font-display text-2xl ml-3" style={{ color: "#8c8277" }}>
              ({items.length})
            </span>}
        </h1>
      </div>

      {items.length === 0 ? (
    /* Empty state */
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0ebe2" }}>
            <FiHeart size={32} style={{ color: "#c9b99a" }} />
          </div>
          <h2 className="font-display text-3xl mb-3" style={{ color: "#0a0a0a" }}>
            Your wishlist is empty
          </h2>
          <p className="text-sm max-w-sm mb-8" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Save your favourite pieces here so you can find them easily later.
          </p>
          <Link
      to="/shop"
      className="px-10 py-4 text-xs uppercase tracking-widest"
      style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
    >
            Browse Collection
          </Link>
        </motion.div>
  ) : (
    /* Grid */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => <motion.div
      key={item.productId}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      className="group relative border"
      style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
    >
                {
      /* Remove button */
    }
                <button
      type="button"
      onClick={() => toggle(item)}
      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-opacity duration-200"
      style={{ backgroundColor: "#fafafa" }}
      aria-label="Remove from wishlist"
    >
                  <FiX size={16} style={{ color: "#8c8277" }} />
                </button>

                {
      /* Image */
    }
                <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
      src={item.image}
      alt={item.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
                </div>

                {
      /* Info */
    }
                <div className="p-5">
                  <h3
      className="text-sm font-medium mb-1 leading-snug"
      style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
    >
                    {item.name}
                  </h3>
                  <p className="text-sm mb-4 font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                    {money(item.price)}
                  </p>
                  <button
      type="button"
      onClick={() => handleMoveToCart(item)}
      className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors duration-200 hover:bg-[#2d4a3e]"
      style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
    >
                    <FiShoppingBag size={14} />
                    Move to Cart
                  </button>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>
  )}
    </div>;
}
export {
  WishlistPage as default
};
