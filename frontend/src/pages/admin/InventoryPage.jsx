import { useState } from "react";
import { motion } from "framer-motion";
import { FiPackage, FiAlertTriangle, FiXCircle, FiCheckCircle, FiSearch } from "react-icons/fi";
const inventoryData = [
  { id: "1", name: "Oversized Cotton Poplin Shirt", sku: "ET-001-WHT", category: "Tops", stock: 42, maxStock: 100, status: "in_stock", lastUpdated: "2024-11-10" },
  { id: "2", name: "Relaxed Wool Trouser", sku: "ET-002-CML", category: "Bottoms", stock: 18, maxStock: 60, status: "in_stock", lastUpdated: "2024-11-12" },
  { id: "3", name: "Heavyweight Fleece Hoodie", sku: "ET-003-VBK", category: "Tops", stock: 7, maxStock: 80, status: "low_stock", lastUpdated: "2024-11-13" },
  { id: "4", name: "Merino Crewneck Knit", sku: "ET-004-STN", category: "Knitwear", stock: 3, maxStock: 50, status: "low_stock", lastUpdated: "2024-11-14" },
  { id: "5", name: "Unstructured Linen Blazer", sku: "ET-005-SND", category: "Outerwear", stock: 29, maxStock: 40, status: "in_stock", lastUpdated: "2024-11-08" },
  { id: "6", name: "Slim Straight Selvedge Denim", sku: "ET-006-IND", category: "Bottoms", stock: 0, maxStock: 60, status: "out_of_stock", lastUpdated: "2024-11-09" },
  { id: "7", name: "Washed Canvas Overshirt", sku: "ET-007-OLV", category: "Tops", stock: 54, maxStock: 70, status: "in_stock", lastUpdated: "2024-11-11" },
  { id: "8", name: "Cashmere Ribbed Beanie", sku: "ET-008-BLK", category: "Accessories", stock: 5, maxStock: 120, status: "low_stock", lastUpdated: "2024-11-14" },
  { id: "9", name: "Wide-Leg Linen Trouser", sku: "ET-009-ECR", category: "Bottoms", stock: 11, maxStock: 50, status: "in_stock", lastUpdated: "2024-11-10" },
  { id: "10", name: "Leather Chelsea Boot", sku: "ET-010-BLK", category: "Footwear", stock: 0, maxStock: 30, status: "out_of_stock", lastUpdated: "2024-11-07" },
  { id: "11", name: "Ribbed Tank Top", sku: "ET-011-WHT", category: "Tops", stock: 89, maxStock: 150, status: "in_stock", lastUpdated: "2024-11-13" },
  { id: "12", name: "Wool-Blend Overcoat", sku: "ET-012-CHR", category: "Outerwear", stock: 8, maxStock: 25, status: "low_stock", lastUpdated: "2024-11-12" }
];
const statusConfig = {
  in_stock: { label: "In Stock", badge: "bg-green-100 text-green-700", icon: <FiCheckCircle size={12} /> },
  low_stock: { label: "Low Stock", badge: "bg-amber-100 text-amber-700", icon: <FiAlertTriangle size={12} /> },
  out_of_stock: { label: "Out of Stock", badge: "bg-red-100 text-red-600", icon: <FiXCircle size={12} /> }
};
function InventoryPage() {
  const [search, setSearch] = useState("");
  const [restocked, setRestocked] = useState([]);
  const filtered = inventoryData.filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
  );
  const summaryCards = [
    { label: "Total SKUs", value: inventoryData.length, icon: <FiPackage size={20} />, color: "bg-blue-50 text-blue-600" },
    { label: "In Stock", value: inventoryData.filter((i) => i.status === "in_stock").length, icon: <FiCheckCircle size={20} />, color: "bg-green-50 text-green-600" },
    { label: "Low Stock (< 10)", value: inventoryData.filter((i) => i.status === "low_stock").length, icon: <FiAlertTriangle size={20} />, color: "bg-amber-50 text-amber-600" },
    { label: "Out of Stock", value: inventoryData.filter((i) => i.status === "out_of_stock").length, icon: <FiXCircle size={20} />, color: "bg-red-50 text-red-600" }
  ];
  const alertItems = inventoryData.filter((i) => i.status !== "in_stock");
  return <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track stock levels across all SKUs</p>
      </div>

      {
    /* Summary Cards */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => <motion.div
    key={card.label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
  >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="font-display text-2xl text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </motion.div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {
    /* Main Table */
  }
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
    type="text"
    placeholder="Search products, SKU, category..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
    const pct = item.maxStock > 0 ? item.stock / item.maxStock * 100 : 0;
    const config = statusConfig[item.status];
    const isRestocked = restocked.includes(item.id);
    return <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs hidden sm:table-cell">{item.category}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                              <div
      className={`h-1.5 rounded-full transition-all ${item.status === "out_of_stock" ? "bg-red-400" : item.status === "low_stock" ? "bg-amber-400" : "bg-[#2d4a3e]"}`}
      style={{ width: `${pct}%` }}
    />
                            </div>
                            <span className="text-xs font-medium text-gray-700 tabular-nums">{item.stock}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 w-fit text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                            {config.icon} {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
      onClick={() => setRestocked((prev) => [...prev, item.id])}
      disabled={isRestocked}
      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${isRestocked ? "bg-green-100 text-green-700 cursor-default" : "bg-[#0a0a0a] text-white hover:bg-[#2d4a3e]"}`}
    >
                            {isRestocked ? "Ordered" : "Restock"}
                          </button>
                        </td>
                      </tr>;
  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="py-12 text-center">
                  <p className="text-gray-400 text-sm">No items found</p>
                </div>}
            </div>
          </div>
        </div>

        {
    /* Alert Panel */
  }
        <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit"
  >
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-amber-500" size={16} />
            <h2 className="font-semibold text-gray-900">Needs Attention</h2>
          </div>
          <div className="space-y-3">
            {alertItems.map((item) => <div
    key={item.id}
    className={`p-3 rounded-lg border ${item.status === "out_of_stock" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}
  >
                <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-xs font-bold ${item.status === "out_of_stock" ? "text-red-600" : "text-amber-700"}`}>
                    {item.stock === 0 ? "Out of stock" : `${item.stock} remaining`}
                  </span>
                  <button
    onClick={() => setRestocked((prev) => [...prev, item.id])}
    className="text-xs px-2 py-0.5 bg-[#0a0a0a] text-white rounded-md hover:bg-[#2d4a3e] transition-colors"
  >
                    Restock
                  </button>
                </div>
              </div>)}
          </div>
        </motion.div>
      </div>
    </div>;
}
export {
  InventoryPage as default
};
