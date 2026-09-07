import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiSearch, FiGrid, FiList, FiEdit2, FiTrash2, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { productApi } from "../../services/api";
const categories = ["All", "Tops", "Bottoms", "Outerwear", "Knitwear", "Footwear", "Accessories"];
const collections = ["All", "Essentials", "Heritage", "Archive", "Limited"];
const statuses = ["All", "In Stock", "Low Stock", "Out of Stock"];
const stockBadge = (inStock, idx) => {
  const stock = inStock ? idx % 3 === 0 ? 8 : 24 + idx * 3 : 0;
  if (stock === 0) return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Out of Stock</span>;
  if (stock < 10) return <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Low ({stock})</span>;
  return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">In Stock ({stock})</span>;
};
function ProductsListPage() {
  const money = useMoney();
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const perPage = 8;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      try {
        const res = await productApi.getProducts({ limit: 100 });
        if (!active) return;
        setProducts(res.data?.products ?? []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load products", err);
        setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteProduct = async (id) => {
    try {
      await productApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === paged.length ? [] : paged.map((p) => p.id));
  return <div className="space-y-5">
      {
    /* Top bar */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} products total</p>
        </div>
        <Link
    to="/admin/products/new"
    className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a3e] transition-colors"
  >
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {
    /* Filters */
  }
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
    type="text"
    placeholder="Search products, SKU..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
          </div>
          <select
    value={category}
    onChange={(e) => {
      setCategory(e.target.value);
      setPage(1);
    }}
    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
    onClick={() => setView("table")}
    className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
  >
              <FiList size={16} />
            </button>
            <button
    onClick={() => setView("grid")}
    className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
  >
              <FiGrid size={16} />
            </button>
          </div>
        </div>

        {
    /* Bulk actions */
  }
        {selected.length > 0 && <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">{selected.length} selected</span>
            <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Update Status</button>
            <button className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50">Delete Selected</button>
          </div>}
      </div>

      {
    /* Table view */
  }
      {view === "table" && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
    type="checkbox"
    checked={selected.length === paged.length && paged.length > 0}
    onChange={toggleAll}
    className="rounded border-gray-300 text-[#2d4a3e] focus:ring-[#2d4a3e]"
  />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((product, i) => <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
    type="checkbox"
    checked={selected.includes(product.id)}
    onChange={() => toggleSelect(product.id)}
    className="rounded border-gray-300 text-[#2d4a3e] focus:ring-[#2d4a3e]"
  />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
    src={product.images[0]}
    alt={product.name}
    className="w-10 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
  />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {product.isNew && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">New</span>}
                            {product.isBestSeller && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">Best Seller</span>}
                            {product.isSale && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">Sale</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{product.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{money(product.price)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{stockBadge(product.inStock, i)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <FiStar size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm text-gray-700">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
    className="p-1.5 text-gray-400 hover:text-[#2d4a3e] hover:bg-green-50 rounded-lg transition-colors"
    title="Edit"
  >
                          <FiEdit2 size={14} />
                        </button>
                        <button
    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    title="Delete"
  >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>

          {
    /* Pagination */
  }
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
    onClick={() => setPage((p) => Math.max(1, p - 1))}
    disabled={page === 1}
    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
  >
                <FiChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => <button
    key={p}
    onClick={() => setPage(p)}
    className={`w-8 h-8 text-sm rounded-lg border transition-colors ${p === page ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
  >
                  {p}
                </button>)}
              <button
    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
    disabled={page === totalPages}
    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
  >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>}

      {
    /* Grid view */
  }
      {view === "grid" && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
  >
          {paged.map((product, i) => <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group relative">
              <div className="relative aspect-[3/4] bg-gray-100">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                {
    /* Overlay actions */
  }
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-[#2d4a3e] hover:text-white transition-colors"
  >
                    <FiEdit2 size={14} />
                  </button>
                  <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-gray-900">{money(product.price)}</span>
                  {stockBadge(product.inStock, i)}
                </div>
              </div>
            </div>)}
        </motion.div>}
    </div>;
}
export {
  ProductsListPage as default
};
