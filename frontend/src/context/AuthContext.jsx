import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi } from "../services/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking persisted session

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate token by fetching current user profile
    userApi
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (body) => {
    const res = await authApi.register(body);
    return res; // caller decides what to do after (usually navigate to login)
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    // api.js sends cookies automatically; also persist tokens in localStorage
    // so the request helper can read them for non-cookie environments.
    if (res.data?.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
    }
    if (res.data?.refreshToken) {
      localStorage.setItem("refreshToken", res.data.refreshToken);
    }
    setUser(res.data?.user ?? null);
    return res;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin, login, logout, register, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { AuthProvider, useAuth };
