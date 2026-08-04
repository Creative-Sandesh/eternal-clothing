import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiUpload, FiToggleLeft, FiToggleRight, FiMail, FiMessageSquare, FiBell } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const TABS = ["Campaigns", "Newsletter", "Banners"];
const campaigns = [
  { id: "1", name: "Winter Edit Launch", type: "Email", status: "Active", audience: 4200, openRate: 31.2, clickRate: 9.4, date: "2025-01-10" },
  { id: "2", name: "Black Friday Preview", type: "Email", status: "Scheduled", audience: 8400, openRate: 0, clickRate: 0, date: "2025-11-28" },
  { id: "3", name: "New Arrivals SMS", type: "SMS", status: "Completed", audience: 2100, openRate: 72.1, clickRate: 18.3, date: "2025-01-05" }
];
const campaignStats = [
  { label: "Active Campaigns", value: "3" },
  { label: "Emails Sent", value: "12,400" },
  { label: "Open Rate", value: "28.4%" },
  { label: "Click Rate", value: "8.2%" }
];
const subscribers = [
  { id: "1", email: "amara.osei@email.com", date: "2024-11-01", source: "Checkout", status: "Active" },
  { id: "2", email: "sofia.a@email.com", date: "2024-12-15", source: "Website", status: "Active" },
  { id: "3", email: "marcus.chen@email.com", date: "2025-01-03", source: "Social", status: "Active" },
  { id: "4", email: "lena.mayer@email.com", date: "2024-10-22", source: "Website", status: "Active" },
  { id: "5", email: "ryan.torres@email.com", date: "2024-09-14", source: "Checkout", status: "Active" }
];
const growthData = [
  { week: "W1", subscribers: 7800 },
  { week: "W2", subscribers: 7940 },
  { week: "W3", subscribers: 8050 },
  { week: "W4", subscribers: 8120 },
  { week: "W5", subscribers: 8210 },
  { week: "W6", subscribers: 8310 },
  { week: "W7", subscribers: 8380 },
  { week: "W8", subscribers: 8432 }
];
const statusColors = {
  Active: "bg-[#2d4a3e]/10 text-[#2d4a3e]",
  Scheduled: "bg-blue-50 text-blue-600",
  Completed: "bg-gray-100 text-gray-500",
  Draft: "bg-amber-50 text-amber-600"
};
const typeIcons = {
  Email: <FiMail size={12} />,
  SMS: <FiMessageSquare size={12} />,
  Push: <FiBell size={12} />
};
const initialBanners = [
  { id: "1", position: "Top Bar", title: "Free Shipping on Orders Over \xA3200", content: "", cta: "Shop Now", ctaLink: "/shop", active: true, startDate: "2025-01-01", endDate: "2025-03-31" },
  { id: "2", position: "Hero", title: "Winter Edit", content: "New Arrivals \u2014 Curated for the Season", cta: "Explore", ctaLink: "/collections/essentials", active: true, startDate: "2025-01-01", endDate: "2025-02-28" },
  { id: "3", position: "Category Page", title: "Archive Sale", content: "Up to 30% Off Selected Pieces", cta: "Shop the Sale", ctaLink: "/sale", active: true, startDate: "2025-01-05", endDate: "2025-01-31" }
];
const positions = ["Top Bar", "Hero", "Category Page", "Sale Page", "Footer"];
function MarketingPage() {
  const [tab, setTab] = useState("Campaigns");
  const [banners, setBanners] = useState(initialBanners);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    position: "Top Bar",
    title: "",
    content: "",
    cta: "",
    ctaLink: "",
    startDate: "",
    endDate: ""
  });
  function toggleBanner(id) {
    setBanners(banners.map((b) => b.id === id ? { ...b, active: !b.active } : b));
  }
  function deleteBanner(id) {
    setBanners(banners.filter((b) => b.id !== id));
  }
  function addBanner() {
    if (!bannerForm.title) return;
    setBanners([...banners, { ...bannerForm, id: Date.now().toString(), active: true }]);
    setBannerForm({ position: "Top Bar", title: "", content: "", cta: "", ctaLink: "", startDate: "", endDate: "" });
    setShowBannerForm(false);
  }
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Marketing</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Campaigns, newsletter and storefront banners</p>
        </div>
        {tab === "Campaigns" && <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors">
            <FiPlus size={16} /> Create Campaign
          </button>}
        {tab === "Banners" && <button onClick={() => setShowBannerForm(!showBannerForm)} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors">
            <FiPlus size={16} /> Add Banner
          </button>}
      </div>

      {
    /* Tabs */
  }
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => <button
    key={t}
    onClick={() => setTab(t)}
    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}
  >
            {t}
          </button>)}
      </div>

      {
    /* Campaigns Tab */
  }
      {tab === "Campaigns" && <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {campaignStats.map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
                <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
              </div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-[#0a0a0a] text-sm leading-snug">{c.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#8c8277] mb-4">
                  {typeIcons[c.type]}
                  <span>{c.type}</span>
                  <span className="mx-1">·</span>
                  <span>{c.audience.toLocaleString()} recipients</span>
                </div>
                {c.status !== "Scheduled" && <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-[#8c8277] uppercase tracking-wider">Open Rate</p>
                      <p className="text-sm font-semibold text-[#0a0a0a] mt-0.5">{c.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8c8277] uppercase tracking-wider">Click Rate</p>
                      <p className="text-sm font-semibold text-[#0a0a0a] mt-0.5">{c.clickRate}%</p>
                    </div>
                  </div>}
                <p className="text-xs text-[#8c8277] mt-3">{c.date}</p>
              </div>)}
          </div>
        </div>}

      {
    /* Newsletter Tab */
  }
      {tab === "Newsletter" && <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-2xl font-display text-[#0a0a0a]">8,432</p>
              <p className="text-xs text-[#8c8277] mt-1">Total Subscribers</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-2xl font-display text-[#2d4a3e]">+124</p>
              <p className="text-xs text-[#8c8277] mt-1">New This Week</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-2xl font-display text-red-500">-12</p>
              <p className="text-xs text-[#8c8277] mt-1">Unsubscribed This Week</p>
            </div>
          </div>

          {
    /* Growth chart */
  }
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-sm text-[#0a0a0a] mb-4">Subscriber Growth (8 weeks)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe2" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8c8277" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8c8277" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
    contentStyle={{ background: "#fff", border: "1px solid #f0ebe2", borderRadius: "8px", fontSize: "12px" }}
    formatter={(v) => [typeof v === "number" ? v.toLocaleString() : String(v), "Subscribers"]}
  />
                <Line type="monotone" dataKey="subscribers" stroke="#2d4a3e" strokeWidth={2} dot={{ fill: "#2d4a3e", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {
    /* Subscribers table */
  }
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-sm text-[#0a0a0a]">Subscribers</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#8c8277]">
                  <FiUpload size={12} /> Import
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#8c8277]">
                  <FiDownload size={12} /> Export
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Email", "Date Subscribed", "Source", "Status"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3 text-[#0a0a0a]">{s.email}</td>
                    <td className="px-5 py-3 text-[#8c8277] text-xs">{s.date}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-[#f0ebe2] text-[#8c8277] rounded-full">{s.source}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2d4a3e]/10 text-[#2d4a3e]">{s.status}</span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {
    /* Banners Tab */
  }
      {tab === "Banners" && <div className="space-y-4">
          <AnimatePresence>
            {showBannerForm && <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
                <p className="font-semibold text-sm text-[#0a0a0a]">New Banner</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">Position</label>
                    <select
    value={bannerForm.position}
    onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white"
  >
                      {positions.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">Title</label>
                    <input
    value={bannerForm.title}
    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
    placeholder="Banner headline"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">Subtitle</label>
                    <input
    value={bannerForm.content}
    onChange={(e) => setBannerForm({ ...bannerForm, content: e.target.value })}
    placeholder="Supporting text"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">CTA Text</label>
                    <input
    value={bannerForm.cta}
    onChange={(e) => setBannerForm({ ...bannerForm, cta: e.target.value })}
    placeholder="Shop Now"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">CTA Link</label>
                    <input
    value={bannerForm.ctaLink}
    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
    placeholder="/shop"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                  </div>
                  <div>
                    <label className="text-xs text-[#8c8277] font-medium block mb-1">Schedule</label>
                    <div className="flex gap-2">
                      <input
    type="date"
    value={bannerForm.startDate}
    onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
    className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#2d4a3e]"
  />
                      <span className="text-[#8c8277] self-center text-xs">to</span>
                      <input
    type="date"
    value={bannerForm.endDate}
    onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
    className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#2d4a3e]"
  />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={addBanner} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                    Save Banner
                  </button>
                  <button onClick={() => setShowBannerForm(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>}
          </AnimatePresence>

          <div className="space-y-3">
            {banners.map((b) => <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-[#f0ebe2] text-[#8c8277] rounded-full font-medium">{b.position}</span>
                      {b.active ? <span className="text-xs px-2 py-0.5 bg-[#2d4a3e]/10 text-[#2d4a3e] rounded-full">Active</span> : <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Inactive</span>}
                    </div>
                    <h3 className="font-semibold text-[#0a0a0a]">{b.title}</h3>
                    {b.content && <p className="text-sm text-[#8c8277] mt-0.5">{b.content}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#8c8277]">
                      {b.cta && <span>CTA: <span className="text-[#0a0a0a] font-medium">{b.cta}</span> → {b.ctaLink}</span>}
                      {b.startDate && <span>{b.startDate} — {b.endDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleBanner(b.id)} className={`text-xl transition-colors ${b.active ? "text-[#2d4a3e]" : "text-gray-300"}`}>
                      {b.active ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                    <button className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => deleteBanner(b.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>}
    </div>;
}
export {
  MarketingPage as default
};
