import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSend, FiMapPin, FiMail, FiPhone, FiClock } from "react-icons/fi";
const subjects = [
  "Order Enquiry",
  "Returns & Exchanges",
  "Product Information",
  "Sizing Advice",
  "Press & Collaboration",
  "Other"
];
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };
  const inputClass = "w-full bg-transparent outline-none py-3 text-sm";
  const inputStyle = { color: "#0a0a0a", fontFamily: "Manrope, sans-serif", caretColor: "#2d4a3e" };
  const labelStyle = { color: "#8c8277", fontFamily: "Manrope, sans-serif" };
  return <div style={{ backgroundColor: "#fafafa" }}>
      {
    /* Hero */
  }
      <div className="py-20 px-6 text-center border-b" style={{ borderColor: "#f0ebe2", backgroundColor: "#f0ebe2" }}>
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Get in Touch
          </p>
          <h1 className="font-display text-5xl" style={{ color: "#0a0a0a" }}>Contact Us</h1>
        </motion.div>
      </div>

      {
    /* Split content */
  }
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {
    /* Form */
  }
          <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.1 }}
  >
            <h2 className="font-display text-3xl mb-8" style={{ color: "#0a0a0a" }}>Send a Message</h2>

            {sent ? <div
    className="p-8 text-center"
    style={{ backgroundColor: "#f0ebe2" }}
  >
                <p className="font-display text-2xl mb-3" style={{ color: "#0a0a0a" }}>
                  Message received
                </p>
                <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                  Thank you for reaching out. A member of our team will respond within 24 hours.
                </p>
                <button
    type="button"
    onClick={() => {
      setSent(false);
      setForm({ name: "", email: "", subject: "", message: "" });
    }}
    className="mt-6 text-xs uppercase tracking-widest underline underline-offset-2"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
                  Send another message
                </button>
              </div> : <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>
                      Full Name
                    </label>
                    <div className="border-b" style={{ borderColor: "#8c8277" }}>
                      <input
    type="text"
    name="name"
    value={form.name}
    onChange={handleChange}
    required
    placeholder="Aria Laurent"
    className={inputClass}
    style={inputStyle}
  />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>
                      Email Address
                    </label>
                    <div className="border-b" style={{ borderColor: "#8c8277" }}>
                      <input
    type="email"
    name="email"
    value={form.email}
    onChange={handleChange}
    required
    placeholder="your@email.com"
    className={inputClass}
    style={inputStyle}
  />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>
                    Subject
                  </label>
                  <div className="border-b" style={{ borderColor: "#8c8277" }}>
                    <select
    name="subject"
    value={form.subject}
    onChange={handleChange}
    required
    className={inputClass + " cursor-pointer"}
    style={{ ...inputStyle, appearance: "none" }}
  >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>
                    Message
                  </label>
                  <div className="border-b" style={{ borderColor: "#8c8277" }}>
                    <textarea
    name="message"
    value={form.message}
    onChange={handleChange}
    required
    rows={5}
    placeholder="How can we help you?"
    className={inputClass + " resize-none"}
    style={inputStyle}
  />
                  </div>
                </div>

                <button
    type="submit"
    disabled={loading}
    className="inline-flex items-center gap-3 px-10 py-4 text-xs uppercase tracking-widest transition-opacity duration-200"
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif",
      opacity: loading ? 0.6 : 1
    }}
  >
                  <FiSend size={14} />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>}
          </motion.div>

          {
    /* Contact info */
  }
          <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="space-y-8"
  >
            <h2 className="font-display text-3xl" style={{ color: "#0a0a0a" }}>Our Details</h2>

            <div className="space-y-6">
              {[
    {
      icon: <FiMapPin size={16} />,
      label: "Studio Address",
      value: "88 Redchurch Street\nShoreditch, London E2 7DP\nUnited Kingdom"
    },
    {
      icon: <FiMail size={16} />,
      label: "Email",
      value: "hello@eternal.com"
    },
    {
      icon: <FiPhone size={16} />,
      label: "Phone",
      value: "+44 (0) 20 7946 0123"
    },
    {
      icon: <FiClock size={16} />,
      label: "Hours",
      value: "Mon \u2013 Fri: 9:00am \u2013 6:00pm GMT\nSat: 10:00am \u2013 4:00pm GMT\nSun: Closed"
    }
  ].map((item) => <div key={item.label} className="flex gap-4">
                  <div
    className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5"
    style={{ backgroundColor: "#f0ebe2", color: "#2d4a3e" }}
  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                      {item.label}
                    </p>
                    <p
    className="text-sm leading-relaxed whitespace-pre-line"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
                      {item.value}
                    </p>
                  </div>
                </div>)}
            </div>

            {
    /* Map placeholder */
  }
            <div
    className="relative flex items-center justify-center"
    style={{ backgroundColor: "#2d4a3e", height: 220 }}
  >
              <div className="text-center">
                <FiMapPin size={28} style={{ color: "#c9b99a" }} className="mx-auto mb-3" />
                <p className="font-display text-xl" style={{ color: "#fafafa" }}>Visit Our Studio</p>
                <p className="text-xs mt-2" style={{ color: "rgba(250,250,250,0.5)", fontFamily: "Manrope, sans-serif" }}>
                  88 Redchurch Street, London
                </p>
              </div>
            </div>

            {
    /* FAQ link */
  }
            <div className="pt-2">
              <p className="text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
                Looking for quick answers?{" "}
                <Link
    to="/faq"
    className="underline underline-offset-2 transition-colors"
    style={{ color: "#0a0a0a" }}
  >
                  Visit our FAQ
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}
export {
  ContactPage as default
};
