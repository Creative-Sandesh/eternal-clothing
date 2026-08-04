import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
function Select({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Select an option",
  className = "",
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef(null);
  const selected = options.find((o) => o.value === value);
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  return <div ref={containerRef} className={["relative w-full", className].join(" ")}>
      {label && <label
    id={`${id}-label`}
    className={[
      "block mb-1.5 font-sans text-[10px] tracking-widest uppercase",
      error ? "text-[#7a1a1a]" : "text-[#8c8277]"
    ].join(" ")}
  >
          {label}
        </label>}

      <button
    type="button"
    id={id}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-labelledby={label ? `${id}-label` : void 0}
    disabled={disabled}
    onClick={() => !disabled && setOpen((v) => !v)}
    className={[
      "w-full flex items-center justify-between",
      "border-b pb-2 bg-transparent",
      "font-sans text-sm text-left",
      "transition-all duration-200 focus:outline-none",
      error ? "border-[#7a1a1a]" : open ? "border-[#0a0a0a]" : "border-[#e0d9cc] hover:border-[#8c8277]",
      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      selected ? "text-[#0a0a0a]" : "text-[#8c8277]"
    ].join(" ")}
  >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.span
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2 }}
    className="text-[#8c8277] shrink-0 ml-2"
  >
          <RiArrowDownSLine size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && <motion.ul
    role="listbox"
    aria-labelledby={label ? `${id}-label` : id}
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={[
      "absolute top-full left-0 right-0 z-50 mt-1",
      "bg-[#fafafa] border border-[#e0d9cc] shadow-xl",
      "max-h-56 overflow-y-auto no-scrollbar"
    ].join(" ")}
  >
            {options.map((opt) => <li
    key={opt.value}
    role="option"
    aria-selected={opt.value === value}
    onClick={() => {
      onChange?.(opt.value);
      setOpen(false);
    }}
    className={[
      "flex items-center justify-between px-4 py-3",
      "font-sans text-sm cursor-pointer transition-colors duration-150",
      opt.value === value ? "bg-[#f0ebe2] text-[#0a0a0a]" : "text-[#0a0a0a] hover:bg-[#f0ebe2]"
    ].join(" ")}
  >
                <span>{opt.label}</span>
                {opt.value === value && <RiCheckLine size={14} className="text-[#2d4a3e] shrink-0" />}
              </li>)}
          </motion.ul>}
      </AnimatePresence>

      {error && <p className="mt-1.5 font-sans text-[11px] text-[#7a1a1a]">{error}</p>}
    </div>;
}
export {
  Select as default
};
