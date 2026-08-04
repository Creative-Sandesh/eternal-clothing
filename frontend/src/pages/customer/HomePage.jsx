import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FiInstagram,
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiArrowRight,
  FiChevronUp,
  FiStar,
  FiPlay,
} from "react-icons/fi";
import { products, categories, collections } from "../../data/products";
import { useCart } from "../../context/CartContext";

// ----------------------------------------------------------------------
// Animation variants & helpers
// ----------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const viewportOpts = { once: true, margin: "-100px 0px -80px 0px" };

const heartAnimation = {
  scale: [1, 1.3, 1],
  transition: { duration: 0.3 },
};

// Sample data for new sections (you can move to data/products later)
const testimonials = [
  {
    id: 1,
    name: "Elena M.",
    text: "The quality is unmatched. I’ve worn my Eternal blazer for two years and it still looks brand new.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 2,
    name: "Sophie L.",
    text: "Their commitment to sustainability gave me confidence to invest. The pieces are timeless.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    id: 3,
    name: "Ana R.",
    text: "Finally a brand that understands quiet luxury. Every detail is considered.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=9",
  },
];

const pressLogos = [
  "VOGUE",
  "ELLE",
  "HARPER'S BAZAAR",
  "GOOP",
  "MONOCLE",
  "WALLPAPER",
];

