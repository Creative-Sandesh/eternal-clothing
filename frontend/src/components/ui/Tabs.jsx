import { motion } from "framer-motion";
function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline"
}) {
  if (variant === "pill") {
    return <div
      className="flex items-center gap-1 p-1 bg-[#f0ebe2] w-fit"
      role="tablist"
      aria-orientation="horizontal"
    >
        {tabs.map((tab) => {
      const isActive = tab.value === activeTab;
      return <button
        key={tab.value}
        role="tab"
        aria-selected={isActive}
        onClick={() => onChange(tab.value)}
        className={[
          "relative px-5 py-2 font-sans text-[11px] tracking-widest uppercase font-semibold",
          "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]",
          isActive ? "text-[#fafafa]" : "text-[#8c8277] hover:text-[#0a0a0a]"
        ].join(" ")}
      >
              {isActive && <motion.span
        layoutId="pill-tab-bg"
        className="absolute inset-0 bg-[#0a0a0a]"
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      />}
              <span className="relative z-10">{tab.label}</span>
            </button>;
    })}
      </div>;
  }
  return <div
    className="flex items-center border-b border-[#e0d9cc] gap-8"
    role="tablist"
    aria-orientation="horizontal"
  >
      {tabs.map((tab) => {
    const isActive = tab.value === activeTab;
    return <button
      key={tab.value}
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(tab.value)}
      className={[
        "relative pb-3 font-sans text-[11px] tracking-widest uppercase font-semibold",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2d4a3e]",
        isActive ? "text-[#0a0a0a]" : "text-[#8c8277] hover:text-[#0a0a0a]"
      ].join(" ")}
    >
            {tab.label}
            {isActive && <motion.span
      layoutId="underline-tab-indicator"
      className="absolute bottom-0 left-0 right-0 h-px bg-[#0a0a0a]"
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
    />}
          </button>;
  })}
    </div>;
}
export {
  Tabs as default
};
