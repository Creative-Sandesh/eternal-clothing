import { Link } from "react-router-dom";
import { motion } from "framer-motion";
function NotFoundPage() {
  return <div
    className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    style={{ backgroundColor: "#fafafa" }}
  >
      <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  >
        <p
    className="text-xs uppercase tracking-[0.4em] mb-6"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
          Error
        </p>

        <h1
    className="font-display leading-none mb-6"
    style={{ fontSize: "clamp(7rem, 20vw, 16rem)", color: "#f0ebe2" }}
  >
          404
        </h1>

        <h2
    className="font-display text-3xl mb-4"
    style={{ color: "#0a0a0a", marginTop: "-2rem" }}
  >
          Page not found
        </h2>

        <p
    className="text-sm leading-relaxed max-w-sm mx-auto mb-10"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
          The page you are looking for may have been moved, deleted, or never existed.
          Let us guide you back to something beautiful.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
    to="/"
    className="px-10 py-4 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
            Back to Home
          </Link>
          <Link
    to="/shop"
    className="px-10 py-4 text-xs uppercase tracking-widest border"
    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}
  >
            Browse Shop
          </Link>
        </div>
      </motion.div>

      {
    /* Decorative line */
  }
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#f0ebe2" }} />
    </div>;
}
export {
  NotFoundPage as default
};
