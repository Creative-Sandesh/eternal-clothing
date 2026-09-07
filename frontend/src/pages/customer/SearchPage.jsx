import { useEffect, useRef, useState } from "react";
import { useMoney } from "../../context/SettingsContext";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiHeart } from "react-icons/fi";
import { productApi, normalizeProduct } from "../../services/api";
function SearchPage() {
  const money = useMoney();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef(null);
  const query = searchParams.get("q") ?? "";
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    const search = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({ search: query, limit: 50 });
        if (!active) return;
        const normalized = (res.data?.products ?? res.data ?? []).map(normalizeProduct);
        setResults(normalized);
      } catch (err) {
        console.error("SearchPage: failed to search", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    search();
    return () => { active = false; };
  }, [query]);
  function handleSubmit(e) {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  }
  function clearSearch() {
    setInputValue("");
    setSearchParams({});
    inputRef.current?.focus();
  }
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Search Bar Section */
  }
      <div className="bg-[#0a0a0a] pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-6 text-center">Search</p>
          <form onSubmit={handleSubmit} className="relative">
            <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8277]" />
            <input
    ref={inputRef}
    type="text"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    placeholder="Search pieces, categories, collections..."
    className="w-full bg-transparent border-b border-[#fafafa]/20 focus:border-[#c9b99a] outline-none text-[#fafafa] text-xl pl-8 pr-10 pb-3 placeholder-[#8c8277] transition-colors"
  />
            {inputValue && <button
    type="button"
    onClick={clearSearch}
    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8c8277] hover:text-[#fafafa] transition-colors"
  >
                <FiX className="w-5 h-5" />
              </button>}
          </form>
        </div>
      </div>

      {
    /* Results */
  }
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {query.trim() === "" ? <motion.div
    key="empty"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-20"
  >
              <FiSearch className="w-12 h-12 text-[#c9b99a] mx-auto mb-4" />
              <p className="font-display text-3xl text-[#0a0a0a] mb-2">Start searching</p>
              <p className="text-[#8c8277]">Discover pieces by name, category, or tag.</p>
            </motion.div> : results.length === 0 ? <motion.div
    key="no-results"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-20"
  >
              <p className="font-display text-4xl text-[#0a0a0a] mb-3">No results</p>
              <p className="text-[#8c8277] text-base">
                We couldn't find anything for <span className="text-[#0a0a0a]">"{query}"</span>
              </p>
              <p className="text-[#8c8277] text-sm mt-2">Try different keywords or browse our collections.</p>
              <Link
    to="/collections"
    className="inline-block mt-6 text-xs tracking-[0.15em] uppercase border-b border-[#2d4a3e] text-[#2d4a3e] pb-0.5"
  >
                Browse Collections
              </Link>
            </motion.div> : <motion.div
    key="results"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
              <p className="text-[#8c8277] text-sm mb-8">
                <span className="text-[#0a0a0a] font-medium">{results.length}</span> results for{" "}
                <span className="text-[#0a0a0a]">"{query}"</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((product, i) => <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
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
                      {product.isNew && <span className="absolute top-3 left-3 bg-[#2d4a3e] text-white text-[10px] tracking-widest uppercase px-2 py-0.5">New</span>}
                      {product.isSale && <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">Sale</span>}
                    </div>
                    <Link to={`/product/${product.id}`} className="block">
                      <p className="text-[#8c8277] text-[10px] tracking-widest uppercase mb-1">{product.category}</p>
                      <h3 className="text-[#0a0a0a] text-sm font-medium leading-snug mb-1 hover:text-[#2d4a3e] transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${product.isSale ? "text-red-600" : "text-[#0a0a0a]"}`}>{money(product.price)}</p>
                        {product.originalPrice && <p className="text-[#8c8277] text-sm line-through">{money(product.originalPrice)}</p>}
                      </div>
                    </Link>
                  </motion.div>)}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
export {
  SearchPage as default
};
