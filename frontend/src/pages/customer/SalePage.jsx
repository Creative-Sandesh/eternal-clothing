import { Link } from "react-router-dom";
import { useMoney } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { productApi, normalizeProduct } from "../../services/api";
import { useState, useEffect } from "react";
function SalePage() {
  const money = useMoney();
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSales = async () => {
      try {
        const res = await productApi.getProducts({ limit: 100 });
        if (!active) return;
        const normalized = (res.data?.products ?? res.data ?? [])
          .map(normalizeProduct)
          .filter((p) => p.isSale);
        setSaleProducts(normalized);
      } catch (err) {
        console.error("SalePage: failed to fetch sale items", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSales();
    return () => { active = false; };
  }, []);
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Banner */
  }
      <div className="bg-[#0a0a0a] pt-24 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => <div
    key={i}
    className="absolute text-[200px] font-display text-[#c9b99a] select-none whitespace-nowrap"
    style={{ top: `${i * 60 - 60}px`, left: `${i % 2 * -100 - 50}px`, transform: "rotate(-5deg)" }}
  >
              SALE
            </div>)}
        </div>
        <div className="relative z-10">
          <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
  >
            <p className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-5">Limited Time</p>
            <h1 className="font-display text-7xl md:text-[10rem] text-[#fafafa] leading-none mb-4">
              Up to 30% Off
            </h1>
            <p className="text-[#8c8277] text-base max-w-md mx-auto leading-relaxed">
              Selected pieces from the archive. Enduring quality at exceptional value.
            </p>
          </motion.div>
        </div>
      </div>

      {
    /* Products */
  }
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-[#8c8277] text-sm mb-8">{saleProducts.length} pieces on sale</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {saleProducts.map((product, i) => {
    const savings = product.originalPrice ? Math.round((product.originalPrice - product.price) / product.originalPrice * 100) : 0;
    return <motion.div
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
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-red-600 text-white text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 font-medium">
                      Sale
                    </span>
                    {savings > 0 && <span className="bg-[#0a0a0a] text-[#c9b99a] text-[10px] tracking-wide px-2.5 py-1">
                        -{savings}%
                      </span>}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <p className="text-red-600 text-sm font-medium">{money(product.price)}</p>
                    {product.originalPrice && <p className="text-[#8c8277] text-sm line-through">{money(product.originalPrice)}</p>}
                  </div>
                </Link>
              </motion.div>;
  })}
        </div>
      </div>
    </div>;
}
export {
  SalePage as default
};
