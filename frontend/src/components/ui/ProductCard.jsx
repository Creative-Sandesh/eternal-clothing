import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RiHeartLine, RiHeartFill, RiShoppingBagLine } from "react-icons/ri";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useMoney } from "../../context/SettingsContext";
import Badge from "./Badge";
import Rating from "./Rating";
function ProductCard({ product, viewMode = "grid" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { isWishlisted, toggle } = useWishlist();
  const { addItem } = useCart();
  const money = useMoney();
  const wishlisted = isWishlisted(product.id);
  const hasSecondImage = product.images.length > 1;
  const handleWishlist = (e) => {
    e.preventDefault();
    toggle({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
  };
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.sizes[0] ?? "",
      color: product.colors[0]?.name ?? "",
      image: product.images[0],
      quantity: 1
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2e3);
  };
  if (viewMode === "list") {
    return <Link
      to={`/product/${product.id}`}
      className="flex gap-6 border-b border-[#e0d9cc] py-6 group focus:outline-none"
      aria-label={`View ${product.name}`}
    >
        {
      /* Image */
    }
        <div className="relative w-32 shrink-0 overflow-hidden bg-[#f0ebe2]">
          <img
      src={product.images[0]}
      alt={product.name}
      className="w-full aspect-[3/4] object-cover"
    />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isSale && <Badge variant="sale">Sale</Badge>}
          </div>
        </div>

        {
      /* Info */
    }
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#8c8277] mb-1">
              {product.collection}
            </p>
            <h3 className="font-display text-lg text-[#0a0a0a] group-hover:text-[#2d4a3e] transition-colors duration-200">
              {product.name}
            </h3>
            <p className="font-sans text-sm text-[#8c8277] mt-2 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-3">
              <Rating value={product.rating} count={product.reviewCount} size="sm" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-semibold text-[#0a0a0a]">
                {money(product.price)}
              </span>
              {product.originalPrice && <span className="font-sans text-sm text-[#8c8277] line-through">
                  {money(product.originalPrice)}
                </span>}
            </div>
            <div className="flex items-center gap-2">
              <button
      onClick={handleWishlist}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="p-2 text-[#8c8277] hover:text-[#0a0a0a] transition-colors duration-200"
    >
                {wishlisted ? <RiHeartFill size={18} className="text-[#7a1a1a]" /> : <RiHeartLine size={18} />}
              </button>
              <button
      onClick={handleAddToCart}
      aria-label="Add to cart"
      className={[
        "flex items-center gap-2 px-4 py-2 border font-sans text-[10px] tracking-widest uppercase font-semibold",
        "transition-all duration-200",
        addedToCart ? "border-[#2d4a3e] bg-[#2d4a3e] text-[#fafafa]" : "border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa]"
      ].join(" ")}
    >
                <RiShoppingBagLine size={14} />
                {addedToCart ? "Added" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </Link>;
  }
  return <Link
    to={`/product/${product.id}`}
    className="group flex flex-col focus:outline-none"
    aria-label={`View ${product.name}`}
  >
      {
    /* Image Container */
  }
      <div
    className="relative overflow-hidden bg-[#f0ebe2]"
    onMouseEnter={() => hasSecondImage && setImageIndex(1)}
    onMouseLeave={() => setImageIndex(0)}
  >
        <div className="aspect-[3/4] relative">
          <AnimatePresence initial={false}>
            <motion.img
    key={imageIndex}
    src={product.images[imageIndex]}
    alt={`${product.name}${imageIndex === 1 ? " - alternate view" : ""}`}
    className="absolute inset-0 w-full h-full object-cover"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  />
          </AnimatePresence>
        </div>

        {
    /* Badges */
  }
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isSale && <Badge variant="sale">Sale</Badge>}
          {product.isBestSeller && <Badge variant="bestseller">Bestseller</Badge>}
          {!product.inStock && <Badge variant="low-stock">Sold Out</Badge>}
        </div>

        {
    /* Actions overlay */
  }
        <div className="absolute top-3 right-3">
          <motion.button
    onClick={handleWishlist}
    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    whileTap={{ scale: 0.85 }}
    className={[
      "flex items-center justify-center w-9 h-9 bg-[#fafafa]/90 backdrop-blur-sm",
      "text-[#0a0a0a] hover:bg-[#fafafa] transition-colors duration-200"
    ].join(" ")}
  >
            {wishlisted ? <RiHeartFill size={16} className="text-[#7a1a1a]" /> : <RiHeartLine size={16} />}
          </motion.button>
        </div>

        {
    /* Add to cart - appears on hover */
  }
        <motion.div
    className="absolute bottom-0 left-0 right-0"
    initial={{ y: "100%" }}
    whileHover={{ y: 0 }}
  >
          <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <button
    onClick={handleAddToCart}
    disabled={!product.inStock}
    aria-label="Add to cart"
    className={[
      "w-full py-3.5 font-sans text-[10px] tracking-widest uppercase font-semibold",
      "transition-all duration-200 flex items-center justify-center gap-2",
      addedToCart ? "bg-[#2d4a3e] text-[#fafafa]" : product.inStock ? "bg-[#0a0a0a] text-[#fafafa] hover:bg-[#2d4a3e]" : "bg-[#8c8277] text-[#fafafa] cursor-not-allowed"
    ].join(" ")}
  >
              <RiShoppingBagLine size={14} />
              {addedToCart ? "Added to Bag" : product.inStock ? "Add to Bag" : "Sold Out"}
            </button>
          </div>
        </motion.div>
      </div>

      {
    /* Product Info */
  }
      <div className="mt-3 flex flex-col gap-1.5 px-0.5">
        <p className="font-sans text-[9px] tracking-widest uppercase text-[#8c8277]">
          {product.collection}
        </p>
        <h3 className="font-sans text-sm font-medium text-[#0a0a0a] group-hover:text-[#2d4a3e] transition-colors duration-200 leading-snug">
          {product.name}
        </h3>
        <Rating value={product.rating} count={product.reviewCount} size="sm" />
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-sans text-sm font-semibold text-[#0a0a0a]">
            {money(product.price)}
          </span>
          {product.originalPrice && <span className="font-sans text-xs text-[#8c8277] line-through">
              {money(product.originalPrice)}
            </span>}
        </div>
      </div>
    </Link>;
}
export {
  ProductCard as default
};
