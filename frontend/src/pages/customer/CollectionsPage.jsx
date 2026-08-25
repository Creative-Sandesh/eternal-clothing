import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collectionApi } from "../../services/api";
import { useState, useEffect } from "react";
function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCols = async () => {
      try {
        const res = await collectionApi.getAll();
        if (!active) return;
        const normalized = (res.data?.collections ?? res.data ?? []).map(c => ({
          ...c,
          image: c.imageUrl || c.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop&auto=format",
          count: c.count || 18
        }));
        setCollections(normalized);
      } catch (err) {
        console.error("CollectionsPage: failed to fetch collections", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCols();
    return () => { active = false; };
  }, []);
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Hero */
  }
      <div className="relative h-[60vh] flex items-end overflow-hidden bg-[#0a0a0a]">
        <img
    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop&auto=format"
    alt="Collections"
    className="absolute inset-0 w-full h-full object-cover opacity-50"
  />
        <div className="relative z-10 px-8 pb-16 max-w-6xl mx-auto w-full">
          <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-[#c9b99a] text-sm tracking-[0.25em] uppercase mb-4"
  >
            Eternal — Curated
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.1 }}
    className="font-display text-6xl md:text-8xl text-[#fafafa] leading-none"
  >
            Our Collections
          </motion.h1>
        </div>
      </div>

      {
    /* Collections Grid */
  }
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col, i) => <motion.div
    key={col.id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: i * 0.1 }}
    className="group relative overflow-hidden aspect-[4/3] bg-[#0a0a0a]"
  >
              <img
    src={col.image}
    alt={col.name}
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
  />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-[#c9b99a] text-xs tracking-[0.2em] uppercase mb-2">{col.count} pieces</p>
                <h2 className="font-display text-4xl text-[#fafafa] mb-2">{col.name}</h2>
                <p className="text-[#fafafa]/70 text-sm mb-5 max-w-sm leading-relaxed">{col.description}</p>
                <Link
    to={`/collections/${col.slug}`}
    className="inline-flex items-center gap-2 text-[#fafafa] text-xs tracking-[0.15em] uppercase border-b border-[#fafafa]/40 pb-0.5 hover:border-[#c9b99a] hover:text-[#c9b99a] transition-colors"
  >
                  Explore Collection
                </Link>
              </div>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
export {
  CollectionsPage as default
};
