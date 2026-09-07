import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiSend, FiToggleLeft, FiToggleRight, FiX, FiMail, FiDownload } from "react-icons/fi";
import { marketingApi } from "../../services/api";

const TABS = ["Campaigns", "Newsletter", "Banners"];
const AUDIENCES = ["SUBSCRIBERS", "CUSTOMERS", "ALL"];
const POSITIONS = ["TOP_BAR", "HERO", "CATEGORY", "SALE", "FOOTER"];

const statusColor = (s) =>
  ({ DRAFT: "bg-amber-50 text-amber-600", SCHEDULED: "bg-blue-50 text-blue-600", SENDING: "bg-purple-50 text-purple-600", COMPLETED: "bg-[#2d4a3e]/10 text-[#2d4a3e]", CANCELLED: "bg-gray-100 text-gray-500", ACTIVE: "bg-[#2d4a3e]/10 text-[#2d4a3e]", UNSUBSCRIBED: "bg-gray-100 text-gray-500" }[s] || "bg-gray-100 text-gray-500");

const emptyCampaign = { name: "", type: "EMAIL", subject: "", body: "", audience: "SUBSCRIBERS", scheduledAt: "" };
const emptyBanner = { position: "TOP_BAR", title: "", content: "", ctaText: "", ctaLink: "", startDate: "", endDate: "", isActive: true, sortOrder: 0 };

