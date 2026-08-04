import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaInstagram, FaXTwitter, FaPinterest, FaTiktok } from "react-icons/fa6";
const columns = [
  {
    heading: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Sale", href: "/sale" },
      { label: "Lookbook", href: "/lookbook" }
    ]
  },
  {
    heading: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact Us", href: "/contact" }
    ]
  },
  {
    heading: "Company",
    links: [
      { label: "About Eternal", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" }
    ]
  }
];
const socials = [
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaXTwitter, href: "https://x.com", label: "X / Twitter" },
  { icon: FaPinterest, href: "https://pinterest.com", label: "Pinterest" },
  { icon: FaTiktok, href: "https://tiktok.com", label: "TikTok" }
];
function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [focused, setFocused] = useState(false);
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };
  return <footer className="bg-[#0a0a0a] text-[#fafafa]">
      {
    /* Newsletter Banner */
  }
      <div className="border-b border-[#fafafa]/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#c9b99a] mb-2 font-medium">Join the Inner Circle</p>
            <h3 className="font-display text-2xl lg:text-3xl text-[#fafafa]">
              Elevated style, delivered.
            </h3>
            <p className="text-sm text-[#8c8277] mt-2">Early access to new collections, exclusive offers, and editorial stories.</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto lg:min-w-[420px]">
            {subscribed ? <motion.p
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-sm text-[#c9b99a] tracking-wide text-center lg:text-left"
  >
                Thank you for subscribing. Welcome to Eternal.
              </motion.p> : <div className={`flex border transition-colors duration-200 ${focused ? "border-[#c9b99a]" : "border-[#fafafa]/20"}`}>
                <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    placeholder="Your email address"
    className="flex-1 bg-transparent px-5 py-3.5 text-sm text-[#fafafa] placeholder:text-[#8c8277] focus:outline-none"
    required
  />
                <button
    type="submit"
    className="px-6 py-3.5 bg-[#c9b99a] text-[#0a0a0a] text-xs tracking-widest uppercase font-semibold hover:bg-[#f0ebe2] transition-colors whitespace-nowrap"
  >
                  Subscribe
                </button>
              </div>}
          </form>
        </div>
      </div>

      {
    /* Main footer columns */
  }
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {
    /* Brand column */
  }
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="font-display tracking-[0.25em] text-lg text-[#fafafa] hover:text-[#c9b99a] transition-colors">
              ETERNAL
            </Link>
            <p className="mt-4 text-sm text-[#8c8277] leading-relaxed max-w-xs">
              Timeless luxury for the considered wardrobe. Crafted with intention, worn for a lifetime.
            </p>

            {
    /* Social icons */
  }
            <div className="flex items-center gap-4 mt-8">
              {socials.map(({ icon: Icon, href, label }) => <a
    key={label}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 flex items-center justify-center border border-[#fafafa]/15 text-[#8c8277] hover:border-[#c9b99a] hover:text-[#c9b99a] transition-all duration-200"
  >
                  <Icon size={16} />
                </a>)}
            </div>
          </div>

          {
    /* Link columns */
  }
          {columns.map((col) => <div key={col.heading}>
              <h4 className="text-xs tracking-widest uppercase text-[#fafafa] font-semibold mb-6">{col.heading}</h4>
              <ul className="space-y-3.5">
                {col.links.map((link) => <li key={link.label}>
                    <Link
    to={link.href}
    className="text-sm text-[#8c8277] hover:text-[#c9b99a] transition-colors link-underline"
  >
                      {link.label}
                    </Link>
                  </li>)}
              </ul>
            </div>)}
        </div>
      </div>

      {
    /* Bottom bar */
  }
      <div className="border-t border-[#fafafa]/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8c8277]">
            &copy; 2024 Eternal. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-[#8c8277] hover:text-[#c9b99a] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-[#8c8277] hover:text-[#c9b99a] transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-xs text-[#8c8277] hover:text-[#c9b99a] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>;
}
export {
  Footer as default
};