const heroSlides = [
  {
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop&auto=format",
    title: "Defining the vocabulary of quiet luxury.",
    subtitle: "Considered pieces. Lasting quality. Timeless presence.",
  },
  {
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&h=900&fit=crop&auto=format",
    title: "Where elegance meets intention.",
    subtitle: "New arrivals crafted for the modern muse.",
  },
];

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
function HomePage() {
  const { addItem } = useCart();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [heroIndex, setHeroIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Products
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 6);
  const displayNewArrivals =
    newArrivals.length >= 4 ? newArrivals : products.slice(0, 4);

  // Collections
  const firstTwoCollections = collections.slice(0, 2);

  // Parallax ref for collection banner
  const collectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: collectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Hero slides auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---- Handlers ----
  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleQuickAdd = (p, size) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      size: size || p.sizes[0],
      color: p.colors[0].name,
      image: p.images[0],
      quantity: 1,
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const instagramImages = [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&auto=format",
  ];

  // New Arrivals carousel controls
  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 280; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-eternal-white">
      {/* ── 1. HERO SLIDESHOW ── */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={heroSlides[heroIndex].img}
            src={heroSlides[heroIndex].img}
            alt="Eternal editorial hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-eternal-black/50" />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-eternal-white/70">
            Scroll
          </span>
          <motion.div
            className="w-6 h-10 border-2 border-eternal-white/40 rounded-full flex justify-center"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <div className="w-1 h-2 bg-eternal-white rounded-full mt-2" />
          </motion.div>
        </motion.div>

        {/* Text block */}
        <motion.div
          className="relative z-10 px-8 md:px-16 pb-16 md:pb-24 max-w-3xl"
          key={heroSlides[heroIndex].title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-5xl md:text-8xl text-eternal-white leading-none tracking-tight">
            {heroSlides[heroIndex].title}
          </h1>
          <p className="mt-6 font-sans italic text-eternal-warm text-lg md:text-xl">
            {heroSlides[heroIndex].subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-block bg-eternal-white text-eternal-black font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-eternal-beige transition-colors duration-300"
            >
              Shop Collection
            </Link>
            <Link
              to="/new-arrivals"
              className="inline-block border border-eternal-white text-eternal-white font-sans text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-eternal-white/10 transition-colors duration-300"
            >
              New Arrivals
            </Link>
          </div>
        </motion.div>

        {/* Slide navigation dots */}
        <div className="absolute bottom-8 right-8 md:right-16 z-10 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroIndex ? "bg-eternal-white scale-125" : "bg-eternal-white/40"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── 2. CATEGORY BENTO GRID ── */}
      <section className="bg-eternal-white py-20 px-8 md:px-16">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="font-display text-3xl md:text-4xl text-eternal-black mb-10"
        >
          Shop by Category
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] gap-3">
          {categories.map((cat, i) => {
            // First category gets a larger card that spans 2 rows & 2 columns on desktop
            const isFeatured = i === 0;
            return (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOpts}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={
                  isFeatured
                    ? "col-span-2 md:col-span-2 row-span-2"
                    : "col-span-1"
                }
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group relative flex overflow-hidden w-full h-full"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-eternal-black/25 group-hover:bg-eternal-black/45 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <span className="font-display text-eternal-white text-xl md:text-2xl leading-none block">
                      {cat.name}
                    </span>
                    <p className="font-sans text-eternal-white/70 text-xs mt-1 tracking-wider uppercase">
                      {cat.count} pieces
                    </p>
                  </div>
                  {/* Hover CTA */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-eternal-white text-eternal-black font-sans text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 shadow-2xl">
                      Explore {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS (with swatches, size quick-add) ── */}
      <section className="bg-eternal-beige py-20 px-8 md:px-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="flex items-end justify-between mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl text-eternal-black">The Essentials</h2>
          <Link
            to="/shop"
            className="font-sans text-sm text-eternal-stone hover:text-eternal-black transition-colors tracking-wider uppercase"
          >
            View All →
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOpts}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="group"
            >
              <Link to={`/product/${p.id}`} className="block">
                <div
                  className="relative overflow-hidden aspect-[3/4] bg-eternal-stone/10"
                  onMouseEnter={() => setHoveredProduct(p.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img
                    src={
                      hoveredProduct === p.id && p.images[1]
                        ? p.images[1]
                        : p.images[0]
                    }
                    alt={p.name}
                    className="w-full h-full object-cover transition-all duration-700 ease-out"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {p.isNew && (
                      <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-black text-eternal-white px-2 py-1">
                        New
                      </span>
                    )}
                    {p.isSale && (
                      <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-green text-eternal-white px-2 py-1">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Wishlist + animation */}
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(p.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-eternal-white/80 backdrop-blur-sm hover:bg-eternal-white transition-colors"
                    aria-label="Add to wishlist"
                    whileTap={heartAnimation}
                  >
                    <FiHeart
                      size={14}
                      className={
                        wishlist.has(p.id)
                          ? "fill-eternal-black text-eternal-black"
                          : "text-eternal-black"
                      }
                    />
                  </motion.button>

                  {/* Color swatches (if >1 color) */}
                  {p.colors && p.colors.length > 1 && (
                    <div className="absolute bottom-20 left-3 flex gap-1.5">
                      {p.colors.map((c, idx) => (
                        <button
                          key={c.name}
                          className="w-4 h-4 rounded-full border border-eternal-white shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                          onClick={(e) => {
                            e.preventDefault();
                            // here you'd update the displayed image or color state
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick add panel with size selection */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-eternal-black/95 backdrop-blur-sm p-3 flex items-center gap-2">
                      <select
                        className="bg-transparent text-eternal-white text-xs font-sans border border-eternal-white/40 px-2 py-1.5 flex-1 outline-none"
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) => {
                          // size selected
                        }}
                      >
                        {p.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const select = e.currentTarget.previousElementSibling;
                          handleQuickAdd(p, select.value);
                        }}
                        className="bg-eternal-white text-eternal-black font-sans text-xs font-semibold tracking-widest uppercase px-3 py-1.5 flex items-center gap-1.5 hover:bg-eternal-beige transition-colors"
                      >
                        <FiShoppingBag size={13} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Product info */}
              <div className="mt-3">
                <Link to={`/product/${p.id}`}>
                  <p className="font-display text-eternal-black text-lg leading-snug hover:text-eternal-stone transition-colors">
                    {p.name}
                  </p>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-sans text-eternal-stone text-sm">${p.price}</span>
                  {p.originalPrice && (
                    <span className="font-sans text-eternal-stone/60 text-sm line-through">
                      ${p.originalPrice}
                    </span>
                  )}
                </div>
                {/* "More colors" hint */}
                {p.colors && p.colors.length > 1 && (
                  <span className="text-[10px] text-eternal-stone mt-0.5 block">
                    +{p.colors.length - 1} colors
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. COLLECTIONS PARALLAX BANNER ── */}
      <section ref={collectionRef}>
        {firstTwoCollections.map((col, i) => (
          <motion.div
            key={col.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOpts}
            className={`flex flex-col md:flex-row min-h-[480px] ${i === 1 ? "md:flex-row-reverse" : ""
              }`}
          >
            {/* Text panel */}
            <div
              className={`flex-1 flex flex-col justify-center px-10 md:px-20 py-16 ${i === 0
                  ? "bg-eternal-green text-eternal-white"
                  : "bg-eternal-beige text-eternal-black"
                }`}
            >
              <p className="font-sans text-xs tracking-widest uppercase mb-4 opacity-60">
                Collection
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-5">{col.name}</h2>
              <p
                className={`font-sans text-sm md:text-base leading-relaxed max-w-sm mb-8 ${i === 0 ? "text-eternal-white/70" : "text-eternal-stone"
                  }`}
              >
                {col.description}
              </p>
              <Link
                to={`/shop?collection=${col.slug}`}
                className={`inline-flex items-center font-sans text-sm font-semibold tracking-widest uppercase gap-2 group ${i === 0
                    ? "text-eternal-white border-b border-eternal-white/40 pb-1 hover:border-eternal-white"
                    : "text-eternal-black border-b border-eternal-black/40 pb-1 hover:border-eternal-black"
                  } transition-colors w-fit`}
              >
                Explore
              </Link>
            </div>

            {/* Image panel with parallax */}
            <div className="flex-1 overflow-hidden min-h-[300px] relative">
              <motion.img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover absolute inset-0"
                style={{ y: parallaxY, scale: 1.05 }}
              />
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── 5. NEW ARRIVALS CAROUSEL ── */}
      <section className="bg-eternal-white py-20 px-8 md:px-16 overflow-hidden">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="flex items-end justify-between mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl text-eternal-black">New Arrivals</h2>
          <div className="flex gap-3 items-center">
            <Link
              to="/new-arrivals"
              className="font-sans text-sm text-eternal-stone hover:text-eternal-black transition-colors tracking-wider uppercase hidden md:inline"
            >
              View All →
            </Link>
            {/* Arrow navigation */}
            <div className="flex gap-1">
              <button
                onClick={() => scrollCarousel("left")}
                className="w-8 h-8 border border-eternal-stone/30 text-eternal-black flex items-center justify-center hover:bg-eternal-black hover:text-eternal-white transition-colors"
                aria-label="Scroll left"
              >
                <FiArrowLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="w-8 h-8 border border-eternal-stone/30 text-eternal-black flex items-center justify-center hover:bg-eternal-black hover:text-eternal-white transition-colors"
                aria-label="Scroll right"
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pr-4"
        >
          {displayNewArrivals.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOpts}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group w-64 flex-shrink-0"
            >
              <Link to={`/product/${p.id}`} className="block">
                <div
                  className="relative overflow-hidden aspect-[3/4] bg-eternal-stone/10"
                  onMouseEnter={() => setHoveredProduct(`new-${p.id}`)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img
                    src={
                      hoveredProduct === `new-${p.id}` && p.images[1]
                        ? p.images[1]
                        : p.images[0]
                    }
                    alt={p.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  {p.isNew && (
                    <span className="absolute top-3 left-3 font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-black text-eternal-white px-2 py-1">
                      New
                    </span>
                  )}
                  {/* Quick add on hover */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickAdd(p);
                      }}
                      className="w-full bg-eternal-black text-eternal-white font-sans text-xs font-semibold tracking-widest uppercase py-3 flex items-center justify-center gap-2 hover:bg-eternal-green transition-colors duration-300"
                    >
                      <FiShoppingBag size={13} />
                      Quick Add
                    </button>
                  </div>
                </div>
              </Link>
              <div className="mt-3">
                <Link to={`/product/${p.id}`}>
                  <p className="font-display text-eternal-black text-base leading-snug hover:text-eternal-stone transition-colors">
                    {p.name}
                  </p>
                </Link>
                <span className="font-sans text-eternal-stone text-sm">${p.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ── */}
      <section className="bg-eternal-black py-20 px-8 md:px-16">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="font-display text-3xl md:text-4xl text-eternal-white text-center mb-14"
        >
          What our community says
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOpts}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-eternal-white/5 backdrop-blur-sm p-8 flex flex-col items-center text-center"
            >
              <div className="flex gap-1 mb-4 text-eternal-warm">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <FiStar key={idx} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="font-sans italic text-eternal-white/80 text-sm leading-relaxed mb-5">
                “{t.text}”
              </p>
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover mb-2"
              />
              <span className="font-sans text-xs text-eternal-stone tracking-wider uppercase">
                {t.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 7. PRESS & RECOGNITION ── */}
      <section className="bg-eternal-beige py-14 px-8 md:px-16">
        <p className="text-center font-sans text-xs tracking-[0.25em] uppercase text-eternal-stone mb-8">
          As seen in
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 max-w-4xl mx-auto opacity-80">
          {pressLogos.map((logo) => (
            <span
              key={logo}
              className="font-display text-2xl md:text-3xl text-eternal-black/70 tracking-wider"
            >
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* ── 8. INSTAGRAM SHOPPABLE GRID ── */}
      <section className="bg-eternal-white py-20 px-8 md:px-16">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="font-display text-3xl md:text-4xl text-eternal-black text-center mb-8"
        >
          Shop our Instagram
        </motion.h2>
        <div className="grid grid-cols-3 gap-1 max-w-4xl mx-auto">
          {instagramImages.map((src, i) => (
            <motion.div
              key={src}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOpts}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group relative aspect-square overflow-hidden cursor-pointer"
            >
              <img
                src={src}
                alt={`Eternal editorial ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-eternal-black/0 group-hover:bg-eternal-black/40 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <FiInstagram size={28} className="text-eternal-white mb-2" />
                <span className="font-sans text-[10px] tracking-wider uppercase text-eternal-white border-b border-eternal-white/50 pb-1">
                  Shop this look
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 9. ABOUT STRIP (VALUES) ── */}
      <section className="bg-eternal-black py-20 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              title: "Considered Design",
              body: "Every silhouette is refined over months of iterative sampling. We design for longevity, not the cycle.",
            },
            {
              title: "Premium Materials",
              body: "We source from mills that have perfected their craft over generations — Italian wool, Egyptian cotton, Japanese denim.",
            },
            {
              title: "Responsible Craft",
              body: "Carbon-neutral shipping, ethical production partners, and packaging that composts within 90 days.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOpts}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="border-t border-eternal-warm pt-8"
            >
              <h3 className="font-display text-2xl text-eternal-white mb-3">{item.title}</h3>
              <p className="font-sans text-sm text-eternal-stone leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 10. NEWSLETTER ── */}
      <section className="bg-eternal-beige py-24 px-8 md:px-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOpts}
          className="max-w-lg mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl text-eternal-black mb-4"
          >
            Stay in the loop
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-sans text-eternal-stone text-sm mb-10"
          >
            New arrivals, editorial stories, and access to exclusive drops.
          </motion.p>
          {subscribed ? (
            <motion.p
              variants={fadeUp}
              className="font-display text-xl text-eternal-black"
            >
              Thank you for subscribing.
            </motion.p>
          ) : (
            <motion.form
              variants={fadeUp}
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-0 border-b border-eternal-stone"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent font-sans text-sm text-eternal-black placeholder:text-eternal-stone/60 outline-none py-3 px-0"
              />
              <button
                type="submit"
                className="bg-eternal-black text-eternal-white font-sans text-xs font-semibold tracking-widest uppercase px-8 py-3 hover:bg-eternal-green transition-colors duration-300 flex-shrink-0"
              >
                Subscribe
              </button>
            </motion.form>
          )}
          <motion.p
            variants={fadeUp}
            className="font-sans text-eternal-stone text-xs mt-5"
          >
            We respect your privacy. Unsubscribe at any time. No spam — ever.
          </motion.p>
        </motion.div>
      </section>

      {/* ── BACK TO TOP ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-eternal-black text-eternal-white flex items-center justify-center shadow-lg hover:bg-eternal-green transition-colors"
            aria-label="Back to top"
          >
            <FiChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export { HomePage as default };