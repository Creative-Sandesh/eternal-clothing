import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-8 h-8 rounded-full border-2 border-[#f0ebe2] border-t-[#2d4a3e] animate-spin" />
    </div>
  );
}

/** Requires a logged-in user. Sends guests to /login, remembering where they were. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

/** Requires an ADMIN or STAFF user. Customers are bounced to their account. */
export function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/account" replace />;
  return <Outlet />;
}