function MarketingPage() {
  const [tab, setTab] = useState("Campaigns");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [banners, setBanners] = useState([]);
  const [subscribers, setSubscribers] = useState({ activeCount: 0, subscribers: [] });
  const [loading, setLoading] = useState(true);

  const [campaignForm, setCampaignForm] = useState(null); // null | {…} (id present = edit)
  const [bannerForm, setBannerForm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [c, b, s] = await Promise.all([
        marketingApi.getCampaigns().catch(() => ({ data: [] })),
        marketingApi.getBanners().catch(() => ({ data: [] })),
        marketingApi.getSubscribers().catch(() => ({ data: { activeCount: 0, subscribers: [] } })),
      ]);
      setCampaigns(c.data || []);
      setBanners(b.data || []);
      setSubscribers(s.data || { activeCount: 0, subscribers: [] });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, msg) => {
    setBusy(true); setError("");
    try { await fn(); await load(); }
    catch (err) { setError(err.message || msg || "Something went wrong"); }
    finally { setBusy(false); }
  };

  // ── Campaigns ──────────────────────────────────────────────────────────────
  const saveCampaign = () => run(async () => {
    const payload = { ...campaignForm, scheduledAt: campaignForm.scheduledAt || null };
    if (campaignForm.id) await marketingApi.updateCampaign(campaignForm.id, payload);
    else await marketingApi.createCampaign(payload);
    setCampaignForm(null);
  }, "Failed to save campaign");

  const sendCampaign = (id) => run(() => marketingApi.sendCampaign(id), "Failed to send campaign");
  const deleteCampaign = (id) => run(() => marketingApi.deleteCampaign(id), "Failed to delete campaign");

  // ── Banners ────────────────────────────────────────────────────────────────
  const saveBanner = () => run(async () => {
    const payload = { ...bannerForm, startDate: bannerForm.startDate || null, endDate: bannerForm.endDate || null };
    if (bannerForm.id) await marketingApi.updateBanner(bannerForm.id, payload);
    else await marketingApi.createBanner(payload);
    setBannerForm(null);
  }, "Failed to save banner");
  const toggleBanner = (b) => run(() => marketingApi.updateBanner(b.id, { isActive: !b.isActive }));
  const deleteBanner = (id) => run(() => marketingApi.deleteBanner(id), "Failed to delete banner");

  const exportSubscribers = () => {
    const rows = ["email,status,source,subscribed"].concat(
      subscribers.subscribers.map((s) => `${s.email},${s.status},${s.source},${s.createdAt}`)
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Marketing</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Campaigns, newsletter and storefront banners</p>
        </div>
        {tab === "Campaigns" && <button onClick={() => setCampaignForm({ ...emptyCampaign })} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors">
          <FiPlus size={16} /> New Campaign
        </button>}
        {tab === "Banners" && <button onClick={() => setBannerForm({ ...emptyBanner })} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors">
          <FiPlus size={16} /> New Banner
        </button>}
      </div>

      {error && <div className="px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}>{t}</button>)}
      </div>

      {loading ? <p className="text-sm text-gray-400 py-10 text-center">Loading…</p> : <>

      {/* ── Campaigns ── */}
      {tab === "Campaigns" && <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: campaigns.length },
            { label: "Drafts", value: campaigns.filter((c) => c.status === "DRAFT").length },
            { label: "Sent", value: campaigns.filter((c) => c.status === "COMPLETED").length },
            { label: "Recipients Reached", value: campaigns.reduce((s, c) => s + (c.recipientCount || 0), 0).toLocaleString() },
          ].map((s) => <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-2xl font-display text-[#0a0a0a]">{s.value}</p>
              <p className="text-xs text-[#8c8277] mt-1">{s.label}</p>
            </div>)}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              {["Name", "Type", "Audience", "Recipients", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {campaigns.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No campaigns yet.</td></tr>}
              {campaigns.map((c) => <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30">
                  <td className="px-4 py-3 font-medium text-[#0a0a0a]">{c.name}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.type}</td>
                  <td className="px-4 py-3 text-[#8c8277] text-xs">{c.audience}</td>
                  <td className="px-4 py-3 text-[#8c8277]">{c.recipientCount || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>{c.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {["DRAFT", "SCHEDULED"].includes(c.status) && c.type === "EMAIL" && <button onClick={() => sendCampaign(c.id)} disabled={busy} className="p-1.5 text-[#8c8277] hover:text-[#2d4a3e] hover:bg-[#2d4a3e]/10 rounded-md" title="Send now"><FiSend size={13} /></button>}
                      {!["SENDING", "COMPLETED"].includes(c.status) && <button onClick={() => setCampaignForm({ ...c, scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 10) : "" })} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md"><FiEdit2 size={13} /></button>}
                      <button onClick={() => deleteCampaign(c.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md"><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>}

      {/* ── Newsletter ── */}
      {tab === "Newsletter" && <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5"><p className="text-2xl font-display text-[#0a0a0a]">{subscribers.subscribers.length}</p><p className="text-xs text-[#8c8277] mt-1">Total Subscribers</p></div>
          <div className="bg-white border border-gray-100 rounded-xl p-5"><p className="text-2xl font-display text-[#2d4a3e]">{subscribers.activeCount}</p><p className="text-xs text-[#8c8277] mt-1">Active</p></div>
          <div className="bg-white border border-gray-100 rounded-xl p-5"><p className="text-2xl font-display text-red-500">{subscribers.subscribers.length - subscribers.activeCount}</p><p className="text-xs text-[#8c8277] mt-1">Unsubscribed</p></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-sm text-[#0a0a0a]">Subscribers</p>
            <button onClick={exportSubscribers} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#8c8277]"><FiDownload size={12} /> Export CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">{["Email", "Source", "Status", "Subscribed"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {subscribers.subscribers.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No subscribers yet.</td></tr>}
              {subscribers.subscribers.map((s) => <tr key={s.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-[#0a0a0a]">{s.email}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 bg-[#f0ebe2] text-[#8c8277] rounded-full">{s.source}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-5 py-3 text-[#8c8277] text-xs">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>}

      {/* ── Banners ── */}
      {tab === "Banners" && <div className="space-y-3">
        {banners.length === 0 && <p className="text-sm text-gray-400 py-8 text-center border border-gray-100 rounded-xl">No banners yet.</p>}
        {banners.map((b) => <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-[#f0ebe2] text-[#8c8277] rounded-full font-medium">{b.position}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-gray-100 text-gray-500"}`}>{b.isActive ? "Active" : "Inactive"}</span>
                </div>
                <h3 className="font-semibold text-[#0a0a0a]">{b.title}</h3>
                {b.content && <p className="text-sm text-[#8c8277] mt-0.5">{b.content}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-[#8c8277]">
                  {b.ctaText && <span>CTA: <span className="text-[#0a0a0a] font-medium">{b.ctaText}</span> → {b.ctaLink}</span>}
                  {b.startDate && <span>{b.startDate} — {b.endDate || "∞"}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleBanner(b)} disabled={busy} className={`text-xl ${b.isActive ? "text-[#2d4a3e]" : "text-gray-300"}`}>{b.isActive ? <FiToggleRight /> : <FiToggleLeft />}</button>
                <button onClick={() => setBannerForm({ ...b, startDate: b.startDate || "", endDate: b.endDate || "" })} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md"><FiEdit2 size={14} /></button>
                <button onClick={() => deleteBanner(b.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>)}
      </div>}

      </>}

      {/* ── Campaign modal ── */}
      <AnimatePresence>
        {campaignForm && <Modal onClose={() => setCampaignForm(null)} title={campaignForm.id ? "Edit Campaign" : "New Campaign"}>
          <Field label="Name"><input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><select value={campaignForm.type} onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })} className={inputCls}><option>EMAIL</option><option>SMS</option><option>PUSH</option></select></Field>
            <Field label="Audience"><select value={campaignForm.audience} onChange={(e) => setCampaignForm({ ...campaignForm, audience: e.target.value })} className={inputCls}>{AUDIENCES.map((a) => <option key={a}>{a}</option>)}</select></Field>
          </div>
          <Field label="Subject"><input value={campaignForm.subject} onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })} className={inputCls} /></Field>
          <Field label="Body (HTML allowed)"><textarea rows={4} value={campaignForm.body} onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })} className={`${inputCls} resize-none`} /></Field>
          <Field label="Schedule (optional)"><input type="date" value={campaignForm.scheduledAt} onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })} className={inputCls} /></Field>
          <ModalActions onSave={saveCampaign} onCancel={() => setCampaignForm(null)} busy={busy} />
        </Modal>}
      </AnimatePresence>

      {/* ── Banner modal ── */}
      <AnimatePresence>
        {bannerForm && <Modal onClose={() => setBannerForm(null)} title={bannerForm.id ? "Edit Banner" : "New Banner"}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position"><select value={bannerForm.position} onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })} className={inputCls}>{POSITIONS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Sort order"><input type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></Field>
          </div>
          <Field label="Title"><input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className={inputCls} /></Field>
          <Field label="Subtitle"><input value={bannerForm.content} onChange={(e) => setBannerForm({ ...bannerForm, content: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA text"><input value={bannerForm.ctaText} onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })} className={inputCls} /></Field>
            <Field label="CTA link"><input value={bannerForm.ctaLink} onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })} placeholder="/shop" className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><input type="date" value={bannerForm.startDate} onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })} className={inputCls} /></Field>
            <Field label="End date"><input type="date" value={bannerForm.endDate} onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })} className={inputCls} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="rounded border-gray-300 text-[#2d4a3e]" /> Active</label>
          <ModalActions onSave={saveBanner} onCancel={() => setBannerForm(null)} busy={busy} />
        </Modal>}
      </AnimatePresence>
    </div>;
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]";
const Field = ({ label, children }) => <div><label className="text-xs text-[#8c8277] font-medium block mb-1">{label}</label>{children}</div>;
const Modal = ({ title, onClose, children }) => (
  <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
        <p className="font-semibold text-sm text-[#0a0a0a]">{title}</p>
        <button onClick={onClose} className="text-[#8c8277] hover:text-[#0a0a0a]"><FiX size={16} /></button>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </motion.div>
  </>
);
const ModalActions = ({ onSave, onCancel, busy }) => (
  <div className="flex gap-3 pt-2">
    <button onClick={onSave} disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors disabled:opacity-60">
      <FiMail size={14} /> {busy ? "Saving…" : "Save"}
    </button>
    <button onClick={onCancel} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
  </div>
);

export {
  MarketingPage as default
};
