import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand-500/20 text-brand-200"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-ink-900/80 px-4 py-8">
          <p className="font-display text-lg font-semibold text-white">
            Cart<span className="text-brand-400">Nexus</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            {t("admin.panel")}
          </p>
          {user && (
            <p className="mt-3 truncate text-xs text-slate-400" title={user.email}>
              {user.name} · {user.email}
            </p>
          )}
          <nav className="mt-8 flex flex-col gap-1">
            <NavLink to="/admin" end className={linkClass}>
              {t("admin.nav.dashboard")}
            </NavLink>
            <NavLink to="/admin/products" className={linkClass}>
              {t("admin.nav.products")}
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              {t("admin.nav.categories")}
            </NavLink>
            <NavLink to="/admin/brands" className={linkClass}>
              {t("admin.nav.brands")}
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              {t("admin.nav.users")}
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-6 rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-400 transition hover:border-red-500/40 hover:text-red-300"
          >
            {t("auth.logout")}
          </button>
          <NavLink
            to="/"
            className="mt-4 block text-sm text-slate-500 transition hover:text-brand-300"
          >
            ← {t("admin.backSite")}
          </NavLink>
        </aside>
        <div className="min-w-0 flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
