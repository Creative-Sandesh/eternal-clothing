import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiPlus, FiArrowLeft, FiImage } from "react-icons/fi";
import { productApi, categoryApi, collectionApi } from "../../services/api";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

function AddEditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== "new");

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    collectionId: "",
    price: "",
    comparePrice: "",
    sku: "",
    material: "",
    status: "active"
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [colors, setColors] = useState([{ name: "Black", hex: "#1a1a1a" }]);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    let active = true;
    const loadDropdownsAndProduct = async () => {
      try {
        setLoading(true);
        const [catRes, colRes] = await Promise.all([
          categoryApi.getAll().catch(() => ({ data: [] })),
          collectionApi.getAll().catch(() => ({ data: [] }))
        ]);
        if (!active) return;
        const fetchedCats = catRes.data || [];
        const fetchedCols = colRes.data || [];
        setCategories(fetchedCats);
        setCollections(fetchedCols);

        if (isEdit) {
          const pRes = await productApi.getProducts();
          const found = (pRes.data?.products || pRes.data || []).find(p => String(p.id) === String(id) || p.slug === id);
          if (found) {
            setForm({
              name: found.name || "",
              description: found.description || "",
              categoryId: found.categoryId || (fetchedCats[0]?.id ?? ""),
              collectionId: found.collectionId || (fetchedCols[0]?.id ?? ""),
              price: String(found.basePrice || found.price || ""),
              comparePrice: found.originalPrice ? String(found.originalPrice) : "",
              sku: found.sku || "",
              material: found.material || "",
              status: "active"
            });
            setImages(Array.isArray(found.images) ? found.images : (found.images ? [found.images] : []));
          }
        } else {
          setForm(f => ({
            ...f,
            categoryId: fetchedCats[0]?.id ?? "",
            collectionId: fetchedCols[0]?.id ?? ""
          }));
        }
      } catch (err) {
        console.error("Failed to load product form data", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDropdownsAndProduct();
    return () => { active = false; };
  }, [id, isEdit]);

  const handleSaveProduct = async () => {
    if (!form.name || !form.price) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        basePrice: parseFloat(form.price),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        collectionId: form.collectionId ? Number(form.collectionId) : undefined,
        material: form.material,
        images,
        variants: colors.map((c) => ({
          size: selectedSizes[0] || "M",
          colorName: c.name || "Default",
          colorHex: c.hex || "#000000",
          stockQuantity: 50,
          sku: form.sku ? `${form.sku}-${c.name}` : `SKU-${Date.now()}-${c.name}`
        }))
      };

      if (isEdit) {
        await productApi.updateProduct(id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to save product", err);
    } finally {
      setSaving(false);
    }
  };
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleSize = (size) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const updateColor = (i, field, value) => setColors((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const addColor = () => setColors((prev) => [...prev, { name: "", hex: "#000000" }]);
  const removeColor = (i) => setColors((prev) => prev.filter((_, idx) => idx !== i));

  if (loading) return <div className="py-24 text-center text-gray-500">Loading product form...</div>;

  return <div className="space-y-5">
      {
    /* Header */
  }
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-gray-900">{isEdit ? "Edit Product" : "Add Product"}</h1>
          <p className="text-sm text-gray-500">{isEdit ? "Editing product details" : "Create a new product listing"}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
    onClick={() => set("status", "draft")}
    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
  >
            Save as Draft
          </button>
          <button
    disabled={saving}
    onClick={handleSaveProduct}
    className="px-4 py-2 text-sm font-medium bg-[#0a0a0a] text-white rounded-xl hover:bg-[#2d4a3e] transition-colors"
  >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {
    /* Left: Form */
  }
        <div className="lg:col-span-2 space-y-4">
          {
    /* Basic Info */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
  >
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
              <input
    type="text"
    value={form.name}
    onChange={(e) => set("name", e.target.value)}
    placeholder="e.g. Merino Crewneck Knit"
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
    value={form.description}
    onChange={(e) => set("description", e.target.value)}
    rows={4}
    placeholder="Product description..."
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors resize-none"
  />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
    value={form.categoryId}
    onChange={(e) => set("categoryId", e.target.value)}
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Collection</label>
                <select
    value={form.collectionId}
    onChange={(e) => set("collectionId", e.target.value)}
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                  <option value="">Select Collection</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </motion.div>

          {
    /* Pricing */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.06 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
  >
            <h2 className="font-semibold text-gray-900">Pricing & SKU</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (£)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                  <input
    type="number"
    value={form.price}
    onChange={(e) => set("price", e.target.value)}
    placeholder="0.00"
    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare at Price (£)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                  <input
    type="number"
    value={form.comparePrice}
    onChange={(e) => set("comparePrice", e.target.value)}
    placeholder="0.00"
    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                <input
    type="text"
    value={form.sku}
    onChange={(e) => set("sku", e.target.value)}
    placeholder="ET-001-WHT"
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors font-mono"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Material</label>
                <input
    type="text"
    value={form.material}
    onChange={(e) => set("material", e.target.value)}
    placeholder="100% Merino Wool"
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
              </div>
            </div>
          </motion.div>

          {
    /* Variants */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5"
  >
            <h2 className="font-semibold text-gray-900">Variants</h2>

            {
    /* Sizes */
  }
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => <button
    key={size}
    onClick={() => toggleSize(size)}
    className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${selectedSizes.includes(size) ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
  >
                    {size}
                  </button>)}
              </div>
            </div>

            {
    /* Colors */
  }
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
              <div className="space-y-2">
                {colors.map((color, i) => <div key={i} className="flex items-center gap-3">
                    <input
    type="color"
    value={color.hex}
    onChange={(e) => updateColor(i, "hex", e.target.value)}
    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
  />
                    <input
    type="text"
    value={color.name}
    onChange={(e) => updateColor(i, "name", e.target.value)}
    placeholder="Color name"
    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
  />
                    <button
    onClick={() => removeColor(i)}
    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
  >
                      <FiX size={14} />
                    </button>
                  </div>)}
                <button
    onClick={addColor}
    className="flex items-center gap-2 text-sm text-[#2d4a3e] hover:underline"
  >
                  <FiPlus size={14} /> Add color
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {
    /* Right: Image upload + Status */
  }
        <div className="space-y-4">
          {
    /* Image Upload */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-3">Product Images</h2>

            {
    /* Drop zone */
  }
            <div
    onDragOver={(e) => {
      e.preventDefault();
      setDragOver(true);
    }}
    onDragLeave={() => setDragOver(false)}
    onDrop={(e) => {
      e.preventDefault();
      setDragOver(false);
    }}
    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-[#2d4a3e] bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
  >
              <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-700">Drag & drop images here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
            </div>

            {
    /* Image previews */
  }
            {images.length > 0 && <div className="grid grid-cols-2 gap-2 mt-3">
                {images.map((img, i) => <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
  >
                      <FiX size={10} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">Main</span>}
                  </div>)}
              </div>}

            {images.length === 0 && <div className="flex items-center justify-center aspect-square bg-gray-50 rounded-xl mt-3 border border-gray-100">
                <FiImage className="text-gray-300" size={40} />
              </div>}
          </motion.div>

          {
    /* Status */
  }
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.14 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
  >
            <h2 className="font-semibold text-gray-900 mb-3">Product Status</h2>
            <div className="space-y-2">
              {["active", "draft"].map((s) => <button
    key={s}
    onClick={() => set("status", s)}
    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${form.status === s ? "border-[#2d4a3e] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
  >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.status === s ? "border-[#2d4a3e]" : "border-gray-300"}`}>
                    {form.status === s && <div className="w-2 h-2 rounded-full bg-[#2d4a3e]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{s}</p>
                    <p className="text-xs text-gray-500">{s === "active" ? "Visible on store" : "Hidden from store"}</p>
                  </div>
                </button>)}
            </div>
          </motion.div>

          {
    /* Existing product preview hint */
  }
          {existing && <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18 }}
    className="bg-[#f0ebe2] rounded-xl p-4 border border-[#e0d9cc]"
  >
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Preview</p>
              <p className="text-sm font-medium text-gray-900">{existing.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-gray-900">£{existing.price}</span>
                {existing.originalPrice && <span className="text-sm text-gray-500 line-through">£{existing.originalPrice}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{existing.category} · {existing.collection}</p>
            </motion.div>}
        </div>
      </div>
    </div>;
}
export {
  AddEditProductPage as default
};
