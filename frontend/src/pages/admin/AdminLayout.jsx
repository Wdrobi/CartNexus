import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";

function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconOrders(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function IconInventory(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconHero(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconProducts(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8-4v10m-8-4l8 4" />
    </svg>
  );
}

function IconCategories(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function IconBrands(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function IconBlog(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconTerms(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconFaq(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function IconPrivacy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="px-1 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 first:pt-0">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const itemClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-r-xl border-l-[3px] py-2 pl-3 pr-2 text-sm font-medium transition ${
      isActive
        ? "border-brand-500 bg-gradient-to-r from-brand-500/[0.14] via-brand-500/[0.06] to-transparent text-white shadow-[inset_0_0_0_1px_rgba(244,63,94,0.08)]"
        : "border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-slate-200"
    }`;

  const iconWrap = (isActive) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
      isActive ? "bg-brand-500/20 text-brand-200" : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-300"
    }`;

  return (
    <div className="min-h-dvh bg-[#0b1020] text-slate-100">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-white/[0.07] bg-gradient-to-b from-[#141b2e] to-[#0f1524] lg:w-72 lg:border-b-0 lg:border-r lg:border-white/[0.07]">
          <div className="flex max-h-[min(100dvh,100vh)] flex-col px-3 py-4 sm:px-4 lg:flex-1 lg:px-4 lg:py-8">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-brand-900/40">
                  CN
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold leading-tight text-white">
                    Cart<span className="text-brand-400">Nexus</span>
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">{t("admin.panel")}</p>
                  {user && (
                    <p className="mt-2 truncate text-xs text-slate-400" title={user.email}>
                      {user.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <nav
              className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent] lg:mt-6"
              aria-label={t("admin.panel")}
            >
              <NavSection title={t("admin.nav.groupMain")}>
                <NavLink to="/admin" end className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconDashboard className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.dashboard")}</span>
                    </>
                  )}
                </NavLink>
              </NavSection>

              <NavSection title={t("admin.nav.groupStore")}>
                <NavLink to="/admin/orders" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconOrders className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.orders")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/inventory" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconInventory className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.inventory")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/products" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconProducts className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.products")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/categories" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconCategories className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.categories")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/brands" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconBrands className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.brands")}</span>
                    </>
                  )}
                </NavLink>
              </NavSection>

              <NavSection title={t("admin.nav.groupContent")}>
                <NavLink to="/admin/home-hero" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconHero className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.homeHero")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/blog" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconBlog className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.blog")}</span>
                    </>
                  )}
                </NavLink>
              </NavSection>

              <NavSection title={t("admin.nav.groupOps")}>
                <NavLink to="/admin/users" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconUsers className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.users")}</span>
                    </>
                  )}
                </NavLink>
              </NavSection>

              <NavSection title={t("admin.nav.groupSupport")}>
                <NavLink to="/admin/support/terms" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconTerms className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.termsCms")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/support/faqs" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconFaq className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.faqsCms")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/support/privacy" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconPrivacy className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.privacyCms")}</span>
                    </>
                  )}
                </NavLink>
              </NavSection>
            </nav>

            <div className="mt-auto flex flex-shrink-0 flex-col gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-slate-400 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-300"
              >
                {t("auth.logout")}
              </button>
              <NavLink
                to="/"
                className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-brand-300"
              >
                ← {t("admin.backSite")}
              </NavLink>
            </div>
          </div>
        </aside>

        <div className="relative min-w-0 flex-1 border-l border-transparent bg-[#070a14] px-[20px] py-4 sm:py-6 lg:rounded-tl-3xl lg:border-l-white/[0.06] lg:bg-ink-950/90 lg:py-8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
