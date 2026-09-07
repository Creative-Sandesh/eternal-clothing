import { useState, useEffect } from "react";
import { useMoney } from "../../context/SettingsContext";
import { currencySymbol } from "../../utils/money";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiPlus, FiArrowLeft, FiImage } from "react-icons/fi";
import { productApi, categoryApi, collectionApi } from "../../services/api";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

function AddEditProductPage() {
  const money = useMoney();
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (fileList) => {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const res = await productApi.uploadImages(files);
      setImages((prev) => [...prev, ...(res.data?.urls || [])]);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };
  // Edit mode: the product's actual variant rows ({ id?, size, colorName, colorHex, sku, stockQuantity }).
  const [variants, setVariants] = useState([]);

  const STATUS_TO_UI = { PUBLISHED: "active", DRAFT: "draft", ARCHIVED: "archived" };
  const UI_TO_STATUS = { active: "PUBLISHED", draft: "DRAFT", archived: "ARCHIVED" };

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
          const pRes = await productApi.getById(id);
          const found = pRes.data;
          if (found) {
            setForm({
              name: found.name || "",
              description: found.description || "",
              categoryId: found.categoryId || found.category?.id || "",
              collectionId: found.collectionId || found.collection?.id || "",
              price: String(found.basePrice ?? found.price ?? ""),
              comparePrice: found.originalPrice ? String(found.originalPrice) : "",
              sku: found.skuPrefix || found.sku || "",
              material: found.material || "",
              status: STATUS_TO_UI[found.status] || "active"
            });
            setImages(Array.isArray(found.images) ? found.images : (found.images ? [found.images] : []));
            setVariants((found.variants || []).map((v) => ({
              id: v.id,
              size: v.size || "",
              colorName: v.colorName || "",
              colorHex: v.colorHex || "#000000",
              sku: v.sku || "",
              stockQuantity: Number(v.stockQuantity ?? 0)
            })));
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
        setError(err.message || "Failed to load the product");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDropdownsAndProduct();
    return () => { active = false; };
  }, [id, isEdit]);

  const buildNewVariants = () => {
    const sizes = selectedSizes.length > 0 ? selectedSizes : ["M"];
    return colors.flatMap((c) =>
      sizes.map((size) => ({
        size,
        colorName: c.name || "Default",
        colorHex: c.hex || "#000000",
        stockQuantity: 50,
        sku: `${form.sku || "SKU"}-${(c.name || "X").replace(/\s+/g, "")}-${size}`
      }))
    );
  };

  const handleSaveProduct = async (statusOverride) => {
    if (!form.name || !form.price) {
      setError("Product name and price are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const uiStatus = statusOverride || form.status;
      const payload = {
        name: form.name,
        description: form.description,
        basePrice: parseFloat(form.price),
        originalPrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        // Backend ids are UUID strings — pass them through untouched.
        categoryId: form.categoryId || undefined,
        collectionId: form.collectionId || null,
        material: form.material,
        skuPrefix: form.sku || `ET-${Date.now()}`,
        images,
        status: UI_TO_STATUS[uiStatus] || "PUBLISHED",
        // Edit sends the (possibly edited) real variant rows; create builds them from the grid.
        variants: isEdit ? variants : buildNewVariants()
      };

      if (isEdit) {
        await productApi.updateProduct(id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to save product", err);
      setError(err.message || "Failed to save the product");
    } finally {
      setSaving(false);
    }
  };
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleSize = (size) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const updateColor = (i, field, value) => setColors((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const addColor = () => setColors((prev) => [...prev, { name: "", hex: "#000000" }]);
  const removeColor = (i) => setColors((prev) => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i, field, value) =>
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  const removeVariant = (i) => setVariants((prev) => prev.filter((_, idx) => idx !== i));
  const addVariant = () =>
    setVariants((prev) => [...prev, { size: "", colorName: "", colorHex: "#000000", sku: "", stockQuantity: 0 }]);

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
    disabled={saving}
    onClick={() => handleSaveProduct("draft")}
    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
  >
            Save as Draft
          </button>
          <button
    disabled={saving}
    onClick={() => handleSaveProduct()}
    className="px-4 py-2 text-sm font-medium bg-[#0a0a0a] text-white rounded-xl hover:bg-[#2d4a3e] transition-colors disabled:opacity-60"
  >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {error && <div className="px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ({currencySymbol()})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol()}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare at Price ({currencySymbol()})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol()}</span>
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

            {isEdit ? (
              /* Edit mode: the product's real variant rows */
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                        <th className="py-2 pr-2 font-medium">Size</th>
                        <th className="py-2 pr-2 font-medium">Color</th>
                        <th className="py-2 pr-2 font-medium">SKU</th>
                        <th className="py-2 pr-2 font-medium w-20">Stock</th>
                        <th className="py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 && <tr><td colSpan={5} className="py-4 text-gray-400 text-center">No variants — add one below.</td></tr>}
                      {variants.map((v, i) => <tr key={v.id || i} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 pr-2">
                          <input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#2d4a3e]" />
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                            <input value={v.colorName} onChange={(e) => updateVariant(i, "colorName", e.target.value)} className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#2d4a3e]" />
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-32 px-2 py-1.5 text-sm font-mono border border-gray-200 rounded-md focus:outline-none focus:border-[#2d4a3e]" />
                        </td>
                        <td className="py-2 pr-2">
                          <input type="number" min="0" value={v.stockQuantity} onChange={(e) => updateVariant(i, "stockQuantity", parseInt(e.target.value, 10) || 0)} className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#2d4a3e]" />
                        </td>
                        <td className="py-2">
                          <button onClick={() => removeVariant(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><FiX size={14} /></button>
                        </td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>
                <button onClick={addVariant} className="flex items-center gap-2 text-sm text-[#2d4a3e] hover:underline">
                  <FiPlus size={14} /> Add variant
                </button>
                <p className="text-xs text-gray-400">Removing a row deletes that variant when you save. New rows are created.</p>
              </div>
            ) : (
              <>
                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => <button
    key={size}
    type="button"
    onClick={() => toggleSize(size)}
    className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${selectedSizes.includes(size) ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
  >
                        {size}
                      </button>)}
                  </div>
                </div>

                {/* Colors */}
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
    type="button"
    onClick={() => removeColor(i)}
    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
  >
                          <FiX size={14} />
                        </button>
                      </div>)}
                    <button
    type="button"
    onClick={addColor}
    className="flex items-center gap-2 text-sm text-[#2d4a3e] hover:underline"
  >
                      <FiPlus size={14} /> Add color
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">A variant is created for every size × color combination (50 in stock each).</p>
                </div>
              </>
            )}
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
            <label
    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
    onDragLeave={() => setDragOver(false)}
    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    className={`block border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-[#2d4a3e] bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
  >
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading…" : "Drag & drop images here"}</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP up to 5MB</p>
            </label>

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
              {[
    { key: "active", hint: "Visible on store" },
    { key: "draft", hint: "Hidden — not yet published" },
    { key: "archived", hint: "Hidden — retired from the catalogue" }
  ].map(({ key, hint }) => <button
    key={key}
    type="button"
    onClick={() => set("status", key)}
    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${form.status === key ? "border-[#2d4a3e] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
  >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.status === key ? "border-[#2d4a3e]" : "border-gray-300"}`}>
                    {form.status === key && <div className="w-2 h-2 rounded-full bg-[#2d4a3e]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
                    <p className="text-xs text-gray-500">{hint}</p>
                  </div>
                </button>)}
            </div>
          </motion.div>

          {
    /* Live preview from the form */
  }
          {form.name && <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18 }}
    className="bg-[#f0ebe2] rounded-xl p-4 border border-[#e0d9cc]"
  >
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Preview</p>
              <p className="text-sm font-medium text-gray-900">{form.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {form.price && <span className="text-sm font-bold text-gray-900">{money(form.price)}</span>}
                {form.comparePrice && <span className="text-sm text-gray-500 line-through">{money(form.comparePrice)}</span>}
              </div>
              {form.material && <p className="text-xs text-gray-500 mt-1">{form.material}</p>}
            </motion.div>}
        </div>
      </div>
    </div>;
}
export {
  AddEditProductPage as default
};
