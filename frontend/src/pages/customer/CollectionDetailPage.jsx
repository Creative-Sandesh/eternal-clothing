import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { products, collections } from "../../data/products";
function CollectionDetailPage() {
  const { slug } = useParams();
  const [sort, setSort] = useState("featured");
  const collection = collections.find((c) => c.slug === slug);
  const collectionName = collection?.name ?? slug;
  let filtered = products.filter(
    (p) => p.collection.toLowerCase().replace(/\s+/g, "-") === slug || p.collection === collectionName
  );
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "newest") filtered = [...filtered].sort((a) => a.isNew ? -1 : 1);
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Hero */
  }
      <div className="relative h-[55vh] flex items-end overflow-hidden bg-[#0a0a0a]">
        {collection && <img
    src={collection.image}
    alt={collection.name}
    className="absolute inset-0 w-full h-full object-cover opacity-50"
  />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 to-transparent" />
        <div className="relative z-10 px-8 pb-14 max-w-6xl mx-auto w-full">
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-[#c9b99a] text-xs tracking-[0.25em] uppercase mb-3"
  >
            Collection
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-6xl md:text-7xl text-[#fafafa] leading-none mb-4"
  >
            {collection?.name ?? slug}
          </motion.h1>
          {collection?.description && <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.15 }}
    className="text-[#fafafa]/70 text-base max-w-lg leading-relaxed"
  >
              {collection.description}
            </motion.p>}
        </div>
      </div>

      {
    /* Filter Bar */
  }
      <div className="border-b border-[#0a0a0a]/10 bg-[#fafafa] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <p className="text-[#8c8277] text-sm">{filtered.length} pieces</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#8c8277] tracking-wider uppercase">Sort</label>
            <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="text-sm bg-transparent border border-[#0a0a0a]/20 rounded px-3 py-1 text-[#0a0a0a] focus:outline-none focus:border-[#2d4a3e]"
  >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {
    /* Products */
  }
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? <div className="text-center py-24">
            <p className="font-display text-3xl text-[#0a0a0a] mb-3">No pieces found</p>
            <p className="text-[#8c8277]">This collection is coming soon.</p>
          </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i % 4 * 0.07 }}
    className="group"
  >
                <div className="relative overflow-hidden bg-[#f0ebe2] aspect-[3/4] mb-3">
                  <img
    src={product.images[0]}
    alt={product.name}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
  />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiHeart className="w-4 h-4 text-[#0a0a0a]" />
                  </button>
                  {product.isNew && <span className="absolute top-3 left-3 bg-[#2d4a3e] text-white text-[10px] tracking-widest uppercase px-2 py-0.5">New</span>}
                </div>
                <Link to={`/products/${product.id}`}>
                  <p className="text-[#8c8277] text-[10px] tracking-widest uppercase mb-1">{product.category}</p>
                  <h3 className="text-[#0a0a0a] text-sm font-medium leading-snug hover:text-[#2d4a3e] transition-colors">{product.name}</h3>
                  <p className="text-[#0a0a0a] text-sm mt-1">£{product.price}</p>
                </Link>
              </motion.div>)}
          </div>}
      </div>
    </div>;
}
export {
  CollectionDetailPage as default
};
