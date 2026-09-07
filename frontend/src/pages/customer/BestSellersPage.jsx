import { Link } from "react-router-dom";
import { useMoney } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiHeart, FiStar } from "react-icons/fi";
import { productApi, normalizeProduct } from "../../services/api";
import { useState, useEffect } from "react";
function BestSellersPage() {
  const money = useMoney();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchBestSellers = async () => {
      try {
        const res = await productApi.getProducts({ limit: 100 });
        if (!active) return;
        const normalized = (res.data?.products ?? res.data ?? []).map(normalizeProduct);
        const filtered = normalized.filter((p) => p.isBestSeller);
        setBestSellers(filtered.length > 0 ? filtered : normalized.slice(0, 8));
      } catch (err) {
        console.error("BestSellersPage: failed to fetch best sellers", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBestSellers();
    return () => { active = false; };
  }, []);
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Header */
  }
      <div className="bg-[#f0ebe2] pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-[#8c8277] text-xs tracking-[0.3em] uppercase mb-4"
  >
            Community Favourites
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-7xl md:text-9xl text-[#0a0a0a] leading-none"
  >
            Best Sellers
          </motion.h1>
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-[#8c8277] mt-6 text-base max-w-lg leading-relaxed"
  >
            The pieces our community returns to, season after season. Enduring designs that speak for themselves.
          </motion.p>
        </div>
      </div>

      {
    /* Products */
  }
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-[#8c8277] text-sm mb-8">{bestSellers.length} pieces</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, i) => <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i % 4 * 0.08 }}
    className="group"
  >
              <div className="relative overflow-hidden bg-[#f0ebe2] aspect-[3/4] mb-3">
                <img
    src={product.images[0]}
    alt={product.name}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiHeart className="w-4 h-4 text-[#0a0a0a]" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0a0a0a]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
    to={`/product/${product.id}`}
    className="block w-full bg-[#fafafa] text-[#0a0a0a] text-xs tracking-[0.1em] uppercase text-center py-2 hover:bg-[#f0ebe2] transition-colors"
  >
                    Shop Now
                  </Link>
                </div>
              </div>
              <Link to={`/product/${product.id}`} className="block">
                <p className="text-[#8c8277] text-[10px] tracking-widest uppercase mb-1">{product.category}</p>
                <h3 className="text-[#0a0a0a] text-sm font-medium leading-snug mb-1 hover:text-[#2d4a3e] transition-colors">{product.name}</h3>
                <div className="flex items-center gap-1.5 mb-1">
                  <FiStar className="w-3 h-3 fill-[#c9b99a] text-[#c9b99a]" />
                  <span className="text-[#8c8277] text-xs">{product.rating} ({product.reviewCount})</span>
                </div>
                <p className="text-[#0a0a0a] text-sm">{money(product.price)}</p>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
export {
  BestSellersPage as default
};
