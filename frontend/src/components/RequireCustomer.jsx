import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext.jsx";

/** Logged-in customers only (admins are sent to /admin). */
export default function RequireCustomer() {
  const { token, user, ready } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-dvh min-w-0 items-center justify-center bg-ink-950 text-slate-400">
        {t("auth.loading")}
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user && String(user.role) === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
