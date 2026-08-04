import { useState, Suspense } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiStar,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiCreditCard,
  FiMessageSquare,
  FiLock,
  FiGift
} from "react-icons/fi";
const navItems = [
  { to: "/account", icon: <FiGrid size={16} />, label: "Dashboard", end: true },
  { to: "/account/orders", icon: <FiPackage size={16} />, label: "My Orders" },
  { to: "/account/wishlist", icon: <FiHeart size={16} />, label: "Wishlist" },
  { to: "/account/addresses", icon: <FiMapPin size={16} />, label: "Addresses" },
  { to: "/account/loyalty", icon: <FiStar size={16} />, label: "Loyalty Points" },
  { to: "/account/notifications", icon: <FiBell size={16} />, label: "Notifications" },
  { to: "/account/payment-methods", icon: <FiCreditCard size={16} />, label: "Payment Methods" },
  { to: "/account/reviews", icon: <FiMessageSquare size={16} />, label: "My Reviews" },
  { to: "/account/change-password", icon: <FiLock size={16} />, label: "Change Password" },
  { to: "/account/referral", icon: <FiGift size={16} />, label: "Referral Programme" },
  { to: "/account/settings", icon: <FiSettings size={16} />, label: "Settings" }
];
const mockUser = {
  name: "Aria Laurent",
  email: "aria.laurent@email.com",
  tier: "Gold",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format"
};
const tierColor = {
  Bronze: "#cd7f32",
  Silver: "#8c8277",
  Gold: "#c9b99a",
  Platinum: "#2d4a3e"
};
function AccountLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLinkClass = ({ isActive }) => [
    "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 border-l-2",
    isActive ? "border-l-[#0a0a0a] font-semibold text-[#0a0a0a] bg-[#f0ebe2]" : "border-l-transparent text-[#8c8277] hover:text-[#0a0a0a] hover:bg-[#f0ebe2]/50"
  ].join(" ");
  return <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      {
    /* Mobile header */
  }
      <div
    className="lg:hidden flex items-center justify-between px-6 py-4 border-b"
    style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}
  >
        <Link to="/" className="font-display text-xl tracking-[0.15em]" style={{ color: "#0a0a0a" }}>
          Eternal
        </Link>
        <button
    type="button"
    onClick={() => setMobileOpen(!mobileOpen)}
    className="p-2"
    style={{ color: "#0a0a0a" }}
    aria-label="Toggle account menu"
  >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {
    /* Mobile dropdown nav */
  }
      {mobileOpen && <div
    className="lg:hidden border-b"
    style={{ backgroundColor: "#fafafa", borderColor: "#f0ebe2" }}
  >
          <div className="px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: "#f0ebe2" }}>
            <img
    src={mockUser.avatar}
    alt={mockUser.name}
    className="w-10 h-10 rounded-full object-cover"
  />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>
                {mockUser.name}
              </p>
              <span
    className="text-xs px-2 py-0.5 rounded-full"
    style={{
      backgroundColor: tierColor[mockUser.tier] + "22",
      color: tierColor[mockUser.tier],
      fontFamily: "Manrope, sans-serif"
    }}
  >
                {mockUser.tier} Member
              </span>
            </div>
          </div>
          <nav className="py-2">
            {navItems.map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={item.end}
    onClick={() => setMobileOpen(false)}
    className={activeLinkClass}
    style={{ fontFamily: "Manrope, sans-serif" }}
  >
                {item.icon}
                {item.label}
              </NavLink>)}
            <button
    type="button"
    className="w-full flex items-center gap-3 px-4 py-3 text-sm border-l-2 border-l-transparent"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
              <FiLogOut size={16} />
              Logout
            </button>
          </nav>
        </div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-10">
          {
    /* Desktop sidebar */
  }
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              {
    /* User profile */
  }
              <div
    className="p-6 mb-6"
    style={{ backgroundColor: "#f0ebe2" }}
  >
                <div className="flex flex-col items-center text-center">
                  <img
    src={mockUser.avatar}
    alt={mockUser.name}
    className="w-20 h-20 rounded-full object-cover mb-3"
  />
                  <h3
    className="font-semibold text-sm mb-1"
    style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
                    {mockUser.name}
                  </h3>
                  <p
    className="text-xs mb-3"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                    {mockUser.email}
                  </p>
                  <span
    className="text-xs px-3 py-1 uppercase tracking-widest font-semibold"
    style={{
      backgroundColor: tierColor[mockUser.tier],
      color: "#fafafa"
    }}
  >
                    {mockUser.tier}
                  </span>
                </div>
              </div>

              {
    /* Navigation */
  }
              <nav className="border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa" }}>
                {navItems.map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={item.end}
    className={activeLinkClass}
    style={{ fontFamily: "Manrope, sans-serif" }}
  >
                    {item.icon}
                    {item.label}
                  </NavLink>)}
                <div className="border-t" style={{ borderColor: "#f0ebe2" }} />
                <button
    type="button"
    className="w-full flex items-center gap-3 px-4 py-3 text-sm border-l-2 border-l-transparent transition-all duration-200 hover:bg-[#f0ebe2]/50"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {
    /* Main content */
  }
          <main className="flex-1 min-w-0">
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#f0ebe2] border-t-[#2d4a3e] animate-spin" /></div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>;
}
export {
  AccountLayout as default
};
