import {
  createContext,
  useContext,
  useState,
  useCallback
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiAlertLine,
  RiCloseLine
} from "react-icons/ri";
const ToastContext = createContext(null);
const variantConfig = {
  success: {
    icon: <RiCheckLine size={16} />,
    classes: "bg-[#2d4a3e] text-[#fafafa] border-[#2d4a3e]"
  },
  error: {
    icon: <RiErrorWarningLine size={16} />,
    classes: "bg-[#7a1a1a] text-[#fafafa] border-[#7a1a1a]"
  },
  info: {
    icon: <RiInformationLine size={16} />,
    classes: "bg-[#0a0a0a] text-[#fafafa] border-[#0a0a0a]"
  },
  warning: {
    icon: <RiAlertLine size={16} />,
    classes: "bg-[#c9b99a] text-[#0a0a0a] border-[#c9b99a]"
  }
};
function ToastItem({ toast, onRemove }) {
  const { icon, classes } = variantConfig[toast.variant];
  return <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.96 }}
    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    className={[
      "flex items-center gap-3 min-w-[260px] max-w-sm",
      "border px-4 py-3 shadow-lg",
      "font-sans text-xs font-medium",
      classes
    ].join(" ")}
  >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
    onClick={onRemove}
    aria-label="Dismiss"
    className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
  >
        <RiCloseLine size={14} />
      </button>
    </motion.div>;
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (message, variant = "info", duration = 4e3) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, variant, message, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );
  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
    className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
    aria-live="polite"
    aria-atomic="false"
  >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => <ToastItem
    key={toast.id}
    toast={toast}
    onRemove={() => removeToast(toast.id)}
  />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>;
}
function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
function Toast({ variant = "info", message, onClose }) {
  const { icon, classes } = variantConfig[variant];
  return <div
    className={[
      "flex items-center gap-3 min-w-[260px] max-w-sm",
      "border px-4 py-3",
      "font-sans text-xs font-medium",
      classes
    ].join(" ")}
    role="alert"
  >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{message}</span>
      {onClose && <button
    onClick={onClose}
    aria-label="Dismiss"
    className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
  >
          <RiCloseLine size={14} />
        </button>}
    </div>;
}
export {
  ToastProvider,
  Toast as default,
  useToast
};
