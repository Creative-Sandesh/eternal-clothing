import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { products } from "../../data/products";
const newProducts = products.filter((p) => p.isNew);
function NewArrivalsPage() {
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Header */
  }
      <div className="bg-[#0a0a0a] pt-28 pb-16 px-6 text-center">
        <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4"
  >
          Just Arrived
        </motion.p>
        <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-6xl md:text-8xl text-[#fafafa] leading-none mb-6"
  >
          New Arrivals
        </motion.h1>
        <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-[#8c8277] text-base max-w-md mx-auto leading-relaxed"
  >
          The latest additions to the Eternal wardrobe. Refined essentials and considered statements, season after season.
        </motion.p>
      </div>

      {
    /* Products Grid */
  }
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-[#8c8277] text-sm mb-8">{newProducts.length} new pieces</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {newProducts.map((product, i) => <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
    className="group"
  >
              <div className="relative overflow-hidden bg-[#f0ebe2] aspect-[3/4] mb-4">
                <img
    src={product.images[0]}
    alt={product.name}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="bg-[#2d4a3e] text-white text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 font-medium">
                    New
                  </span>
                </div>
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <FiHeart className="w-4 h-4 text-[#0a0a0a]" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
    to={`/products/${product.id}`}
    className="block w-full bg-[#fafafa] text-[#0a0a0a] text-xs tracking-[0.15em] uppercase text-center py-2.5 hover:bg-[#f0ebe2] transition-colors"
  >
                    Quick View
                  </Link>
                </div>
              </div>
              <Link to={`/products/${product.id}`} className="block">
                <p className="text-[#8c8277] text-[10px] tracking-widest uppercase mb-1">{product.category}</p>
                <h3 className="text-[#0a0a0a] text-sm font-medium leading-snug mb-1 hover:text-[#2d4a3e] transition-colors">{product.name}</h3>
                <p className="text-[#0a0a0a] text-sm">£{product.price}</p>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
export {
  NewArrivalsPage as default
};
