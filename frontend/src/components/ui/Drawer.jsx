import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right"
}) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);
  const slideFrom = side === "right" ? { x: "100%" } : { x: "-100%" };
  const slideTo = { x: 0 };
  return <AnimatePresence>
      {isOpen && <div
    className="fixed inset-0 z-50 flex"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "drawer-title" : void 0}
  >
          {
    /* Backdrop */
  }
          <motion.div
    className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    onClick={onClose}
    aria-hidden="true"
  />

          {
    /* Panel */
  }
          <motion.div
    className={[
      "absolute top-0 bottom-0 w-full max-w-md bg-[#fafafa] shadow-2xl",
      "flex flex-col",
      side === "right" ? "right-0" : "left-0"
    ].join(" ")}
    initial={slideFrom}
    animate={slideTo}
    exit={slideFrom}
    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
  >
            {
    /* Header */
  }
            <div className="flex items-center justify-between border-b border-[#e0d9cc] px-8 py-6 shrink-0">
              {title ? <h2
    id="drawer-title"
    className="font-display text-xl text-[#0a0a0a]"
  >
                  {title}
                </h2> : <div />}
              <button
    onClick={onClose}
    aria-label="Close drawer"
    className="text-[#8c8277] hover:text-[#0a0a0a] transition-colors duration-200 p-1 -mr-1"
  >
                <RiCloseLine size={22} />
              </button>
            </div>

            {
    /* Body */
  }
            <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}
export {
  Drawer as default
};
