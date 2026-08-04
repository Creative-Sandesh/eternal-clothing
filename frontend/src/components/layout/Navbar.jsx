import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiX, FiMenu, FiChevronRight } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
const megaMenuCategories = [
  { label: "New Arrivals", href: "/new-arrivals", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { label: "Dresses", href: "/shop?category=dresses", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80" },
  { label: "Outerwear", href: "/shop?category=outerwear", image: "https://images.unsplash.com/photo-1548624313-0396a0175a23?w=400&q=80" },
  { label: "Tailoring", href: "/shop?category=tailoring", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b5282?w=400&q=80" },
  { label: "Knitwear", href: "/shop?category=knitwear", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80" },
  { label: "Accessories", href: "/shop?category=accessories", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80" }
];
const navLinks = [
  { label: "Shop", href: "/shop", hasMega: true },
  { label: "Categories", href: "/categories" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Sale", href: "/sale" }
];
const mobileLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Sale", href: "/sale" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Account", href: "/account" },
  { label: "FAQ", href: "/faq" }
];
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const { count: cartCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 300);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [searchOpen]);
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  const isTransparent = !scrolled && location.pathname === "/";
  return <>
      {
    /* Main Navbar */
  }
      <header
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isTransparent ? "bg-transparent text-[#fafafa]" : "bg-[#fafafa] text-[#0a0a0a]"} ${scrolled ? "border-b border-[#0a0a0a]/10" : ""}`}
  >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {
    /* Mobile hamburger */
  }
            <button
    className="lg:hidden p-2 -ml-2 hover:opacity-60 transition-opacity"
    onClick={() => setMobileOpen(true)}
    aria-label="Open menu"
  >
              <FiMenu size={22} />
            </button>

            {
    /* Left nav links — desktop */
  }
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => <div
    key={link.label}
    className="relative"
    onMouseEnter={() => link.hasMega && setMegaOpen(true)}
    onMouseLeave={() => link.hasMega && setMegaOpen(false)}
  >
                  <Link
    to={link.href}
    className="link-underline text-xs tracking-widest uppercase font-medium py-6 block hover:opacity-70 transition-opacity"
  >
                    {link.label}
                  </Link>
                </div>)}
            </nav>

            {
    /* Logo — centered */
  }
            <Link
    to="/"
    className="absolute left-1/2 -translate-x-1/2 font-display tracking-[0.25em] text-sm uppercase select-none hover:opacity-70 transition-opacity"
  >
              ETERNAL
            </Link>

            {
    /* Right icons */
  }
            <div className="flex items-center gap-4 lg:gap-5">
              <button
    className="p-1 hover:opacity-60 transition-opacity hidden sm:block"
    onClick={() => setSearchOpen(true)}
    aria-label="Search"
  >
                <FiSearch size={19} />
              </button>

              <Link to="/wishlist" className="p-1 hover:opacity-60 transition-opacity relative hidden sm:block" aria-label="Wishlist">
                <FiHeart size={19} />
                {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#2d4a3e] text-[#fafafa] text-[9px] flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>}
              </Link>

              <button
    className="p-1 hover:opacity-60 transition-opacity relative"
    onClick={openCart}
    aria-label="Cart"
  >
                <FiShoppingBag size={19} />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#2d4a3e] text-[#fafafa] text-[9px] flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>}
              </button>

              <Link to="/account" className="p-1 hover:opacity-60 transition-opacity hidden sm:block" aria-label="Account">
                <FiUser size={19} />
              </Link>
            </div>
          </div>
        </div>

        {
    /* Mega menu */
  }
        <AnimatePresence>
          {megaOpen && <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="hidden lg:block bg-[#fafafa] border-t border-[#0a0a0a]/10 shadow-xl"
    onMouseEnter={() => setMegaOpen(true)}
    onMouseLeave={() => setMegaOpen(false)}
  >
              <div className="max-w-[1440px] mx-auto px-12 py-10">
                <div className="grid grid-cols-6 gap-6">
                  {megaMenuCategories.map((cat) => <Link
    key={cat.label}
    to={cat.href}
    className="group"
    onClick={() => setMegaOpen(false)}
  >
                      <div className="aspect-[3/4] overflow-hidden bg-[#f0ebe2] mb-3">
                        <img
    src={cat.image}
    alt={cat.label}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
                      </div>
                      <p className="text-xs tracking-widest uppercase text-[#0a0a0a] font-medium group-hover:text-[#2d4a3e] transition-colors flex items-center gap-1">
                        {cat.label}
                        <FiChevronRight size={11} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </p>
                    </Link>)}
                </div>
                <div className="mt-8 pt-6 border-t border-[#0a0a0a]/10 flex gap-8">
                  <Link to="/collections" className="text-xs tracking-widest uppercase text-[#8c8277] hover:text-[#0a0a0a] transition-colors link-underline">View All Collections</Link>
                  <Link to="/sale" className="text-xs tracking-widest uppercase text-[#2d4a3e] hover:opacity-70 transition-opacity link-underline">Sale — Up to 40% Off</Link>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </header>

      {
    /* Search Overlay */
  }
      <AnimatePresence>
        {searchOpen && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="fixed inset-0 z-[60] bg-[#fafafa]"
  >
            <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    transition={{ duration: 0.3, delay: 0.05 }}
    className="flex flex-col h-full"
  >
              <div className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-[#0a0a0a]/10">
                <span className="font-display tracking-[0.25em] text-sm text-[#0a0a0a]">ETERNAL</span>
                <button
    onClick={() => setSearchOpen(false)}
    className="p-2 hover:opacity-60 transition-opacity text-[#0a0a0a]"
    aria-label="Close search"
  >
                  <FiX size={22} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-12 -mt-20">
                <p className="text-xs tracking-widest uppercase text-[#8c8277] mb-8">What are you looking for?</p>
                <div className="relative w-full max-w-2xl">
                  <FiSearch size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8c8277]" />
                  <input
    ref={searchRef}
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search products, collections..."
    className="w-full pl-8 pr-4 py-4 bg-transparent border-b-2 border-[#0a0a0a] text-[#0a0a0a] text-xl placeholder:text-[#8c8277] focus:outline-none font-light"
    onKeyDown={(e) => {
      if (e.key === "Escape") setSearchOpen(false);
      if (e.key === "Enter" && searchQuery) {
        window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
      }
    }}
  />
                </div>
                <div className="mt-12 flex flex-wrap gap-3 justify-center">
                  {["New Arrivals", "Dresses", "Outerwear", "Knitwear", "Sale"].map((term) => <Link
    key={term}
    to={`/shop?q=${encodeURIComponent(term)}`}
    onClick={() => setSearchOpen(false)}
    className="px-5 py-2 border border-[#0a0a0a]/20 text-xs tracking-widest uppercase text-[#8c8277] hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-all"
  >
                      {term}
                    </Link>)}
                </div>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {
    /* Mobile drawer */
  }
      <AnimatePresence>
        {mobileOpen && <>
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] bg-[#0a0a0a]/50 backdrop-blur-sm lg:hidden"
    onClick={() => setMobileOpen(false)}
  />
            <motion.div
    initial={{ x: "-100%" }}
    animate={{ x: 0 }}
    exit={{ x: "-100%" }}
    transition={{ type: "tween", duration: 0.35, ease: [0.25, 0, 0, 1] }}
    className="fixed left-0 top-0 bottom-0 z-[70] w-[85vw] max-w-sm bg-[#fafafa] flex flex-col lg:hidden overflow-y-auto"
  >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#0a0a0a]/10">
                <Link to="/" className="font-display tracking-[0.25em] text-sm text-[#0a0a0a]">ETERNAL</Link>
                <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-1 hover:opacity-60 transition-opacity">
                  <FiX size={22} />
                </button>
              </div>

              <nav className="flex-1 px-6 py-8 flex flex-col gap-1">
                {mobileLinks.map((link, i) => <motion.div
    key={link.label}
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.08 + i * 0.04 }}
  >
                    <Link
    to={link.href}
    className="flex items-center justify-between py-3.5 border-b border-[#0a0a0a]/8 text-sm tracking-widest uppercase font-medium text-[#0a0a0a] hover:text-[#2d4a3e] transition-colors"
  >
                      {link.label}
                      <FiChevronRight size={14} className="text-[#8c8277]" />
                    </Link>
                  </motion.div>)}
              </nav>

              <div className="px-6 pb-8 flex gap-4">
                <button
    onClick={() => {
      setMobileOpen(false);
      setSearchOpen(true);
    }}
    className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#0a0a0a]/20 text-xs tracking-widest uppercase hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-all"
  >
                  <FiSearch size={14} /> Search
                </button>
                <button
    onClick={() => {
      setMobileOpen(false);
      openCart();
    }}
    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0a0a0a] text-[#fafafa] text-xs tracking-widest uppercase hover:bg-[#2d4a3e] transition-colors"
  >
                  <FiShoppingBag size={14} /> Bag {cartCount > 0 && `(${cartCount})`}
                </button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
}
export {
  Navbar as default
};
