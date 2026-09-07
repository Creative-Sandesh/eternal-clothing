import { useState, useMemo, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { productApi, categoryApi, collectionApi } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const COLOR_HEX = {
  Black: "#0a0a0a",
  White: "#fafafa",
  Ivory: "#f5f0e8",
  Beige: "#f0ebe2",
  Camel: "#c19a6b",
  Tan: "#d2b48c",
  Brown: "#7b5c3a",
  Navy: "#1a2744",
  Blue: "#2563eb",
  Green: "#2d4a3e",
  Sage: "#87a878",
  Olive: "#6b7c45",
  Grey: "#8c8277",
  Gray: "#8c8277",
  Stone: "#8c8277",
  Red: "#b91c1c",
  Burgundy: "#6b1c2a",
  Cream: "#fffdd0",
  Pink: "#f9a8d4",
  Blush: "#fca5a5",
  Charcoal: "#374151"
};
function getHex(color) {
  for (const key of Object.keys(COLOR_HEX)) {
    if (color.toLowerCase().includes(key.toLowerCase())) return COLOR_HEX[key];
  }
  return "#cccccc";
}
function StarRating({ rating, count }) {
  return <div className="flex items-center gap-1 mt-1">
      <span className="text-xs text-eternal-stone">
        {"\u2605".repeat(Math.round(rating))}{"\u2606".repeat(5 - Math.round(rating))}
      </span>
      <span className="text-xs text-eternal-stone">({count})</span>
    </div>;
}
function FilterSection({
  title,
  open,
  onToggle,
  children
}) {
  return <div className="border-b border-eternal-beige py-4">
      <button
    onClick={onToggle}
    className="flex items-center justify-between w-full text-sm font-medium text-eternal-black mb-0"
  >
        {title}
        {open ? <FiChevronUp className="w-4 h-4 text-eternal-stone" /> : <FiChevronDown className="w-4 h-4 text-eternal-stone" />}
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="overflow-hidden"
  >
            <div className="pt-3">{children}</div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
function ShopPage() {
  const money = useMoney();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid3");
  const [activeFilters, setActiveFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [openFilterSections, setOpenFilterSections] = useState(["Category", "Collection"]);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Live API data ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [prodRes, colRes] = await Promise.all([
          productApi.getProducts({ limit: 100 }),
          collectionApi.getAll(),
        ]);

        if (cancelled) return;

        // Normalize products so existing filter/sort/render logic keeps working
        const normalised = (prodRes.data?.products ?? prodRes.data ?? []).map((p) => ({
          ...p,
          // Frontend shape compatibility
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.basePrice),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          isSale: Boolean(p.originalPrice && Number(p.originalPrice) > Number(p.basePrice)),
          image: Array.isArray(p.images) ? p.images[0] : p.images,
          images: Array.isArray(p.images) ? p.images : [p.images],
          category: p.category?.name ?? p.Category?.name ?? (typeof p.category === "string" ? p.category : ""),
          collection: p.collection?.name ?? p.Collection?.name ?? (typeof p.collection === "string" ? p.collection : ""),
          material: p.material,
          // Derive unique colors & sizes from variants
          colors: Array.isArray(p.ProductVariants)
            ? [...new Map(p.ProductVariants.map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values()]
            : p.colors ?? [],
          sizes: Array.isArray(p.ProductVariants)
            ? [...new Set(p.ProductVariants.map((v) => v.size))]
            : p.sizes ?? [],
          inStock: Array.isArray(p.ProductVariants)
            ? p.ProductVariants.some((v) => v.stockQuantity > 0)
            : true,
          rating: Number(p.avgRating ?? p.rating ?? 0),
          reviewCount: Number(p.reviewCount ?? 0),
          isNew: false,
        }));

        setProducts(normalised);
        setCollections(colRes.data?.collections ?? colRes.data ?? []);
      } catch (err) {
        console.error("ShopPage: failed to load products", err);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const { addItem } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  useEffect(() => {
    const cat = searchParams.get("category");
    const col = searchParams.get("collection");
    const initial = {};
    if (cat) initial["Category"] = [cat];
    if (col) initial["Collection"] = [col];
    if (Object.keys(initial).length > 0) setActiveFilters(initial);
  }, [searchParams]);
  const toggleFilter = (section, value) => {
    setActiveFilters((prev) => {
      const current = prev[section] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length === 0) {
        const { [section]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [section]: next };
    });
  };
  const toggleFilterSection = (section) => {
    setOpenFilterSections(
      (prev) => prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };
  const uniqueColors = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    products.forEach((p) => {
      if (Array.isArray(p.colors)) p.colors.forEach((c) => set.add(c.name));
    });
    return Array.from(set);
  }, []);
  const uniqueCategories = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, []);
  const uniqueCollections = useMemo(() => {
    if (collections && Array.isArray(collections)) return collections.map((c) => c.name);
    const set = /* @__PURE__ */ new Set();
    products.forEach((p) => {
      if (p.collection) set.add(p.collection);
    });
    return Array.from(set);
  }, []);
  const filteredProducts = useMemo(() => {
    let result = [...products];
    const catFilter = activeFilters["Category"];
    if (catFilter && catFilter.length > 0) {
      result = result.filter((p) => catFilter.includes(p.category));
    }
    const colFilter = activeFilters["Collection"];
    if (colFilter && colFilter.length > 0) {
      result = result.filter((p) => colFilter.includes(p.collection));
    }
    const sizeFilter = activeFilters["Size"];
    if (sizeFilter && sizeFilter.length > 0) {
      result = result.filter((p) => {
        const pSizes = Array.isArray(p.sizes) ? p.sizes : [];
        return sizeFilter.some((s) => pSizes.includes(s));
      });
    }
    const colorFilter = activeFilters["Color"];
    if (colorFilter && colorFilter.length > 0) {
      result = result.filter((p) => {
        const pColorNames = Array.isArray(p.colors) ? p.colors.map((c) => c.name) : [];
        return colorFilter.some((c) => pColorNames.includes(c));
      });
    }
    result = result.filter((p) => {
      const price = (p.isSale && p.originalPrice ? p.originalPrice : p.price) ?? 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (inStockOnly) {
      result = result.filter((p) => p.inStock !== false);
    }
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        break;
    }
    return result;
  }, [activeFilters, priceRange, inStockOnly, sortBy]);
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const gridClass = {
    grid2: "grid grid-cols-2 gap-4 md:gap-6",
    grid3: "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6",
    grid4: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4",
    list: "flex flex-col gap-4"
  };
  const FiltersContent = () => <div className="space-y-0">
      <FilterSection
    title="Category"
    open={openFilterSections.includes("Category")}
    onToggle={() => toggleFilterSection("Category")}
  >
        <div className="space-y-2">
          {uniqueCategories.map((cat) => <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
    type="checkbox"
    checked={(activeFilters["Category"] || []).includes(cat)}
    onChange={() => toggleFilter("Category", cat)}
    className="w-4 h-4 accent-eternal-black"
  />
              <span className="text-sm text-eternal-black group-hover:text-eternal-green transition-colors">{cat}</span>
            </label>)}
        </div>
      </FilterSection>

      <FilterSection
    title="Collection"
    open={openFilterSections.includes("Collection")}
    onToggle={() => toggleFilterSection("Collection")}
  >
        <div className="space-y-2">
          {uniqueCollections.map((col) => <label key={col} className="flex items-center gap-2 cursor-pointer group">
              <input
    type="checkbox"
    checked={(activeFilters["Collection"] || []).includes(col)}
    onChange={() => toggleFilter("Collection", col)}
    className="w-4 h-4 accent-eternal-black"
  />
              <span className="text-sm text-eternal-black group-hover:text-eternal-green transition-colors">{col}</span>
            </label>)}
        </div>
      </FilterSection>

      <FilterSection
    title="Price Range"
    open={openFilterSections.includes("Price Range")}
    onToggle={() => toggleFilterSection("Price Range")}
  >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-eternal-stone">
            <span>{money(priceRange[0])}</span>
            <span>{money(priceRange[1])}</span>
          </div>
          <input
    type="range"
    min={0}
    max={600}
    step={10}
    value={priceRange[1]}
    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
    className="w-full accent-eternal-black"
  />
        </div>
      </FilterSection>

      <FilterSection
    title="Size"
    open={openFilterSections.includes("Size")}
    onToggle={() => toggleFilterSection("Size")}
  >
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
    const active = (activeFilters["Size"] || []).includes(size);
    return <button
      key={size}
      onClick={() => toggleFilter("Size", size)}
      className={`px-2.5 py-1 text-xs border transition-colors ${active ? "bg-eternal-black text-eternal-white border-eternal-black" : "bg-transparent text-eternal-black border-eternal-beige hover:border-eternal-black"}`}
    >
                {size}
              </button>;
  })}
        </div>
      </FilterSection>

      <FilterSection
    title="Color"
    open={openFilterSections.includes("Color")}
    onToggle={() => toggleFilterSection("Color")}
  >
        <div className="space-y-2">
          {uniqueColors.map((color) => <label key={color} className="flex items-center gap-2 cursor-pointer group">
              <input
    type="checkbox"
    checked={(activeFilters["Color"] || []).includes(color)}
    onChange={() => toggleFilter("Color", color)}
    className="w-4 h-4 accent-eternal-black"
  />
              <span
    className="w-4 h-4 rounded-full border border-eternal-beige inline-block"
    style={{ backgroundColor: getHex(color) }}
  />
              <span className="text-sm text-eternal-black group-hover:text-eternal-green transition-colors">{color}</span>
            </label>)}
        </div>
      </FilterSection>

      <FilterSection
    title="Availability"
    open={openFilterSections.includes("Availability")}
    onToggle={() => toggleFilterSection("Availability")}
  >
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-eternal-black">In Stock Only</span>
          <button
    onClick={() => setInStockOnly((v) => !v)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inStockOnly ? "bg-eternal-green" : "bg-eternal-beige"}`}
  >
            <span
    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${inStockOnly ? "translate-x-4" : "translate-x-0.5"}`}
  />
          </button>
        </label>
      </FilterSection>

      <div className="pt-4">
        <label className="block text-sm font-medium text-eternal-black mb-2">Sort By</label>
        <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="w-full border border-eternal-beige text-sm text-eternal-black px-3 py-2 bg-eternal-white focus:outline-none focus:border-eternal-black"
  >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="rating">Best Rated</option>
        </select>
      </div>
    </div>;
  return <div className="min-h-screen bg-eternal-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        {
    /* Breadcrumb */
  }
        <nav className="flex items-center gap-2 text-xs text-eternal-stone mb-6">
          <Link to="/" className="hover:text-eternal-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-eternal-black">Shop</span>
        </nav>

        {
    /* Page Title */
  }
        <h1 className="font-display text-4xl md:text-5xl text-eternal-black mb-2">Shop</h1>
        <p className="text-eternal-stone text-sm mb-8">Timeless pieces crafted for the discerning.</p>

        {
    /* Top Bar */
  }
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-eternal-stone">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              {
    /* View mode buttons — desktop */
  }
              <div className="hidden md:flex items-center gap-1 border border-eternal-beige p-0.5">
                {["grid3", "grid4", "list"].map((mode) => <button
    key={mode}
    onClick={() => setViewMode(mode)}
    className={`p-1.5 transition-colors ${viewMode === mode ? "bg-eternal-black text-eternal-white" : "text-eternal-stone hover:text-eternal-black"}`}
    title={mode}
  >
                    {mode === "list" ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
                  </button>)}
              </div>
              {
    /* Mobile Filters button */
  }
              <button
    onClick={() => setMobileFiltersOpen(true)}
    className="md:hidden flex items-center gap-2 border border-eternal-beige px-3 py-2 text-sm text-eternal-black hover:border-eternal-black transition-colors"
  >
                <FiFilter className="w-4 h-4" />
                Filters &amp; Sort
              </button>
            </div>
          </div>

          {
    /* Active filter chips */
  }
          {hasActiveFilters && <div className="flex flex-wrap items-center gap-2">
              {Object.entries(activeFilters).map(
    ([section, values]) => values.map((val) => <button
      key={`${section}-${val}`}
      onClick={() => toggleFilter(section, val)}
      className="flex items-center gap-1 text-xs bg-eternal-beige text-eternal-black px-2.5 py-1 hover:bg-eternal-stone hover:text-eternal-white transition-colors"
    >
                    {section}: {val}
                    <FiX className="w-3 h-3" />
                  </button>)
  )}
              <button
    onClick={() => setActiveFilters({})}
    className="text-xs text-eternal-stone underline hover:text-eternal-black transition-colors"
  >
                Clear All
              </button>
            </div>}
        </div>

        <div className="flex gap-8">
          {
    /* Sidebar — desktop */
  }
          <aside className="hidden md:block w-64 shrink-0">
            <h2 className="text-sm font-medium text-eternal-black uppercase tracking-wider mb-4">Filters</h2>
            <FiltersContent />
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {apiLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-eternal-beige mb-3" />
                    <div className="h-3 bg-eternal-beige rounded w-3/4 mb-2" />
                    <div className="h-3 bg-eternal-beige rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-2xl text-eternal-black mb-2">No products found</p>
                <p className="text-sm text-eternal-stone mb-6">Try adjusting your filters to see more results.</p>
                <button
    onClick={() => {
      setActiveFilters({});
      setPriceRange([0, 600]);
      setInStockOnly(false);
    }}
    className="text-sm border border-eternal-black px-6 py-2 hover:bg-eternal-black hover:text-eternal-white transition-colors"
  >
                  Clear All Filters
                </button>
              </div> : <motion.div
    key={viewMode}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
    className={gridClass[viewMode]}
  >
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product) => {
    const isWished = isWishlisted(product.id);
    const isSale = !!product.isSale;
    const displayPrice = product.price ?? 0;
    const images = Array.isArray(product.images) ? product.images : [];
    if (viewMode === "list") {
      return <motion.div
        key={product.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex gap-4 border border-eternal-beige hover:border-eternal-stone transition-colors bg-eternal-white group"
      >
                          <Link to={`/product/${product.id}`} className="shrink-0 w-40 md:w-56">
                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-eternal-beige">
                              {images[0] && <img
        src={images[0]}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
      />}
                              {images[1] && <img
        src={images[1]}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />}
                            </div>
                          </Link>
                          <div className="flex flex-col justify-between py-4 pr-4 flex-1 min-w-0">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <Link to={`/product/${product.id}`} className="font-display text-eternal-black hover:text-eternal-green transition-colors text-lg leading-tight">
                                  {product.name}
                                </Link>
                                <button
        onClick={() => toggleWishlist({ productId: product.id, name: product.name, price: product.price, image: product.images?.[0] ?? "" })}
        className="shrink-0 mt-0.5"
        aria-label="Toggle wishlist"
      >
                                  <FiHeart
        className={`w-5 h-5 transition-colors ${isWished ? "fill-eternal-black text-eternal-black" : "text-eternal-stone hover:text-eternal-black"}`}
      />
                                </button>
                              </div>
                              {product.category && <p className="text-xs text-eternal-stone mb-2">{product.category}</p>}
                              {product.description && <p className="text-sm text-eternal-stone line-clamp-2 mb-3">{product.description}</p>}
                              {product.rating != null && <StarRating rating={product.rating} count={product.reviewCount ?? 0} />}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                {isSale && <span className="text-sm text-eternal-stone line-through">{money(product.price)}</span>}
                                <span className={`text-sm font-medium ${isSale ? "text-red-600" : "text-eternal-black"}`}>
                                  {money(displayPrice)}
                                </span>
                              </div>
                              <button
        onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, size: product.sizes?.[0] ?? "M", color: product.colors?.[0]?.name ?? "Default", image: product.images?.[0] ?? "", quantity: 1 })}
        className="text-xs border border-eternal-black px-4 py-2 hover:bg-eternal-black hover:text-eternal-white transition-colors"
      >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </motion.div>;
    }
    return <motion.div
      key={product.id}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group"
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
                        <div className="relative aspect-[3/4] overflow-hidden bg-eternal-beige">
                          {
      /* Images */
    }
                          <Link to={`/product/${product.id}`} className="block w-full h-full">
                            {images[0] && <img
      src={images[0]}
      alt={product.name}
      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      style={{ opacity: hoveredProduct === product.id && images[1] ? 0 : 1 }}
    />}
                            {images[1] && <img
      src={images[1]}
      alt={product.name}
      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      style={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
    />}
                          </Link>

                          {
      /* Badges */
    }
                          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                            {product.isNew && <span className="text-xs bg-eternal-black text-eternal-white px-2 py-0.5 tracking-wide">NEW</span>}
                            {isSale && <span className="text-xs bg-red-600 text-white px-2 py-0.5 tracking-wide">SALE</span>}
                          </div>

                          {
      /* Wishlist */
    }
                          <button
      onClick={() => toggleWishlist({ productId: product.id, name: product.name, price: product.price, image: product.images?.[0] ?? "" })}
      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-eternal-white/80 backdrop-blur-sm hover:bg-eternal-white transition-colors"
      aria-label="Toggle wishlist"
    >
                            <FiHeart
      className={`w-4 h-4 transition-colors ${isWished ? "fill-eternal-black text-eternal-black" : "text-eternal-stone hover:text-eternal-black"}`}
    />
                          </button>

                          {
      /* Quick add */
    }
                          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button
      onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, size: product.sizes?.[0] ?? "M", color: product.colors?.[0]?.name ?? "Default", image: product.images?.[0] ?? "", quantity: 1 })}
      className="w-full bg-eternal-black text-eternal-white text-xs py-3 hover:bg-eternal-green transition-colors tracking-wider uppercase"
    >
                              Add to Cart
                            </button>
                          </div>
                        </div>

                        {
      /* Product info */
    }
                        <div className="mt-3">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-sm font-medium font-display text-eternal-black hover:text-eternal-green transition-colors leading-snug">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {isSale && <span className="text-xs text-eternal-stone line-through">{money(product.price)}</span>}
                            <span className={`text-sm ${isSale ? "text-red-600 font-medium" : "text-eternal-black"}`}>
                              {money(displayPrice)}
                            </span>
                          </div>
                          {product.rating != null && <StarRating rating={product.rating} count={product.reviewCount ?? 0} />}
                        </div>
                      </motion.div>;
  })}
                </AnimatePresence>
              </motion.div>}

            {
    /* Pagination */
  }
            {totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-12">
                <button
    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 text-sm border border-eternal-beige text-eternal-black hover:border-eternal-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => <button
    key={page}
    onClick={() => setCurrentPage(page)}
    className={`w-9 h-9 text-sm border transition-colors ${page === currentPage ? "bg-eternal-black text-eternal-white border-eternal-black" : "border-eternal-beige text-eternal-black hover:border-eternal-black"}`}
  >
                    {page}
                  </button>)}
                <button
    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 text-sm border border-eternal-beige text-eternal-black hover:border-eternal-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
                  Next
                </button>
              </div>}
          </main>
        </div>
      </div>

      {
    /* Mobile Filter Drawer */
  }
      <AnimatePresence>
        {mobileFiltersOpen && <>
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-eternal-black/40 z-40 md:hidden"
    onClick={() => setMobileFiltersOpen(false)}
  />
            <motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ type: "spring", damping: 30, stiffness: 300 }}
    className="fixed bottom-0 left-0 right-0 z-50 bg-eternal-white rounded-t-2xl max-h-[85vh] flex flex-col md:hidden"
  >
              <div className="flex items-center justify-between px-4 py-4 border-b border-eternal-beige">
                <h2 className="font-display text-lg text-eternal-black">Filters &amp; Sort</h2>
                <button
    onClick={() => setMobileFiltersOpen(false)}
    className="w-8 h-8 flex items-center justify-center text-eternal-stone hover:text-eternal-black transition-colors"
  >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-4 pb-6">
                <FiltersContent />
              </div>
              <div className="px-4 py-4 border-t border-eternal-beige">
                <button
    onClick={() => setMobileFiltersOpen(false)}
    className="w-full bg-eternal-black text-eternal-white py-3 text-sm tracking-wider hover:bg-eternal-green transition-colors"
  >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}
export {
  ShopPage as default
};
