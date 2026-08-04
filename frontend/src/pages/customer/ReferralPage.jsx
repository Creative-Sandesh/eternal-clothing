import { useState } from "react";
import { FiCopy, FiCheck, FiMessageCircle, FiMail, FiTwitter } from "react-icons/fi";
const referralLink = "https://eternal.com/ref/MARCUS-2024";
const stats = [
  { label: "Referrals Sent", value: "5" },
  { label: "Signed Up", value: "3" },
  { label: "Orders Made", value: "2" },
  { label: "Earned", value: "\xA340" }
];
const steps = [
  { n: "01", title: "Share your link", desc: "Send your unique referral link to friends and family who love fashion." },
  { n: "02", title: "They sign up", desc: "Your friend creates an Eternal account using your link and makes their first order." },
  { n: "03", title: "You both earn", desc: "You receive \xA320 credit and your friend gets \xA320 off their first order. Everyone wins." }
];
const history = [
  { email: "s.morris@email.com", date: "12 Jan 2024", status: "Purchased", reward: "\xA320" },
  { email: "j.chen@email.com", date: "28 Nov 2023", status: "Purchased", reward: "\xA320" },
  { email: "l.baker@email.com", date: "14 Oct 2023", status: "Signed Up", reward: "\u2014" },
  { email: "r.hayes@email.com", date: "2 Sep 2023", status: "Pending", reward: "\u2014" },
  { email: "n.walsh@email.com", date: "30 Aug 2023", status: "Pending", reward: "\u2014" }
];
const statusColors = {
  Purchased: { bg: "#2d4a3e", text: "#fafafa" },
  "Signed Up": { bg: "#c9b99a", text: "#fafafa" },
  Pending: { bg: "#f0ebe2", text: "#8c8277" }
};
function ReferralPage() {
  const [copied, setCopied] = useState(false);
  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    });
  }
  function shareVia(type) {
    const msg = encodeURIComponent(`Get \xA320 off your first Eternal order with my referral link: ${referralLink}`);
    if (type === "whatsapp") window.open(`https://wa.me/?text=${msg}`, "_blank");
    if (type === "email") window.open(`mailto:?subject=You%27ve%20been%20invited%20to%20Eternal&body=${msg}`, "_blank");
    if (type === "twitter") window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
  }
  return <div style={{ fontFamily: "Manrope, sans-serif" }}>
      {
    /* Hero banner */
  }
      <div
    className="p-8 sm:p-12 mb-8 text-center"
    style={{ backgroundColor: "#0a0a0a" }}
  >
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#c9b99a" }}>Referral Programme</p>
        <h1 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: "#fafafa" }}>Give £20, Get £20</h1>
        <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#8c8277" }}>
          Invite a friend to Eternal. When they make their first purchase, they get £20 off and you earn £20 credit — automatically.
        </p>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => <div key={s.label} className="p-4 border text-center" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
            <p className="font-display text-2xl mb-1" style={{ color: "#0a0a0a" }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#8c8277" }}>{s.label}</p>
          </div>)}
      </div>

      {
    /* Referral link card */
  }
      <div className="p-6 border mb-8" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#8c8277" }}>Your Referral Link</p>
        <div className="flex gap-2">
          <div
    className="flex-1 px-4 py-3 border text-sm truncate"
    style={{ borderColor: "#f0ebe2", color: "#8c8277", backgroundColor: "#f0ebe2" }}
  >
            {referralLink}
          </div>
          <button
    type="button"
    onClick={copyLink}
    className="flex items-center gap-2 px-5 py-3 text-xs tracking-widest uppercase transition-colors flex-shrink-0"
    style={{ backgroundColor: copied ? "#2d4a3e" : "#0a0a0a", color: "#fafafa" }}
  >
            {copied ? <><FiCheck size={13} /> Copied!</> : <><FiCopy size={13} /> Copy</>}
          </button>
        </div>

        {
    /* Share via */
  }
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#8c8277" }}>Share via</p>
          <div className="flex gap-3">
            <button
    type="button"
    onClick={() => shareVia("whatsapp")}
    className="flex items-center gap-2 px-4 py-2.5 border text-xs tracking-widest uppercase transition-colors hover:bg-[#25D366] hover:text-[#fafafa] hover:border-[#25D366]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277" }}
  >
              <FiMessageCircle size={14} /> WhatsApp
            </button>
            <button
    type="button"
    onClick={() => shareVia("email")}
    className="flex items-center gap-2 px-4 py-2.5 border text-xs tracking-widest uppercase transition-colors hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277" }}
  >
              <FiMail size={14} /> Email
            </button>
            <button
    type="button"
    onClick={() => shareVia("twitter")}
    className="flex items-center gap-2 px-4 py-2.5 border text-xs tracking-widest uppercase transition-colors hover:bg-[#1DA1F2] hover:text-[#fafafa] hover:border-[#1DA1F2]"
    style={{ borderColor: "#f0ebe2", color: "#8c8277" }}
  >
              <FiTwitter size={14} /> Twitter
            </button>
          </div>
        </div>
      </div>

      {
    /* How it works */
  }
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: "#8c8277" }}>How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step) => <div key={step.n} className="p-5 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
              <p className="font-display text-3xl mb-3" style={{ color: "#f0ebe2" }}>{step.n}</p>
              <p className="text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>{step.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#8c8277" }}>{step.desc}</p>
            </div>)}
        </div>
      </div>

      {
    /* Referral history */
  }
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8c8277" }}>Referral History</h2>
        <div className="border overflow-hidden" style={{ borderColor: "#f0ebe2" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f0ebe2" }}>
                {["Email Invited", "Date", "Status", "Reward"].map((h) => <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#8c8277" }}>
                    {h}
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => <tr key={row.email} style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#f0ebe2" }}>
                  <td className="px-4 py-3 text-sm" style={{ color: "#0a0a0a" }}>{row.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#8c8277" }}>{row.date}</td>
                  <td className="px-4 py-3">
                    <span
    className="text-[10px] px-2 py-1 uppercase tracking-widest font-semibold"
    style={{ backgroundColor: statusColors[row.status].bg, color: statusColors[row.status].text }}
  >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: row.reward !== "\u2014" ? "#2d4a3e" : "#8c8277" }}>
                    {row.reward}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Terms */
  }
      <div className="p-4 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#8c8277" }}>
          <span className="font-semibold" style={{ color: "#0a0a0a" }}>Terms: </span>
          Credit is awarded once the referred friend completes their first order over £75. Credit expires 12 months from issue.
          Referral credits cannot be combined with other promotional discounts. Self-referrals are not permitted.
        </p>
      </div>
    </div>;
}
export {
  ReferralPage as default
};
