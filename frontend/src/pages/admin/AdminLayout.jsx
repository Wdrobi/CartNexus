import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition lg:shrink lg:whitespace-normal ${
      isActive
        ? "bg-brand-500/20 text-brand-200"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-dvh bg-ink-950 text-slate-100">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-white/10 bg-ink-900/80 lg:w-56 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="flex flex-col gap-3 px-3 py-4 sm:px-4 lg:px-4 lg:py-8">
            <div>
              <p className="font-display text-lg font-semibold text-white">
                Cart<span className="text-brand-400">Nexus</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{t("admin.panel")}</p>
              {user && (
                <p className="mt-2 truncate text-xs text-slate-400" title={user.email}>
                  {user.name} · {user.email}
                </p>
              )}
            </div>

            <nav
              className="-mx-1 flex flex-row gap-1 overflow-x-auto pb-1 [scrollbar-width:none] lg:mx-0 lg:mt-4 lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label={t("admin.panel")}
            >
              <NavLink to="/admin" end className={linkClass}>
                {t("admin.nav.dashboard")}
              </NavLink>
              <NavLink to="/admin/orders" className={linkClass}>
                {t("admin.nav.orders")}
              </NavLink>
              <NavLink to="/admin/inventory" className={linkClass}>
                {t("admin.nav.inventory")}
              </NavLink>
              <NavLink to="/admin/home-hero" className={linkClass}>
                {t("admin.nav.homeHero")}
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
              <NavLink to="/admin/blog" className={linkClass}>
                {t("admin.nav.blog")}
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                {t("admin.nav.users")}
              </NavLink>
            </nav>

            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 lg:flex-col lg:items-stretch lg:border-t-0 lg:pt-0">
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-400 transition hover:border-red-500/40 hover:text-red-300 lg:w-full"
              >
                {t("auth.logout")}
              </button>
              <NavLink
                to="/"
                className="block rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-white/5 hover:text-brand-300 lg:w-full"
              >
                ← {t("admin.backSite")}
              </NavLink>
            </div>
          </div>
        </aside>
        <div className="relative min-w-0 flex-1 border-l border-transparent bg-ink-950/40 px-[20px] py-4 sm:py-6 lg:border-l-white/[0.06] lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
