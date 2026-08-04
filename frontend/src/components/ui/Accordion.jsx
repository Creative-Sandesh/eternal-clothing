import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine, RiSubtractLine } from "react-icons/ri";
function AccordionRow({
  item,
  isOpen,
  onToggle,
  index
}) {
  const panelId = item.id ?? `accordion-panel-${index}`;
  const triggerId = `accordion-trigger-${index}`;
  return <div className="border-b border-[#e0d9cc]">
      <button
    id={triggerId}
    aria-expanded={isOpen}
    aria-controls={panelId}
    onClick={onToggle}
    className={[
      "w-full flex items-center justify-between",
      "py-5 px-0 text-left",
      "font-sans text-sm font-medium text-[#0a0a0a]",
      "transition-colors duration-200 hover:text-[#2d4a3e]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]"
    ].join(" ")}
  >
        <span>{item.question}</span>
        <motion.span
    animate={{ rotate: isOpen ? 0 : 0 }}
    className="shrink-0 ml-4 text-[#8c8277]"
  >
          {isOpen ? <RiSubtractLine size={18} /> : <RiAddLine size={18} />}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && <motion.div
    id={panelId}
    role="region"
    aria-labelledby={triggerId}
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    className="overflow-hidden"
  >
            <div className="pb-5 font-sans text-sm text-[#8c8277] leading-relaxed">
              {item.answer}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
function Accordion({ items, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(/* @__PURE__ */ new Set());
  const toggle = (index) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) next.clear();
        next.add(index);
      }
      return next;
    });
  };
  return <div className="w-full border-t border-[#e0d9cc]">
      {items.map((item, i) => <AccordionRow
    key={item.id ?? i}
    item={item}
    index={i}
    isOpen={openItems.has(i)}
    onToggle={() => toggle(i)}
  />)}
    </div>;
}
export {
  Accordion as default
};
