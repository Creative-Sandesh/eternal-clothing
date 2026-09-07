import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiGlobe, FiTruck, FiAward, FiShield } from "react-icons/fi";
import { settingsApi, userApi } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";

const tabs = [
  { value: "general", label: "General", icon: <FiGlobe size={15} /> },
  { value: "commerce", label: "Shipping & Tax", icon: <FiTruck size={15} /> },
  { value: "loyalty", label: "Loyalty", icon: <FiAward size={15} /> },
  { value: "security", label: "Security", icon: <FiShield size={15} /> }
];

// Currencies the storefront knows how to render a symbol for (see src/utils/money.js).
const CURRENCY_OPTIONS = [
  { value: "NPR", label: "NPR — Nepalese Rupee (रू)" },
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "GBP", label: "GBP — Pound Sterling (£)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "AUD", label: "AUD — Australian Dollar (A$)" },
  { value: "CAD", label: "CAD — Canadian Dollar (C$)" }
];

// key → { label, type, hint }. `type: "number"` values are coerced before saving.
const FIELDS = {
  general: [
    { key: "store_name", label: "Store Name", type: "text" },
    { key: "store_email", label: "Store Email", type: "text" },
    { key: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, hint: "Drives every price shown across the storefront and admin" }
  ],
  commerce: [
    { key: "shipping_fee_standard", label: "Standard Shipping Fee", type: "number" },
    { key: "free_shipping_threshold", label: "Free Shipping Threshold", type: "number", hint: "Order subtotal above which shipping is free" },
    { key: "tax_rate_percent", label: "Tax Rate (%)", type: "number" }
  ],
  loyalty: [
    { key: "loyalty_points_per_dollar", label: "Points Earned per Unit Spent", type: "number" },
    { key: "loyalty_points_redemption_rate", label: "Redemption Rate", type: "number", hint: "Currency value of one point, e.g. 0.01" }
  ]
};

function Field({ field, value, onChange }) {
  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
      {field.type === "select" ? (
        <select value={value ?? ""} onChange={(e) => onChange(field.key, e.target.value)} className={inputClass + " bg-white"}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          step={field.type === "number" ? "any" : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClass}
        />
      )}
      {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
    </div>
  );
}

function SettingsPage() {
  const { reloadSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({});
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null); // { type: "ok" | "err", text }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAll();
      setSettings(res.data || {});
      setDraft(res.data || {});
    } catch (err) {
      console.error("Failed to load settings", err);
      setBanner({ type: "err", text: err.message || "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const allFields = [...FIELDS.general, ...FIELDS.commerce, ...FIELDS.loyalty];
  const dirtyKeys = allFields
    .map((f) => f.key)
    .filter((k) => String(draft[k] ?? "") !== String(settings[k] ?? ""));

  const handleSave = async () => {
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    setBanner(null);
    try {
      for (const key of dirtyKeys) {
        const field = allFields.find((f) => f.key === key);
        let value = draft[key];
        if (field?.type === "number") value = value === "" ? 0 : Number(value);
        await settingsApi.upsert(key, value);
      }
      setSettings((s) => ({ ...s, ...Object.fromEntries(dirtyKeys.map((k) => {
        const field = allFields.find((f) => f.key === k);
        return [k, field?.type === "number" ? Number(draft[k] || 0) : draft[k]];
      })) }));
      setBanner({ type: "ok", text: `Saved ${dirtyKeys.length} setting${dirtyKeys.length > 1 ? "s" : ""}` });
      reloadSettings();
    } catch (err) {
      console.error("Failed to save settings", err);
      setBanner({ type: "err", text: err.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  // ── Password change ────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const handleChangePassword = async () => {
    if (!pw.oldPassword || !pw.newPassword) {
      setPwMsg({ type: "err", text: "Current and new password are required" });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: "err", text: "New passwords do not match" });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await userApi.changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      setPw({ oldPassword: "", newPassword: "", confirm: "" });
      setPwMsg({ type: "ok", text: "Password updated" });
    } catch (err) {
      setPwMsg({ type: "err", text: err.message || "Failed to change password" });
    } finally {
      setPwSaving(false);
    }
  };

  const SaveBar = () => (
    <div className="flex items-center justify-end gap-3">
      {dirtyKeys.length > 0 && <span className="text-xs text-[#8c8277]">{dirtyKeys.length} unsaved change{dirtyKeys.length > 1 ? "s" : ""}</span>}
      <button
        onClick={handleSave}
        disabled={saving || dirtyKeys.length === 0}
        className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a3e] transition-colors disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );

  return <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Store configuration used by the storefront and checkout</p>
      </div>

      {banner && <div className={`px-4 py-2.5 text-sm rounded-lg ${banner.type === "ok" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-red-50 text-red-600"}`}>{banner.text}</div>}

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 bg-gray-100 rounded-xl p-1 w-fit max-w-full">
        {tabs.map((tab) => <button
    key={tab.value}
    onClick={() => setActiveTab(tab.value)}
    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
            {tab.icon}
            <span>{tab.label}</span>
          </button>)}
      </div>

      {loading ? <p className="text-sm text-gray-400 py-10 text-center">Loading settings…</p>
      : <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-5">

        {activeTab === "general" && <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.general.map((f) => <Field key={f.key} field={f} value={draft[f.key]} onChange={setField} />)}
            </div>
          </div>
          <SaveBar />
        </>}

        {activeTab === "commerce" && <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Shipping & Tax</h2>
            <p className="text-xs text-gray-400">Checkout reads these values live — the standard shipping fee is waived once the order subtotal reaches the free-shipping threshold.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.commerce.map((f) => <Field key={f.key} field={f} value={draft[f.key]} onChange={setField} />)}
            </div>
          </div>
          <SaveBar />
        </>}

        {activeTab === "loyalty" && <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Loyalty Programme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.loyalty.map((f) => <Field key={f.key} field={f} value={draft[f.key]} onChange={setField} />)}
            </div>
          </div>
          <SaveBar />
        </>}

        {activeTab === "security" && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          {pwMsg && <div className={`px-3 py-2 text-sm rounded-lg ${pwMsg.type === "ok" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-red-50 text-red-600"}`}>{pwMsg.text}</div>}
          <div className="max-w-md space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e]" />
            </div>
            <button onClick={handleChangePassword} disabled={pwSaving} className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a3e] transition-colors disabled:opacity-40">
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>}

      </motion.div>}
    </div>;
}
export {
  SettingsPage as default
};
