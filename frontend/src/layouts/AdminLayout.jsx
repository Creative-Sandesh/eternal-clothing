import { useState, useRef, useEffect, Suspense } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiSettings,
  FiBarChart2,
  FiTag,
  FiStar,
  FiMail,
  FiList,
  FiLayers,
  FiBell,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiUserCheck,
  FiPercent
} from "react-icons/fi";
const navSections = [
  {
    section: "Dashboard",
    items: [
      { label: "Overview", icon: <FiHome />, to: "/admin" }
    ]
  },
  {
    section: "Products",
    items: [
      { label: "Products", icon: <FiShoppingBag />, to: "/admin/products" },
      { label: "Categories", icon: <FiTag />, to: "/admin/categories" },
      { label: "Collections", icon: <FiLayers />, to: "/admin/collections" },
      { label: "Inventory", icon: <FiPackage />, to: "/admin/inventory" }
    ]
  },
  {
    section: "Commerce",
    items: [
      { label: "Orders", icon: <FiList />, to: "/admin/orders" },
      { label: "Customers", icon: <FiUsers />, to: "/admin/customers" },
      { label: "Reviews", icon: <FiStar />, to: "/admin/reviews" },
      { label: "Coupons", icon: <FiPercent />, to: "/admin/coupons" }
    ]
  },
  {
    section: "Marketing",
    items: [
      { label: "Marketing", icon: <FiMail />, to: "/admin/marketing" }
    ]
  },
  {
    section: "Analytics",
    items: [
      { label: "Analytics", icon: <FiBarChart2 />, to: "/admin/analytics" }
    ]
  },
  {
    section: "System",
    items: [
      { label: "Staff & Roles", icon: <FiUserCheck />, to: "/admin/users" },
      { label: "Settings", icon: <FiSettings />, to: "/admin/settings" }
    ]
  }
];
const pageTitles = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/collections": "Collections",
  "/admin/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/reviews": "Reviews",
  "/admin/coupons": "Coupons",
  "/admin/marketing": "Marketing",
  "/admin/analytics": "Analytics",
  "/admin/users": "Staff & Roles",
  "/admin/settings": "Settings"
};
function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const path = window.location.pathname;
  const title = pageTitles[path] ?? "Admin";
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const notifications = [
    { id: 1, text: "New order #ET-2024-00428 placed", time: "2m ago", unread: true },
    { id: 2, text: "Low stock alert: Cashmere Beanie", time: "1h ago", unread: true },
    { id: 3, text: "Review pending approval", time: "3h ago", unread: false }
  ];
  const SidebarContent = ({ isMobile = false }) => <div className="flex flex-col h-full">
      {
    /* Logo */
  }
      <div className={`flex items-center ${collapsed && !isMobile ? "justify-center px-0" : "justify-between px-5"} h-16 border-b border-white/10`}>
        {(!collapsed || isMobile) && <Link to="/admin" className="text-white font-display text-lg tracking-widest">
            ETERNAL
          </Link>}
        {!isMobile && <button
    onClick={() => setCollapsed(!collapsed)}
    className="text-white/50 hover:text-white transition-colors p-1 rounded"
    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
            {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>}
        {isMobile && <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white p-1">
            <FiX size={20} />
          </button>}
      </div>

      {
    /* Nav */
  }
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navSections.map((section) => <div key={section.section} className="mb-1">
            {(!collapsed || isMobile) && <p className="px-5 py-1 text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                {section.section}
              </p>}
            {collapsed && !isMobile && <div className="my-2 border-t border-white/10 mx-3" />}
            {section.items.map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={item.to === "/admin"}
    onClick={() => isMobile && setMobileOpen(false)}
    title={collapsed && !isMobile ? item.label : void 0}
    className={({ isActive }) => `flex items-center gap-3 mx-2 rounded-md transition-all duration-150 text-sm font-medium
                  ${collapsed && !isMobile ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                  ${isActive ? "bg-[#2d4a3e]/40 text-white border-l-2 border-[#2d4a3e] pl-[10px]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
  >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </NavLink>)}
          </div>)}
      </nav>

      {
    /* User */
  }
      <div className={`border-t border-white/10 p-4 flex items-center gap-3 ${collapsed && !isMobile ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-full bg-[#2d4a3e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          AD
        </div>
        {(!collapsed || isMobile) && <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Admin User</p>
            <p className="text-white/40 text-xs truncate">admin@eternal.com</p>
          </div>}
        {(!collapsed || isMobile) && <button
    onClick={() => navigate("/")}
    className="text-white/40 hover:text-white transition-colors"
    title="Logout"
  >
            <FiLogOut size={15} />
          </button>}
      </div>
    </div>;
  return <div className="flex h-screen bg-[#fafafa] overflow-hidden" style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
      {
    /* Desktop Sidebar */
  }
      <motion.aside
    animate={{ width: collapsed ? 60 : 240 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
    className="hidden md:flex flex-col bg-[#0a0a0a] h-screen fixed left-0 top-0 z-30 overflow-hidden"
  >
        <SidebarContent />
      </motion.aside>

      {
    /* Mobile overlay drawer */
  }
      <AnimatePresence>
        {mobileOpen && <>
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 z-40 md:hidden"
    onClick={() => setMobileOpen(false)}
  />
            <motion.aside
    initial={{ x: -280 }}
    animate={{ x: 0 }}
    exit={{ x: -280 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] z-50 md:hidden flex flex-col"
  >
              <SidebarContent isMobile />
            </motion.aside>
          </>}
      </AnimatePresence>

      {
    /* Main area */
  }
      <div
    className="flex flex-col flex-1 min-w-0 transition-all duration-200"
    style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 768 ? collapsed ? 60 : 240 : 0 }}
  >
        {
    /* Header */
  }
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 flex items-center px-4 md:px-6 gap-4">
          {
    /* Mobile hamburger */
  }
          <button
    className="md:hidden text-gray-600 hover:text-gray-900 p-1"
    onClick={() => setMobileOpen(true)}
  >
            <FiMenu size={20} />
          </button>

          <h1 className="font-display text-xl text-gray-900 hidden sm:block">{title}</h1>

          {
    /* Search */
  }
          <div className="flex-1 max-w-md mx-auto md:mx-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
    type="text"
    placeholder="Search..."
    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2d4a3e] focus:bg-white transition-colors"
  />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {
    /* Notifications */
  }
            <div ref={notifRef} className="relative">
              <button
    onClick={() => setNotifOpen(!notifOpen)}
    className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
  >
                <FiBell size={18} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#2d4a3e] text-white text-[9px] rounded-full flex items-center justify-center font-bold">2</span>
              </button>
              <AnimatePresence>
                {notifOpen && <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.96 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
  >
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">Notifications</span>
                      <span className="text-xs text-[#2d4a3e] cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    {notifications.map((n) => <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${n.unread ? "bg-[#f0ebe2]/30" : ""}`}>
                        <p className="text-sm text-gray-800">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>)}
                  </motion.div>}
              </AnimatePresence>
            </div>

            {
    /* Profile */
  }
            <div ref={profileRef} className="relative">
              <button
    onClick={() => setProfileOpen(!profileOpen)}
    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
  >
                <div className="w-7 h-7 rounded-full bg-[#2d4a3e] flex items-center justify-center text-white text-xs font-bold">AD</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
              </button>
              <AnimatePresence>
                {profileOpen && <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.96 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Admin User</p>
                      <p className="text-xs text-gray-500">admin@eternal.com</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <FiUser size={14} /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <FiSettings size={14} /> Settings
                    </button>
                    <button
    onClick={() => navigate("/")}
    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100"
  >
                      <FiLogOut size={14} /> Log out
                    </button>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {
    /* Content */
  }
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#f0ebe2] border-t-[#2d4a3e] animate-spin" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>;
}
export {
  AdminLayout as default
};
