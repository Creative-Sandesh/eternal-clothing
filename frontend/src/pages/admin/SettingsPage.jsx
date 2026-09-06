import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiGlobe, FiTruck, FiPercent, FiCreditCard, FiMail, FiShield, FiLayout, FiToggleRight, FiToggleLeft } from "react-icons/fi";
import { settingsApi } from "../../services/api";
const tabs = [
  { value: "general", label: "General", icon: <FiGlobe size={15} /> },
  { value: "shipping", label: "Shipping", icon: <FiTruck size={15} /> },
  { value: "tax", label: "Tax", icon: <FiPercent size={15} /> },
  { value: "payment", label: "Payment", icon: <FiCreditCard size={15} /> },
  { value: "email", label: "Email", icon: <FiMail size={15} /> },
  { value: "security", label: "Security", icon: <FiShield size={15} /> },
  { value: "appearance", label: "Appearance", icon: <FiLayout size={15} /> }
];
const shippingZones = [
  { zone: "United Kingdom", rates: ["Standard (3-5 days) \u2014 \xA34.95", "Express (1-2 days) \u2014 \xA39.95", "Free over \xA3150"] },
  { zone: "European Union", rates: ["Standard (5-7 days) \u2014 \xA312.95", "Express (2-3 days) \u2014 \xA319.95"] },
  { zone: "United States", rates: ["Standard (7-10 days) \u2014 \xA314.95", "Express (3-5 days) \u2014 \xA324.95"] },
  { zone: "Rest of World", rates: ["Standard (10-14 days) \u2014 \xA318.95"] }
];
const taxRates = [
  { region: "United Kingdom", rate: "20%", type: "VAT" },
  { region: "European Union", rate: "19-25%", type: "VAT" },
  { region: "United States", rate: "Varies by state", type: "Sales Tax" },
  { region: "Canada", rate: "5-15%", type: "GST/HST" }
];
const sessions = [
  { device: "MacBook Pro \u2014 Chrome", location: "London, UK", time: "Active now", current: true },
  { device: "iPhone 15 \u2014 Safari", location: "London, UK", time: "2 hours ago", current: false }
];
const InputField = ({ label, value, type = "text", placeholder = "" }) => <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input
  type={type}
  defaultValue={value}
  placeholder={placeholder}
  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] transition-colors"
/>
  </div>;
