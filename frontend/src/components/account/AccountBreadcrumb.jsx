import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AccountBreadcrumb() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const onDashboard = pathname === "/account" || pathname === "/account/";
  const onOrders = pathname.startsWith("/account/orders");
  const onProfile = pathname.startsWith("/account/profile");
  const onAddresses = pathname.startsWith("/account/addresses");

  const sep = <span className="text-slate-400" aria-hidden>/</span>;

  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
      aria-label={t("account.breadcrumbLabel")}
    >
      <Link
        to="/"
        className="rounded-lg px-1.5 py-0.5 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        {t("nav.home")}
      </Link>
      {sep}
      {onDashboard ? (
        <span className="font-medium text-slate-900">{t("account.title")}</span>
      ) : (
        <>
          <Link
            to="/account"
            className="rounded-lg px-1.5 py-0.5 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            {t("account.title")}
          </Link>
          {sep}
          <span className="font-medium text-slate-900">
            {onProfile
              ? t("account.nav.profile")
              : onAddresses
                ? t("account.nav.addresses")
                : onOrders
                  ? t("account.nav.orders")
                  : t("account.title")}
          </span>
        </>
      )}
    </nav>
  );
}
