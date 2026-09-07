import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiAlertCircle, FiSave, FiX, FiMove } from "react-icons/fi";
import { categoryApi } from "../../services/api";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", status: "Active" });
  const [editValues, setEditValues] = useState({});
  const [dragIndex, setDragIndex] = useState(null);

  const onDragStart = (i) => setDragIndex(i);
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    setCategories((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(i);
  };
  const onDrop = async () => {
    setDragIndex(null);
    try {
      await categoryApi.reorder(categories.map((c) => c.id));
    } catch (err) {
      console.error("Failed to save order", err);
      fetchCategories();
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAll();
      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: Number(c.productCount || 0),
        status: "Active"
      }));
      setCategories(mapped);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);
  const activeCount = categories.filter((c) => c.status === "Active").length;

  async function handleAdd() {
    if (!newCategory.name) return;
    try {
      const res = await categoryApi.create({
        name: newCategory.name,
        description: ""
      });
      if (res.data) {
        setCategories([...categories, {
          id: res.data.id,
          name: res.data.name,
          slug: res.data.slug,
          productCount: 0,
          status: newCategory.status
        }]);
      }
    } catch (err) {
      console.error("Failed to add category", err);
    }
    setNewCategory({ name: "", slug: "", status: "Active" });
    setShowAddForm(false);
  }

  async function handleDelete(id) {
    try {
      await categoryApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditValues({ name: cat.name, slug: cat.slug, status: cat.status });
  }

  async function saveEdit(id) {
    try {
      await categoryApi.update(id, { name: editValues.name });
      setCategories(categories.map((c) => c.id === id ? { ...c, ...editValues } : c));
    } catch (err) {
      console.error("Failed to update category", err);
    }
    setEditingId(null);
  }
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Categories</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Organise your product catalogue</p>
        </div>
        <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
          <FiPlus size={16} />
          Add Category
        </button>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-3 gap-4">
        {[
    { label: "Total Categories", value: categories.length },
    { label: "Active", value: activeCount },
    { label: "Total Products", value: totalProducts }
  ].map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
            <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
          </div>)}
      </div>

      {
    /* Drag hint */
  }
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f0ebe2]/50 border border-[#c9b99a]/30 rounded-lg text-sm text-[#8c8277]">
        <FiMove size={14} />
        Drag the handle to reorder categories — the order is saved and reflected on the storefront
      </div>

      {
    /* Add form */
  }
      <AnimatePresence>
        {showAddForm && <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5"
  >
            <p className="font-semibold text-sm text-[#0a0a0a] mb-4">New Category</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Name</label>
                <input
    value={newCategory.name}
    onChange={(e) => {
      const name = e.target.value;
      setNewCategory({ ...newCategory, name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    }}
    placeholder="e.g. Denim"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Slug</label>
                <input
    value={newCategory.slug}
    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
    placeholder="auto-generated"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-1">Status</label>
                <select
    value={newCategory.status}
    onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                <FiSave size={14} /> Save Category
              </button>
              <button onClick={() => setShowAddForm(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                <FiX size={14} /> Cancel
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {
    /* Table */
  }
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-8 px-2 py-3" />
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Slug</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Products</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => <tr
                key={cat.id}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={onDrop}
                className={`border-b border-gray-50 last:border-0 ${dragIndex === i ? "bg-[#f0ebe2]" : i % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}
              >
                <td
                  className="px-2 py-3 text-center text-[#c9b99a] cursor-grab active:cursor-grabbing"
                  draggable={editingId !== cat.id}
                  onDragStart={() => onDragStart(i)}
                  onDragEnd={() => setDragIndex(null)}
                  title="Drag to reorder"
                >
                  <FiMove size={13} className="inline" />
                </td>
                {editingId === cat.id ? <>
                    <td className="px-5 py-3">
                      <input
    value={editValues.name ?? ""}
    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
    className="border border-[#2d4a3e] rounded-lg px-2 py-1 text-sm w-full focus:outline-none"
  />
                    </td>
                    <td className="px-5 py-3">
                      <input
    value={editValues.slug ?? ""}
    onChange={(e) => setEditValues({ ...editValues, slug: e.target.value })}
    className="border border-[#2d4a3e] rounded-lg px-2 py-1 text-sm w-full focus:outline-none"
  />
                    </td>
                    <td className="px-5 py-3 text-[#8c8277]">{cat.productCount}</td>
                    <td className="px-5 py-3">
                      <select
    value={editValues.status ?? cat.status}
    onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
    className="border border-[#2d4a3e] rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
  >
                        <option>Active</option>
                        <option>Draft</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => saveEdit(cat.id)} className="flex items-center gap-1 text-[#2d4a3e] text-xs font-medium hover:underline">
                          <FiSave size={13} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-[#8c8277] text-xs hover:underline">
                          <FiX size={13} /> Cancel
                        </button>
                      </div>
                    </td>
                  </> : <>
                    <td className="px-5 py-3 font-medium text-[#0a0a0a]">{cat.name}</td>
                    <td className="px-5 py-3 text-[#8c8277] font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 text-[#8c8277]">{cat.productCount}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.status === "Active" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-gray-100 text-gray-500"}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(cat)} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </>}
              </tr>)}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-[#8c8277]">
          <FiAlertCircle size={32} className="mb-3 opacity-40" />
          <p className="text-sm">No categories yet. Add your first one above.</p>
        </div>}
    </div>;
}
export {
  CategoriesPage as default
};
