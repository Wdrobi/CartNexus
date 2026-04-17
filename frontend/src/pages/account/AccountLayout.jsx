import { NavLink, Outlet, useLocation } from "react-router-dom";
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

function IconOrders({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 16V8l-9-4-9 4v8l9 4 9-4Z" strokeLinejoin="round" />
      <path d="M3.3 8L12 12l8.7-4M12 21V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountSideLink({ to, end, icon: Icon, title, sub }) {
  return (
    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
            isActive
              ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                isActive ? "bg-brand-500 text-white shadow-md shadow-brand-500/25" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{title}</span>
              {sub ? (
                <span
                  className={`mt-0.5 block truncate text-[11px] font-normal leading-snug ${
                    isActive ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {sub}
                </span>
              ) : null}
            </span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

export default function AccountLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const initials = userInitials(user?.name, user?.email);
  const displayLabel = user?.name?.trim() || user?.email || "";

  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-slate-100 text-slate-900">
      <SiteHeader />
      <div className="relative min-h-0 flex-1 overflow-x-clip">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-5 lg:pb-12 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 lg:mb-8"
          >
            <AccountBreadcrumb />
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-slate-600">{t("account.navStripHint")}</p>
            <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-400/90">
              {t("account.zoneLabel")}
            </p>
          </motion.div>

          {/* Mobile: pill navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            <NavLink
              to="/account"
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition will-change-transform sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/20"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98]"
                }`
              }
            >
              <IconHome className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.overview")}</span>
            </NavLink>
            <NavLink
              to="/account/orders"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition will-change-transform sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/20"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98]"
                }`
              }
            >
              <IconOrders className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.orders")}</span>
            </NavLink>
            <NavLink
              to="/account/profile"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition will-change-transform sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/20"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98]"
                }`
              }
            >
              <IconUser className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.profile")}</span>
            </NavLink>
            <NavLink
              to="/account/addresses"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition will-change-transform sm:px-4 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/20"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98]"
                }`
              }
            >
              <IconMapPin className="h-4 w-4 shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{t("account.nav.addresses")}</span>
            </NavLink>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 xl:gap-12">
            <aside className="shrink-0 lg:w-72 lg:max-w-[20rem]">
              <div className="space-y-4 lg:sticky lg:top-24">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-200/50 transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/15 blur-3xl" aria-hidden />
                  <div className="pointer-events-none absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" aria-hidden />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-slate-200 shadow-md"
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
                      <p className="truncate font-display text-base font-semibold text-slate-900">{displayLabel}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{user?.email}</p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
                        {t("account.badge.customer")}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <nav
                  className="hidden flex-col gap-1 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm lg:flex"
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
                    to="/account/orders"
                    end
                    icon={IconOrders}
                    title={t("account.nav.orders")}
                    sub={t("account.nav.subOrders")}
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

                <p className="hidden px-1 text-xs leading-relaxed text-slate-500 lg:block">{t("account.sidebarHint")}</p>
              </div>
            </aside>

            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
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
