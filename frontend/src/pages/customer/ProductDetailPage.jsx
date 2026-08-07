import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiTruck, FiRotateCcw } from "react-icons/fi";
import { products } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
const mockReviews = [
  { id: 1, name: "Emma S.", rating: 5, date: "March 2025", text: "Absolutely impeccable quality. The fabric feels luxurious and the fit is exactly as described." },
  { id: 2, name: "James H.", rating: 5, date: "February 2025", text: "Worth every penny. Beautifully constructed and the colour is even more refined in person." },
  { id: 3, name: "Sofia M.", rating: 4, date: "January 2025", text: "Elegant and well-made. Sizing is generous which I appreciate for layering." }
];
function StarRating({ rating, size = "sm" }) {
  const sizeClass = size === "md" ? "text-base" : "text-sm";
  return <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => <span
    key={star}
    className={star <= Math.round(rating) ? "text-[#c9b99a]" : "text-gray-300"}
  >
          ★
        </span>)}
    </div>;
}
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id) || products[0];
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState("Description");
  const [activeTab, setActiveTab] = useState("details");
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [hovered, setHovered] = useState(false);
  const images = product.images && product.images.length > 0 ? product.images : [];
  const wishlisted = isWishlisted(product.id);
  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const displayRelated = relatedProducts.length >= 4 ? relatedProducts : products.filter((p) => p.id !== product.id).slice(0, 4);
  function handlePrevImage() {
    setSelectedImage((prev) => prev === 0 ? images.length - 1 : prev - 1);
  }
  function handleNextImage() {
    setSelectedImage((prev) => prev === images.length - 1 ? 0 : prev + 1);
  }
  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 800);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      image: images[0],
      quantity
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2e3);
  }
  function handleWishlist() {
    toggle({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0]
    });
  }
  function toggleAccordion(label) {
    setOpenAccordion((prev) => prev === label ? null : label);
  }
  const accordionSections = [
    {
      label: "Description",
      content: <p className="text-sm text-[#8c8277] leading-relaxed">{product.description}</p>
    },
    {
      label: "Details & Care",
      content: <ul className="list-disc list-inside text-sm text-[#8c8277] space-y-1">
          {product.details && product.details.length > 0 ? product.details.map((d, i) => <li key={i}>{d}</li>) : <>
                <li>100% premium natural fibres</li>
                <li>Dry clean recommended</li>
                <li>Store flat or on a padded hanger</li>
                <li>Avoid prolonged direct sunlight</li>
              </>}
        </ul>
    },
    {
      label: "Shipping & Returns",
      content: <p className="text-sm text-[#8c8277] leading-relaxed">
          Standard delivery 3–5 working days. Free on orders over £200. Express delivery available at checkout. Returns accepted within 30 days of receipt in original condition and packaging.
        </p>
    }
  ];
  return <div className="min-h-screen bg-[#fafafa]">
      {
    /* Main product section */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-12 gap-6 md:gap-12">

          {
    /* LEFT — Image Gallery */
  }
          <div className="col-span-12 md:col-span-5">
            <div className="md:sticky md:top-8">
              {
    /* Main image */
  }
              <div
    className="relative aspect-[3/4] overflow-hidden bg-[#f0ebe2] group"
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
                <motion.img
    key={selectedImage}
    src={images[selectedImage]}
    alt={product.name}
    className="w-full h-full object-cover"
    animate={{ scale: hovered ? 1.04 : 1 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    initial={{ opacity: 0 }}
    exit={{ opacity: 0 }}
    onLoad={(e) => e.currentTarget.style.opacity = "1"}
    style={{ opacity: 0, transition: "opacity 0.3s" }}
  />

                {images.length > 1 && <>
                    <button
    onClick={handlePrevImage}
    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#fafafa]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#fafafa] transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
    aria-label="Previous image"
  >
                      <FiChevronLeft className="text-[#0a0a0a] text-lg" />
                    </button>
                    <button
    onClick={handleNextImage}
    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#fafafa]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#fafafa] transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
    aria-label="Next image"
  >
                      <FiChevronRight className="text-[#0a0a0a] text-lg" />
                    </button>
                  </>}
              </div>

              {
    /* Thumbnails */
  }
              {images.length > 1 && <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((img, i) => <button
    key={i}
    onClick={() => setSelectedImage(i)}
    className={`w-20 h-24 overflow-hidden border-2 transition ${i === selectedImage ? "border-[#0a0a0a]" : "border-transparent"}`}
  >
                      <img
    src={img}
    alt={`${product.name} view ${i + 1}`}
    className="w-full h-full object-cover"
  />
                    </button>)}
                </div>}
            </div>
          </div>

          {
    /* RIGHT — Product Details */
  }
          <div className="col-span-12 md:col-span-7 pt-2 md:pt-0">

            {
    /* Breadcrumb */
  }
            <nav className="flex items-center gap-1 text-xs text-[#8c8277]">
              <Link to="/" className="hover:text-[#0a0a0a] transition">Home</Link>
              <span>/</span>
              <Link
    to={`/shop?category=${encodeURIComponent(product.category)}`}
    className="hover:text-[#0a0a0a] transition capitalize"
  >
                {product.category}
              </Link>
              <span>/</span>
              <span className="text-[#0a0a0a]">{product.name}</span>
            </nav>

            {
    /* Brand badge */
  }
            <p className="mt-4 mb-2 text-xs tracking-[0.3em] text-[#8c8277] uppercase">Eternal</p>

            {
    /* Product name */
  }
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#0a0a0a] leading-tight">
              {product.name}
            </h1>

            {
    /* Rating */
  }
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating || 5} />
              <button
    onClick={() => setActiveTab("reviews")}
    className="text-xs text-[#8c8277] underline underline-offset-2 hover:text-[#0a0a0a] transition"
  >
                {product.reviewCount || mockReviews.length} reviews
              </button>
            </div>

            {
    /* Price */
  }
            <div className="flex items-baseline gap-3 mt-4">
              {product.isSale && product.originalPrice ? <>
                  <span className="text-3xl font-display text-red-600">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-xl text-[#8c8277] line-through">
                    £{product.originalPrice.toFixed(2)}
                  </span>
                </> : <span className="text-3xl font-display text-[#0a0a0a]">
                  £{product.price.toFixed(2)}
                </span>}
            </div>

            {
    /* Short description */
  }
            <p className="mt-4 text-sm text-[#8c8277] leading-relaxed">
              {product.description}
            </p>

            {
    /* Divider */
  }
            <div className="border-t border-[#f0ebe2] my-6" />

            {
    /* Color selector */
  }
            {product.colors && product.colors.length > 0 && <div className="mb-6">
                <p className="text-sm font-medium text-[#0a0a0a] mb-2">
                  Colour: <span className="font-normal text-[#8c8277]">{selectedColor.name}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => <button
    key={color.name}
    onClick={() => setSelectedColor(color)}
    title={color.name}
    className={`w-8 h-8 rounded-full cursor-pointer transition ${selectedColor.name === color.name ? "ring-2 ring-offset-2 ring-[#0a0a0a]" : "ring-1 ring-offset-1 ring-transparent hover:ring-[#8c8277]"}`}
    style={{ backgroundColor: color.hex }}
    aria-label={color.name}
  />)}
                </div>
              </div>}

            {
    /* Size selector */
  }
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#0a0a0a]">Size</p>
                <button className="text-xs text-[#8c8277] underline underline-offset-2 hover:text-[#0a0a0a] transition">
                  Size Guide
                </button>
              </div>
              <motion.div
    animate={sizeError ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-wrap gap-2"
  >
                {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((size) => <button
    key={size}
    onClick={() => {
      setSelectedSize(size);
      setSizeError(false);
    }}
    className={`px-4 py-2 text-sm border transition ${selectedSize === size ? "bg-[#0a0a0a] text-[#fafafa] border-[#0a0a0a]" : sizeError ? "border-red-400 text-[#0a0a0a] hover:bg-[#f0ebe2]" : "border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#f0ebe2]"}`}
  >
                    {size}
                  </button>)}
              </motion.div>
              <AnimatePresence>
                {sizeError && <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    className="text-xs text-red-500 mt-1"
  >
                    Please select a size before adding to bag.
                  </motion.p>}
              </AnimatePresence>
            </div>

            {
    /* Quantity */
  }
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-medium text-[#0a0a0a]">Quantity</p>
              <div className="flex items-center border border-[#0a0a0a]">
                <button
    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
    className="w-10 h-10 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f0ebe2] transition text-lg"
    aria-label="Decrease quantity"
  >
                  −
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-[#0a0a0a] border-x border-[#0a0a0a]">
                  {quantity}
                </span>
                <button
    onClick={() => setQuantity((q) => q + 1)}
    className="w-10 h-10 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f0ebe2] transition text-lg"
    aria-label="Increase quantity"
  >
                  +
                </button>
              </div>
            </div>

            {
    /* Add to Cart */
  }
            <motion.button
    onClick={handleAddToCart}
    whileTap={{ scale: 0.98 }}
    className={`w-full py-4 font-medium tracking-widest uppercase text-sm transition-colors duration-300 ${addedToCart ? "bg-[#2d4a3e] text-[#fafafa]" : "bg-[#0a0a0a] text-[#fafafa] hover:bg-[#2d4a3e]"}`}
  >
              {addedToCart ? "Added to Bag \u2713" : "Add to Bag"}
            </motion.button>

            {
    /* Add to Wishlist */
  }
            <button
    onClick={handleWishlist}
    className="w-full py-4 mt-3 border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#f0ebe2] transition flex items-center justify-center gap-2 text-sm font-medium tracking-widest uppercase"
  >
              <FiHeart
    className={`text-base transition ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
  />
              {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>

            {
    /* Material + SKU */
  }
            <div className="mt-4 space-y-1 text-xs text-[#8c8277]">
              {product.material && <p>Material: {product.material}</p>}
              <p>SKU: ETR-{product.id?.toUpperCase() || "N/A"}</p>
            </div>

            {
    /* Delivery strip */
  }
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#8c8277]">
              <span className="flex items-center gap-1.5">
                <FiTruck className="text-sm" />
                Free delivery over £200
              </span>
              <span className="flex items-center gap-1.5">
                <FiRotateCcw className="text-sm" />
                30-day returns
              </span>
            </div>

            {
    /* Accordion */
  }
            <div className="mt-8">
              {accordionSections.map((section) => <div key={section.label} className="border-t border-[#f0ebe2]">
                  <button
    onClick={() => toggleAccordion(section.label)}
    className="w-full flex items-center justify-between py-4 text-sm font-medium text-[#0a0a0a] hover:text-[#2d4a3e] transition"
  >
                    <span>{section.label}</span>
                    {openAccordion === section.label ? <FiChevronUp className="text-base flex-shrink-0" /> : <FiChevronDown className="text-base flex-shrink-0" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordion === section.label && <motion.div
    key="content"
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="overflow-hidden"
  >
                        <div className="pb-4">{section.content}</div>
                      </motion.div>}
                  </AnimatePresence>
                </div>)}
              <div className="border-t border-[#f0ebe2]" />
            </div>
          </div>
        </div>
      </div>

      {
    /* Below fold — Tabs */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-b border-[#f0ebe2] flex gap-6 sm:gap-8 mb-8 overflow-x-auto">
          {["details", "reviews"].map((tab) => <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className={`pb-3 text-sm font-medium uppercase tracking-widest transition ${activeTab === tab ? "border-b-2 border-[#0a0a0a] text-[#0a0a0a]" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}
  >
              {tab === "details" ? "Product Details" : "Reviews"}
            </button>)}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "details" && <motion.div
    key="details"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="grid md:grid-cols-2 gap-12"
  >
              <div>
                <h3 className="font-display text-2xl text-[#0a0a0a] mb-4">About this piece</h3>
                <p className="text-sm text-[#8c8277] leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h3 className="font-display text-2xl text-[#0a0a0a] mb-4">Details & Care</h3>
                <ul className="list-disc list-inside text-sm text-[#8c8277] space-y-2">
                  {product.details && product.details.length > 0 ? product.details.map((d, i) => <li key={i}>{d}</li>) : <>
                        <li>100% premium natural fibres</li>
                        <li>Dry clean recommended</li>
                        <li>Store flat or on a padded hanger</li>
                        <li>Avoid prolonged direct sunlight</li>
                      </>}
                </ul>
              </div>
            </motion.div>}

          {activeTab === "reviews" && <motion.div
    key="reviews"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
              <div className="flex items-baseline gap-4 mb-8">
                <h3 className="font-display text-2xl text-[#0a0a0a]">Customer Reviews</h3>
                <span className="text-sm text-[#8c8277]">{mockReviews.length} reviews</span>
              </div>
              <div className="space-y-8 max-w-2xl">
                {mockReviews.map((review) => <div key={review.id} className="border-b border-[#f0ebe2] pb-8 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[#0a0a0a]">{review.name}</span>
                      <span className="text-xs text-[#8c8277]">{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="mt-2 text-sm text-[#8c8277] leading-relaxed">{review.text}</p>
                  </div>)}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>

      {
    /* Related Products */
  }
      {displayRelated.length > 0 && <div className="bg-[#f0ebe2] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl text-[#0a0a0a] mb-8 sm:mb-10 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {displayRelated.map((related) => <motion.div
    key={related.id}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.25 }}
  >
                  <Link to={`/product/${related.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-[#fafafa] mb-3">
                      <img
    src={related.images?.[0] ?? ""}
    alt={related.name}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
                    </div>
                    <p className="text-xs tracking-[0.2em] text-[#8c8277] uppercase mb-0.5">Eternal</p>
                    <h3 className="font-display text-base text-[#0a0a0a] leading-snug mb-1">{related.name}</h3>
                    <div className="flex items-baseline gap-2">
                      {related.isSale && related.originalPrice ? <>
                          <span className="text-sm text-red-600 font-medium">£{related.price.toFixed(2)}</span>
                          <span className="text-xs text-[#8c8277] line-through">£{related.originalPrice.toFixed(2)}</span>
                        </> : <span className="text-sm text-[#0a0a0a]">£{related.price.toFixed(2)}</span>}
                    </div>
                  </Link>
                </motion.div>)}
            </div>
          </div>
        </div>}
    </div>;
}
export {
  ProductDetailPage as default
};
