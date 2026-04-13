import { Link, NavLink, Outlet, useLocation, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SiteHeader from "../../components/SiteHeader.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import AccountBreadcrumb from "../../components/account/AccountBreadcrumb.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import SafeImage from "../../components/SafeImage.jsx";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";
import { PRODUCT_IMAGE_FALLBACK_ALT } from "../../utils/productImage.js";
import { userInitials } from "../../utils/userDisplay.js";

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 6.5-4 8-4s6.5 0 8 4" strokeLinecap="round" />
    </svg>
  );
}

function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function AccountSideLink({ to, end, icon: Icon, title, sub }) {
  const match = useMatch({ path: to, end: end ?? false });
  const active = !!match;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
        active
          ? "bg-brand-500/20 text-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]"
          : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
          active ? "bg-brand-500/30 text-brand-200" : "bg-white/5 text-slate-500"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        {sub && (
          <span className="mt-0.5 block truncate text-[11px] font-normal leading-snug text-slate-500">{sub}</span>
        )}
      </span>
    </Link>
  );
}

export default function AccountLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const initials = userInitials(user?.name, user?.email);
  const displayLabel = user?.name?.trim() || user?.email || "";

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-slate-100">
      <SiteHeader />
      <div className="relative flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(45,212,191,0.14),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <AccountBreadcrumb />
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-slate-500">{t("account.navStripHint")}</p>
            <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-400/90">
              {t("account.zoneLabel")}
            </p>
          </div>

          {/* Mobile: pill navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-thin">
            <NavLink
              to="/account"
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                }`
              }
            >
              <IconHome className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.overview")}</span>
            </NavLink>
            <NavLink
              to="/account/profile"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                }`
              }
            >
              <IconUser className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.profile")}</span>
            </NavLink>
            <NavLink
              to="/account/addresses"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                }`
              }
            >
              <IconMapPin className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.addresses")}</span>
            </NavLink>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 xl:gap-12">
            <aside className="shrink-0 lg:w-72 lg:max-w-[20rem]">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800/90 via-ink-900/95 to-ink-950 p-5 shadow-xl shadow-black/20">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-ink-950 ring-2 ring-white/10 shadow-lg shadow-brand-900/40"
                      aria-hidden
                    >
                      {user?.avatar_url ? (
                        <SafeImage
                          src={resolvePublicAssetUrl(user.avatar_url)}
                          alt=""
                          className="h-full w-full object-cover"
                          fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-teal-700 text-lg font-bold text-white">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="truncate font-display text-base font-semibold text-white">{displayLabel}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{user?.email}</p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300/95 ring-1 ring-emerald-500/25">
                        {t("account.badge.customer")}
                      </span>
                    </div>
                  </div>
                </div>

                <nav
                  className="hidden flex-col gap-1 rounded-2xl border border-white/10 bg-ink-900/40 p-2 backdrop-blur-sm lg:flex"
                  aria-label={t("account.navAria")}
                >
                  <AccountSideLink
                    to="/account"
                    end
                    icon={IconHome}
                    title={t("account.nav.overview")}
                    sub={t("account.nav.subOverview")}
                  />
                  <AccountSideLink
                    to="/account/profile"
                    end
                    icon={IconUser}
                    title={t("account.nav.profile")}
                    sub={t("account.nav.subProfile")}
                  />
                  <AccountSideLink
                    to="/account/addresses"
                    end
                    icon={IconMapPin}
                    title={t("account.nav.addresses")}
                    sub={t("account.nav.subAddresses")}
                  />
                </nav>

                <p className="hidden px-1 text-xs leading-relaxed text-slate-600 lg:block">{t("account.sidebarHint")}</p>
              </div>
            </aside>

            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0 flex-1"
            >
              <Outlet />
            </motion.main>
          </div>
        </div>
      </div>
      <SiteFooter showCta={false} />
    </div>
  );
}
