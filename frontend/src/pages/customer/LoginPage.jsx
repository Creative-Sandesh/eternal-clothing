import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  return <div className="min-h-screen flex" style={{ backgroundColor: "#fafafa" }}>
      {
    /* Left editorial panel — hidden on mobile */
  }
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
    alt="Eternal editorial"
    className="absolute inset-0 w-full h-full object-cover"
  />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, rgba(10,10,10,0.35), rgba(10,10,10,0.6))" }} />
        <div className="relative z-10 flex flex-col justify-end p-16">
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#c9b99a" }}>
            New Collection
          </p>
          <h2 className="font-display text-5xl leading-tight" style={{ color: "#fafafa" }}>
            Timeless<br />Elegance
          </h2>
          <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,250,250,0.7)" }}>
            Crafted for those who understand that true luxury is never loud.
          </p>
        </div>
      </div>

      {
    /* Right form panel */
  }
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 lg:px-16">
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="w-full max-w-md"
  >
          {
    /* Logo */
  }
          <Link to="/" className="block mb-12">
            <span
    className="font-display text-2xl tracking-[0.2em] uppercase"
    style={{ color: "#0a0a0a" }}
  >
              Eternal
            </span>
          </Link>

          {
    /* Heading */
  }
          <h1 className="font-display text-4xl mb-2" style={{ color: "#0a0a0a" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-10" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {
    /* Email */
  }
            <div className="relative">
              <label
    htmlFor="email"
    className="block text-xs uppercase tracking-widest mb-2"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                Email Address
              </label>
              <div className="flex items-center border-b" style={{ borderColor: "#8c8277" }}>
                <FiMail size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    placeholder="your@email.com"
    className="flex-1 bg-transparent outline-none py-3 pl-3 text-sm"
    style={{
      color: "#0a0a0a",
      fontFamily: "Manrope, sans-serif",
      caretColor: "#2d4a3e"
    }}
  />
              </div>
            </div>

            {
    /* Password */
  }
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label
    htmlFor="password"
    className="block text-xs uppercase tracking-widest"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                  Password
                </label>
                <Link
    to="/forgot-password"
    className="text-xs underline underline-offset-2 transition-colors"
    style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}
  >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center border-b" style={{ borderColor: "#8c8277" }}>
                <FiLock size={15} style={{ color: "#8c8277", flexShrink: 0 }} />
                <input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    placeholder="••••••••"
    className="flex-1 bg-transparent outline-none py-3 pl-3 text-sm"
    style={{
      color: "#0a0a0a",
      fontFamily: "Manrope, sans-serif",
      caretColor: "#2d4a3e"
    }}
  />
              </div>
            </div>

            {
    /* Submit */
  }
            <button
    type="submit"
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-widest transition-opacity duration-200"
    style={{
      backgroundColor: "#0a0a0a",
      color: "#fafafa",
      fontFamily: "Manrope, sans-serif",
      opacity: loading ? 0.6 : 1
    }}
  >
              {loading ? "Signing in..." : <>
                  Sign In
                  <FiArrowRight size={14} />
                </>}
            </button>
          </form>

          {
    /* Divider */
  }
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ backgroundColor: "#f0ebe2" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#f0ebe2" }} />
          </div>

          {
    /* Google */
  }
          <button
    type="button"
    className="w-full flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-widest border transition-colors duration-200"
    style={{
      borderColor: "#f0ebe2",
      color: "#0a0a0a",
      fontFamily: "Manrope, sans-serif",
      backgroundColor: "transparent"
    }}
  >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {
    /* Register link */
  }
          <p className="mt-8 text-center text-sm" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            {"Don't have an account?"}{" "}
            <Link
    to="/register"
    className="underline underline-offset-2 transition-colors"
    style={{ color: "#0a0a0a" }}
  >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>;
}
export {
  LoginPage as default
};
