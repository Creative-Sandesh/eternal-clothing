import { motion } from "framer-motion";
const variantClasses = {
  primary: "bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] hover:bg-[#2d4a3e] hover:border-[#2d4a3e]",
  secondary: "bg-transparent text-[#0a0a0a] border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa]",
  ghost: "bg-transparent text-[#0a0a0a] border border-transparent hover:border-transparent link-underline",
  danger: "bg-transparent text-[#7a1a1a] border border-[#7a1a1a] hover:bg-[#7a1a1a] hover:text-[#fafafa]"
};
const sizeClasses = {
  sm: "px-5 py-2 text-[10px]",
  md: "px-8 py-3 text-[11px]",
  lg: "px-12 py-4 text-[12px]"
};
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = "",
  onClick,
  type = "button",
  ...rest
}) {
  const isDisabled = disabled || loading;
  return <motion.button
    type={type}
    onClick={onClick}
    disabled={isDisabled}
    whileTap={isDisabled ? {} : { scale: 0.97 }}
    className={[
      "inline-flex items-center justify-center gap-2",
      "font-sans font-semibold tracking-widest uppercase",
      "transition-all duration-300 ease-in-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2d4a3e]",
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
      className
    ].filter(Boolean).join(" ")}
    {...rest}
  >
      {loading && <svg
    className="animate-spin h-3.5 w-3.5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
          <circle
    className="opacity-25"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    strokeWidth="2"
  />
          <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
  />
        </svg>}
      {children}
    </motion.button>;
}
export {
  Button as default
};
