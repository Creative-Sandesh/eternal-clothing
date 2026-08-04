const variantClasses = {
  default: "bg-[#f0ebe2] text-[#8c8277] border border-[#e0d9cc]",
  new: "bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a]",
  sale: "bg-[#7a1a1a] text-[#fafafa] border border-[#7a1a1a]",
  bestseller: "bg-[#2d4a3e] text-[#fafafa] border border-[#2d4a3e]",
  "low-stock": "bg-[#c9b99a] text-[#0a0a0a] border border-[#c9b99a]",
  success: "bg-[#2d4a3e]/10 text-[#2d4a3e] border border-[#2d4a3e]/20",
  warning: "bg-[#c9b99a]/20 text-[#8c8277] border border-[#c9b99a]/40",
  error: "bg-[#7a1a1a]/10 text-[#7a1a1a] border border-[#7a1a1a]/20"
};
function Badge({ variant = "default", children, className = "" }) {
  return <span
    className={[
      "inline-flex items-center",
      "px-2 py-0.5",
      "font-sans text-[9px] font-semibold tracking-widest uppercase",
      variantClasses[variant],
      className
    ].filter(Boolean).join(" ")}
  >
      {children}
    </span>;
}
export {
  Badge as default
};
