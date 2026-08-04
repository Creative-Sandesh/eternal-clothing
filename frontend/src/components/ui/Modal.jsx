import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
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
  return <AnimatePresence>
      {isOpen && <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "modal-title" : void 0}
  >
          {
    /* Backdrop */
  }
          <motion.div
    className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm"
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
      "relative w-full bg-[#fafafa] shadow-2xl",
      sizeClasses[size]
    ].join(" ")}
    initial={{ y: 40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 40, opacity: 0 }}
    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
  >
            {
    /* Header */
  }
            {title && <div className="flex items-center justify-between border-b border-[#e0d9cc] px-8 py-6">
                <h2
    id="modal-title"
    className="font-display text-xl text-[#0a0a0a]"
  >
                  {title}
                </h2>
                <button
    onClick={onClose}
    aria-label="Close modal"
    className="text-[#8c8277] hover:text-[#0a0a0a] transition-colors duration-200 p-1 -mr-1"
  >
                  <RiCloseLine size={22} />
                </button>
              </div>}

            {!title && <button
    onClick={onClose}
    aria-label="Close modal"
    className="absolute top-4 right-4 z-10 text-[#8c8277] hover:text-[#0a0a0a] transition-colors duration-200 p-1"
  >
                <RiCloseLine size={22} />
              </button>}

            {
    /* Body */
  }
            <div className="px-8 py-6">{children}</div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}
export {
  Modal as default
};
