import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { categoryApi } from "../../services/api";
import { useState, useEffect } from "react";
function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getAll();
        if (!active) return;
        const normalized = (res.data?.categories ?? res.data ?? []).map(c => ({
          ...c,
          image: c.imageUrl || c.image || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&auto=format",
          count: c.count || 12
        }));
        setCategories(normalized);
      } catch (err) {
        console.error("CategoriesPage: failed to fetch categories", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCats();
    return () => { active = false; };
  }, []);
  return <div className="min-h-screen" style={{ backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
      {
    /* Editorial header */
  }
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#8c8277" }}>Browse</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl" style={{ color: "#0a0a0a" }}>
              Shop by Category
            </h1>
          </div>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: "#8c8277" }}>
            From everyday essentials to statement pieces — explore our full range of categories.
          </p>
        </div>

        {
    /* Category grid */
  }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => <motion.div
    key={cat.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: i * 0.07 }}
  >
              <Link
    to={`/shop?category=${cat.slug}`}
    className="group relative block overflow-hidden"
    style={{ aspectRatio: "3/4" }}
  >
                {
    /* Image */
  }
                <img
    src={cat.image}
    alt={cat.name}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
  />

                {
    /* Dark overlay on hover */
  }
                <div className="absolute inset-0 transition-all duration-400 group-hover:bg-[#0a0a0a]/40" />

                {
    /* Product count badge */
  }
                <div
    className="absolute top-4 right-4 px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold"
    style={{ backgroundColor: "#fafafa", color: "#0a0a0a" }}
  >
                  {cat.count} pieces
                </div>

                {
    /* Category name — always visible */
  }
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div
    className="flex items-end justify-between"
    style={{ backgroundColor: "#fafafa", padding: "16px 20px" }}
  >
                    <div>
                      <p className="font-display text-2xl" style={{ color: "#0a0a0a" }}>{cat.name}</p>
                      <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "#8c8277" }}>{cat.count} products</p>
                    </div>
                    <div
    className="w-9 h-9 flex items-center justify-center transition-all duration-300 group-hover:bg-[#0a0a0a]"
    style={{ border: "1px solid #f0ebe2" }}
  >
                      <FiArrowRight
    size={16}
    className="transition-all duration-300 group-hover:text-[#fafafa] -translate-x-0.5 group-hover:translate-x-0"
    style={{ color: "#8c8277" }}
  />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>)}
        </div>

        {
    /* All Products CTA banner */
  }
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="mt-8"
  >
          <Link
    to="/shop"
    className="flex items-center justify-between px-8 py-8 group transition-colors"
    style={{ backgroundColor: "#0a0a0a" }}
  >
            <div>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#c9b99a" }}>Entire Collection</p>
              <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "#fafafa" }}>
                Shop All Products
              </h2>
            </div>
            <div
    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-[#2d4a3e]"
    style={{ border: "1px solid #c9b99a" }}
  >
              <FiArrowRight size={18} style={{ color: "#fafafa" }} />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>;
}
export {
  CategoriesPage as default
};
