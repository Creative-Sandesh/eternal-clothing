import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiInstagram, FiHeart, FiShoppingBag } from "react-icons/fi";
import { products, categories, collections } from "../../data/products";
import { useCart } from "../../context/CartContext";
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};
const viewportOpts = { once: true, margin: "-80px" };
function HomePage() {
  const { addItem } = useCart();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState(/* @__PURE__ */ new Set());
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const displayNewArrivals = newArrivals.length >= 4 ? newArrivals : products.slice(0, 4);
  const firstTwoCollections = collections.slice(0, 2);
  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const handleQuickAdd = (p) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      size: p.sizes[0],
      color: p.colors[0].name,
      image: p.images[0],
      quantity: 1
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
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&auto=format"
  ];
  return <div className="bg-eternal-white">
      {
    /* ── 1. HERO ── */
  }
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <img
    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop&auto=format"
    alt="Eternal editorial hero"
    className="absolute inset-0 w-full h-full object-cover"
  />
        <div className="absolute inset-0 bg-eternal-black/50" />
        <motion.div
    className="relative z-10 px-8 md:px-16 pb-16 md:pb-24 max-w-3xl"
    variants={stagger}
    initial="hidden"
    animate="visible"
  >
          <motion.h1
    variants={fadeUp}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="font-display text-6xl md:text-8xl text-eternal-white leading-none tracking-tight"
  >
            Defining the vocabulary
            <br />
            of quiet luxury.
          </motion.h1>
          <motion.p
    variants={fadeUp}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="mt-6 font-sans italic text-eternal-warm text-lg md:text-xl"
  >
            Considered pieces. Lasting quality. Timeless presence.
          </motion.p>
          <motion.div
    variants={fadeUp}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="mt-10 flex flex-wrap gap-4"
  >
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
          </motion.div>
        </motion.div>
      </section>

      {
    /* ── 2. CATEGORY GRID ── */
  }
      <section className="bg-eternal-white py-20 px-8 md:px-16">
        <motion.h2
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.6 }}
    className="font-display text-3xl md:text-4xl text-eternal-black mb-10"
  >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-3 gap-3 h-[680px]">
          {categories.map((cat, i) => <motion.div
    key={cat.id}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.55, delay: i * 0.08 }}
    className={i === 0 ? "row-span-2" : ""}
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
                  <span className="font-display text-eternal-white text-2xl md:text-3xl leading-none">
                    {cat.name}
                  </span>
                  <p className="font-sans text-eternal-white/70 text-xs mt-1 tracking-wider uppercase">
                    {cat.count} pieces
                  </p>
                </div>
              </Link>
            </motion.div>)}
        </div>
      </section>

      {
    /* ── 3. FEATURED PRODUCTS ── */
  }
      <section className="bg-eternal-beige py-20 px-8 md:px-16">
        <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.6 }}
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
          {featuredProducts.map((p, i) => <motion.div
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
    src={hoveredProduct === p.id && p.images[1] ? p.images[1] : p.images[0]}
    alt={p.name}
    className="w-full h-full object-cover transition-all duration-500"
  />
                  {
    /* Badges */
  }
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {p.isNew && <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-black text-eternal-white px-2 py-1">
                        New
                      </span>}
                    {p.isSale && <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-green text-eternal-white px-2 py-1">
                        Sale
                      </span>}
                  </div>
                  {
    /* Wishlist */
  }
                  <button
    onClick={(e) => {
      e.preventDefault();
      toggleWishlist(p.id);
    }}
    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-eternal-white/80 hover:bg-eternal-white transition-colors"
    aria-label="Add to wishlist"
  >
                    <FiHeart
    size={14}
    className={wishlist.has(p.id) ? "fill-eternal-black text-eternal-black" : "text-eternal-black"}
  />
                  </button>
                  {
    /* Quick add — slides up on hover */
  }
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
                  <p className="font-display text-eternal-black text-lg leading-snug hover:text-eternal-stone transition-colors">
                    {p.name}
                  </p>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-sans text-eternal-stone text-sm">${p.price}</span>
                  {p.originalPrice && <span className="font-sans text-eternal-stone/60 text-sm line-through">
                      ${p.originalPrice}
                    </span>}
                </div>
              </div>
            </motion.div>)}
        </div>
      </section>

      {
    /* ── 4. COLLECTIONS BANNER ── */
  }
      <section>
        {firstTwoCollections.map((col, i) => <motion.div
    key={col.id}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.7, delay: 0.1 }}
    className={`flex flex-col md:flex-row min-h-[480px] ${i === 1 ? "md:flex-row-reverse" : ""}`}
  >
            {
    /* Text panel */
  }
            <div
    className={`flex-1 flex flex-col justify-center px-10 md:px-20 py-16 ${i === 0 ? "bg-eternal-green text-eternal-white" : "bg-eternal-beige text-eternal-black"}`}
  >
              <p className="font-sans text-xs tracking-widest uppercase mb-4 opacity-60">Collection</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-5">{col.name}</h2>
              <p
    className={`font-sans text-sm md:text-base leading-relaxed max-w-sm mb-8 ${i === 0 ? "text-eternal-white/70" : "text-eternal-stone"}`}
  >
                {col.description}
              </p>
              <Link
    to={`/shop?collection=${col.slug}`}
    className={`inline-flex items-center font-sans text-sm font-semibold tracking-widest uppercase gap-2 group ${i === 0 ? "text-eternal-white border-b border-eternal-white/40 pb-1 hover:border-eternal-white" : "text-eternal-black border-b border-eternal-black/40 pb-1 hover:border-eternal-black"} transition-colors w-fit`}
  >
                Explore
              </Link>
            </div>
            {
    /* Image panel */
  }
            <div className="flex-1 overflow-hidden min-h-[300px]">
              <img
    src={col.image}
    alt={col.name}
    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
  />
            </div>
          </motion.div>)}
      </section>

      {
    /* ── 5. NEW ARRIVALS ── */
  }
      <section className="bg-eternal-white py-20 px-8 md:px-16">
        <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.6 }}
    className="flex items-end justify-between mb-10"
  >
          <h2 className="font-display text-3xl md:text-4xl text-eternal-black">New Arrivals</h2>
          <Link
    to="/new-arrivals"
    className="font-sans text-sm text-eternal-stone hover:text-eternal-black transition-colors tracking-wider uppercase"
  >
            View All New Arrivals →
          </Link>
        </motion.div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-6" style={{ width: "max-content" }}>
            {displayNewArrivals.map((p, i) => <motion.div
    key={p.id}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.55, delay: i * 0.1 }}
    className="group w-64 flex-shrink-0"
  >
                <Link to={`/product/${p.id}`} className="block">
                  <div
    className="relative overflow-hidden aspect-[3/4] bg-eternal-stone/10"
    onMouseEnter={() => setHoveredProduct(`new-${p.id}`)}
    onMouseLeave={() => setHoveredProduct(null)}
  >
                    <img
    src={hoveredProduct === `new-${p.id}` && p.images[1] ? p.images[1] : p.images[0]}
    alt={p.name}
    className="w-full h-full object-cover transition-all duration-500"
  />
                    {p.isNew && <span className="absolute top-3 left-3 font-sans text-[10px] font-bold tracking-widest uppercase bg-eternal-black text-eternal-white px-2 py-1">
                        New
                      </span>}
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
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* ── 6. ABOUT STRIP ── */
  }
      <section className="bg-eternal-black py-20 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
    {
      title: "Considered Design",
      body: "Every silhouette is refined over months of iterative sampling. We design for longevity, not the cycle."
    },
    {
      title: "Premium Materials",
      body: "We source from mills that have perfected their craft over generations \u2014 Italian wool, Egyptian cotton, Japanese denim."
    },
    {
      title: "Responsible Craft",
      body: "Carbon-neutral shipping, ethical production partners, and packaging that composts within 90 days."
    }
  ].map((item, i) => <motion.div
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
            </motion.div>)}
        </div>
      </section>

      {
    /* ── 7. INSTAGRAM GRID ── */
  }
      <section className="bg-eternal-white py-20 px-8 md:px-16">
        <motion.h2
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.6 }}
    className="font-display text-3xl md:text-4xl text-eternal-black text-center mb-8"
  >
          Follow @eternal
        </motion.h2>
        <div className="grid grid-cols-3 gap-1 max-w-4xl mx-auto">
          {instagramImages.map((src, i) => <motion.div
    key={src}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOpts}
    transition={{ duration: 0.5, delay: i * 0.07 }}
    className="group relative aspect-square overflow-hidden"
  >
              <img
    src={src}
    alt={`Eternal editorial ${i + 1}`}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
              <div className="absolute inset-0 bg-eternal-black/0 group-hover:bg-eternal-black/30 transition-colors duration-300 flex items-center justify-center">
                <FiInstagram
    size={28}
    className="text-eternal-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  />
              </div>
            </motion.div>)}
        </div>
      </section>

      {
    /* ── 8. NEWSLETTER ── */
  }
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
    transition={{ duration: 0.6 }}
    className="font-display text-4xl md:text-5xl text-eternal-black mb-4"
  >
            Stay in the loop
          </motion.h2>
          <motion.p
    variants={fadeUp}
    transition={{ duration: 0.6 }}
    className="font-sans text-eternal-stone text-sm mb-10"
  >
            New arrivals, editorial stories, and access to exclusive drops.
          </motion.p>
          {subscribed ? <motion.p
    variants={fadeUp}
    transition={{ duration: 0.5 }}
    className="font-display text-xl text-eternal-black"
  >
              Thank you for subscribing.
            </motion.p> : <motion.form
    variants={fadeUp}
    transition={{ duration: 0.6 }}
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
            </motion.form>}
          <motion.p
    variants={fadeUp}
    transition={{ duration: 0.6 }}
    className="font-sans text-eternal-stone text-xs mt-5"
  >
            We respect your privacy. Unsubscribe at any time. No spam — ever.
          </motion.p>
        </motion.div>
      </section>
    </div>;
}
export {
  HomePage as default
};
