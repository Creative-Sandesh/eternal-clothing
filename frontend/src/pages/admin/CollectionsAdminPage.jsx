import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiList, FiX, FiImage, FiSave } from "react-icons/fi";
import { collectionApi, productApi } from "../../services/api";

const statusColors = {
  Active: "bg-[#2d4a3e]/10 text-[#2d4a3e]",
  Draft: "bg-gray-100 text-gray-500",
  Scheduled: "bg-blue-50 text-blue-600"
};

function CollectionsAdminPage() {
  const money = useMoney();
  const [collections, setCollections] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const emptyForm = { name: "", slug: "", description: "", startDate: "", endDate: "", status: "Active" };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [colsRes, prodsRes] = await Promise.all([
        collectionApi.getAll().catch(() => ({ data: [] })),
        productApi.getProducts().catch(() => ({ data: [] }))
      ]);
      const fetchedCols = (colsRes.data || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        imageUrl: c.imageUrl || "",
        productCount: Number(c.productCount || 0),
        startDate: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "2024-01-01",
        endDate: "2025-12-31",
        status: "Active"
      }));
      setCollections(fetchedCols);
      setProductsList(prodsRes.data?.products || prodsRes.data || []);
    } catch (err) {
      console.error("Failed to load collections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function handleNameChange(name) {
    setForm({ ...form, name, slug: name.toLowerCase().replace(/\s+/g, "-") });
  }

  function toggleProduct(id) {
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProducts([]);
    setShowPanel(true);
  }

  function openEdit(col) {
    setEditingId(col.id);
    setForm({
      name: col.name || "",
      slug: col.slug || "",
      description: col.description || "",
      startDate: "",
      endDate: "",
      status: col.status || "Active"
    });
    setSelectedProducts([]);
    setShowPanel(true);
  }

  function closePanel() {
    setShowPanel(false);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProducts([]);
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const payload = { name: form.name.trim(), description: form.description };
    try {
      if (editingId) {
        const res = await collectionApi.update(editingId, payload);
        const updated = res.data || {};
        setCollections((prev) => prev.map((c) => (c.id === editingId
          ? { ...c, name: updated.name ?? payload.name, slug: updated.slug ?? c.slug, description: updated.description ?? payload.description }
          : c)));
      } else {
        const res = await collectionApi.create(payload);
        if (res.data) {
          setCollections((prev) => [...prev, {
            id: res.data.id,
            name: res.data.name,
            slug: res.data.slug,
            description: res.data.description || "",
            imageUrl: "",
            productCount: 0,
            startDate: new Date().toISOString().split("T")[0],
            endDate: "2025-12-31",
            status: form.status
          }]);
        }
      }
      closePanel();
    } catch (err) {
      console.error("Failed to save collection", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCollection(id) {
    try {
      await collectionApi.delete(id);
      setCollections(collections.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete collection", err);
    }
  }
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Collections</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Curate product groups and seasonal edits</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button onClick={() => setView("table")} className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-[#0a0a0a]" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}>
              <FiList size={15} />
            </button>
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white shadow-sm text-[#0a0a0a]" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}>
              <FiGrid size={15} />
            </button>
          </div>
          <button
    onClick={openCreate}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
            <FiPlus size={16} /> Create Collection
          </button>
        </div>
      </div>

      {
    /* Main content */
  }
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {view === "table" ? <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Name", "Slug", "Products", "Start Date", "End Date", "Status", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => <tr key={col.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#0a0a0a]">{col.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[#8c8277]">{col.slug}</td>
                      <td className="px-5 py-3 text-[#8c8277]">{col.productCount}</td>
                      <td className="px-5 py-3 text-[#8c8277] text-xs">{col.startDate}</td>
                      <td className="px-5 py-3 text-[#8c8277] text-xs">{col.endDate}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[col.status]}`}>
                          {col.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(col)} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors"><FiEdit2 size={13} /></button>
                          <button onClick={() => deleteCollection(col.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {collections.map((col) => <div key={col.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-full h-24 bg-[#f0ebe2]/40 rounded-lg mb-4 flex items-center justify-center">
                    <FiImage size={20} className="text-[#c9b99a]" />
                  </div>
                  <h3 className="font-semibold text-[#0a0a0a]">{col.name}</h3>
                  <p className="text-xs text-[#8c8277] mt-1">{col.productCount} products</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[col.status]}`}>
                      {col.status}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(col)} className="p-1 text-[#8c8277] hover:text-[#0a0a0a] transition-colors"><FiEdit2 size={12} /></button>
                      <button onClick={() => deleteCollection(col.id)} className="p-1 text-[#8c8277] hover:text-red-500 transition-colors"><FiTrash2 size={12} /></button>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>

        {
    /* Side Panel */
  }
        <AnimatePresence>
          {showPanel && <motion.div
    initial={{ x: 360, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 360, opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="w-80 flex-shrink-0 bg-white border border-gray-100 rounded-xl h-fit sticky top-6 overflow-hidden"
  >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-sm text-[#0a0a0a]">{editingId ? "Edit Collection" : "New Collection"}</p>
                <button onClick={closePanel} className="text-[#8c8277] hover:text-[#0a0a0a] p-1 rounded-md hover:bg-gray-100 transition-colors">
                  <FiX size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Collection Name</label>
                  <input
    value={form.name}
    onChange={(e) => handleNameChange(e.target.value)}
    placeholder="e.g. Winter Edit"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Slug</label>
                  <input
    value={form.slug}
    onChange={(e) => setForm({ ...form, slug: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] font-mono"
  />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Description</label>
                  <textarea
    value={form.description}
    onChange={(e) => setForm({ ...form, description: e.target.value })}
    rows={3}
    placeholder="Describe this collection..."
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] resize-none"
  />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Cover Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-24 flex flex-col items-center justify-center text-[#8c8277] hover:border-[#c9b99a] hover:bg-[#f0ebe2]/20 transition-colors cursor-pointer">
                    <FiImage size={20} className="mb-1" />
                    <span className="text-xs">Upload image</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-2">Products ({selectedProducts.length} selected)</label>
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {productsList.slice(0, 16).map((p) => <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
    type="checkbox"
    checked={selectedProducts.includes(p.id)}
    onChange={() => toggleProduct(p.id)}
    className="rounded border-gray-300 text-[#2d4a3e]"
  />
                        <span className="text-xs text-[#0a0a0a] truncate">{p.name}</span>
                        <span className="text-xs text-[#8c8277] ml-auto flex-shrink-0">{money(p.price)}</span>
                      </label>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">Start Date</label>
                    <input
    type="date"
    value={form.startDate}
    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">End Date</label>
                    <input
    type="date"
    value={form.endDate}
    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Status</label>
                  <select
    value={form.status}
    onChange={(e) => setForm({ ...form, status: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Scheduled</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors disabled:opacity-40">
                    <FiSave size={14} /> {saving ? "Saving…" : editingId ? "Update" : "Save"}
                  </button>
                  <button onClick={closePanel} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors text-[#8c8277]">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
export {
  CollectionsAdminPage as default
};