const Toggle = ({ label, description, defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => setOn(!on)} className={`text-2xl transition-colors ${on ? "text-[#2d4a3e]" : "text-gray-300"}`}>
        {on ? <FiToggleRight /> : <FiToggleLeft />}
      </button>
    </div>;
};
const SaveButton = () => {
  const [saved, setSaved] = useState(false);
  const handleSave = async () => {
    try {
      await settingsApi.upsert("general_settings", { updatedAt: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };
  return (
    <button onClick={handleSave} className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a3e] transition-colors">
      {saved ? "Saved!" : "Save Changes"}
    </button>
  );
};
function GeneralTab() {
  return <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Store Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Store Name" value="Eternal" />
          <InputField label="Store Email" value="hello@eternal.com" type="email" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
            <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white">
              <option>GBP (£) — British Pound</option>
              <option>USD ($) — US Dollar</option>
              <option>EUR (€) — Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
            <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] bg-white">
              <option>Europe/London (GMT+0)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/Paris (GMT+1)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Logo</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-white font-display text-sm tracking-widest">
            E
          </div>
          <div>
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Upload Logo
            </button>
            <p className="text-xs text-gray-400 mt-1.5">PNG, SVG up to 2MB. Recommended: 400×100px</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end"><SaveButton /></div>
    </div>;
}
function ShippingTab() {
  return <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Shipping Zones</h2>
          <button className="text-sm px-3 py-1.5 bg-[#0a0a0a] text-white rounded-lg hover:bg-[#2d4a3e] transition-colors">+ Add Zone</button>
        </div>
        <div className="space-y-3">
          {shippingZones.map((zone) => <div key={zone.zone} className="p-4 border border-gray-100 rounded-xl">
              <p className="font-medium text-gray-900 mb-2">{zone.zone}</p>
              <div className="space-y-1">
                {zone.rates.map((rate) => <p key={rate} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d4a3e] flex-shrink-0" />{rate}
                  </p>)}
              </div>
            </div>)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Free Shipping Threshold</h2>
        <div className="flex items-center gap-3 max-w-xs">
          <span className="text-gray-500 text-sm">Orders over</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
            <input type="number" defaultValue="150" className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e]" />
          </div>
          <span className="text-gray-500 text-sm">get free shipping</span>
        </div>
      </div>
      <div className="flex justify-end"><SaveButton /></div>
    </div>;
}
function TaxTab() {
  return <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tax Rates by Region</h2>
          <button className="text-sm px-3 py-1.5 bg-[#0a0a0a] text-white rounded-lg hover:bg-[#2d4a3e] transition-colors">+ Add Region</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxRates.map((row) => <tr key={row.region} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{row.region}</td>
                <td className="px-4 py-3 text-gray-600">{row.type}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{row.rate}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-[#2d4a3e] hover:underline">Edit</button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Tax Settings</h2>
        <Toggle label="Include tax in product prices" description="Prices displayed will include tax" defaultOn />
        <Toggle label="Display tax breakdown at checkout" defaultOn={false} />
      </div>
      <div className="flex justify-end"><SaveButton /></div>
    </div>;
}
function SecurityTab() {
  return <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Change Password</h2>
        <div className="max-w-md space-y-3">
          <InputField label="Current Password" value="" type="password" placeholder="••••••••" />
          <InputField label="New Password" value="" type="password" placeholder="••••••••" />
          <InputField label="Confirm New Password" value="" type="password" placeholder="••••••••" />
          <button className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a3e] transition-colors">
            Update Password
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2 divide-y divide-gray-100">
        <h2 className="font-semibold text-gray-900 pb-3">Two-Factor Authentication</h2>
        <Toggle label="Enable 2FA" description="Require a verification code on login" defaultOn={false} />
        <Toggle label="Login notifications" description="Email me when a new login is detected" defaultOn />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Active Sessions</h2>
        <div className="space-y-3">
          {sessions.map((s) => <div key={s.device} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.device}</p>
                <p className="text-xs text-gray-500">{s.location} · {s.time}</p>
              </div>
              {s.current ? <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Current</span> : <button className="text-xs text-red-500 hover:underline">Revoke</button>}
            </div>)}
        </div>
      </div>
    </div>;
}
function AppearanceTab() {
  const [dark, setDark] = useState(false);
  const [accent, setAccent] = useState("#2d4a3e");
  const [font, setFont] = useState("Manrope");
  return <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Theme</h2>
        <div className="flex gap-3">
          {[
    { label: "Light", preview: "bg-white border-2", active: !dark },
    { label: "Dark", preview: "bg-[#0a0a0a] border-2", active: dark }
  ].map((t) => <button
    key={t.label}
    onClick={() => setDark(t.label === "Dark")}
    className={`flex-1 max-w-[140px] p-4 rounded-xl border-2 transition-all ${t.active ? "border-[#2d4a3e]" : "border-gray-200 hover:border-gray-300"}`}
  >
              <div className={`h-16 rounded-lg ${t.label === "Dark" ? "bg-[#0a0a0a]" : "bg-gray-100"} mb-2`} />
              <p className="text-sm font-medium text-gray-900">{t.label}</p>
            </button>)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Accent Color</h2>
        <div className="flex items-center gap-3">
          {["#2d4a3e", "#0a0a0a", "#8c8277", "#c9b99a", "#1e3a5f", "#7c3aed"].map((color) => <button
    key={color}
    onClick={() => setAccent(color)}
    className={`w-8 h-8 rounded-full border-2 transition-all ${accent === color ? "border-gray-900 scale-110" : "border-transparent hover:border-gray-300"}`}
    style={{ backgroundColor: color }}
  />)}
          <input
    type="color"
    value={accent}
    onChange={(e) => setAccent(e.target.value)}
    className="w-8 h-8 rounded-full cursor-pointer border border-gray-200"
  />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Admin Font</h2>
        <div className="flex gap-2 flex-wrap">
          {["Manrope", "Inter", "DM Sans", "Geist"].map((f) => <button
    key={f}
    onClick={() => setFont(f)}
    className={`px-4 py-2 text-sm rounded-xl border transition-all ${font === f ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
  >
              {f}
            </button>)}
        </div>
      </div>
      <div className="flex justify-end"><SaveButton /></div>
    </div>;
}
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const tabContent = {
    general: <GeneralTab />,
    shipping: <ShippingTab />,
    tax: <TaxTab />,
    payment: <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Payment Providers</h2>
        {[
      { name: "Stripe", status: "Connected", logo: "\u{1F4B3}" },
      { name: "PayPal", status: "Not connected", logo: "\u{1F17F}" },
      { name: "Apple Pay", status: "Connected", logo: "\u{1F34E}" },
      { name: "Google Pay", status: "Connected", logo: "\u{1F535}" }
    ].map((p) => <div key={p.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.logo}</span>
              <div>
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className={`text-xs ${p.status === "Connected" ? "text-green-600" : "text-gray-400"}`}>{p.status}</p>
              </div>
            </div>
            <button className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {p.status === "Connected" ? "Manage" : "Connect"}
            </button>
          </div>)}
      </div>,
    email: <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Email Notifications</h2>
        <div className="divide-y divide-gray-100">
          {[
      { label: "Order confirmation", description: "Sent when a new order is placed", on: true },
      { label: "Shipping notification", description: "Sent when an order is shipped", on: true },
      { label: "Delivery confirmation", description: "Sent when an order is delivered", on: true },
      { label: "Review request", description: "Sent 7 days after delivery", on: false },
      { label: "Abandoned cart", description: "Sent 1 hour after cart abandonment", on: false }
    ].map((item) => <Toggle key={item.label} label={item.label} description={item.description} defaultOn={item.on} />)}
        </div>
        <div className="flex justify-end"><SaveButton /></div>
      </div>,
    security: <SecurityTab />,
    appearance: <AppearanceTab />
  };
  return <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure your store preferences</p>
      </div>

      {
    /* Tab bar */
  }
      <div className="flex overflow-x-auto gap-1 bg-gray-100 rounded-xl p-1 w-fit max-w-full">
        {tabs.map((tab) => <button
    key={tab.value}
    onClick={() => setActiveTab(tab.value)}
    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>)}
      </div>

      {
    /* Tab Content */
  }
      <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.15 }}
  >
        {tabContent[activeTab]}
      </motion.div>
    </div>;
}
export {
  SettingsPage as default
};
