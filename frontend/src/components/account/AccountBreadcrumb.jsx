import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AccountBreadcrumb() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const onDashboard = pathname === "/account" || pathname === "/account/";
  const onProfile = pathname.startsWith("/account/profile");
  const onAddresses = pathname.startsWith("/account/addresses");

  const sep = <span className="text-slate-600" aria-hidden>/</span>;

  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
      aria-label={t("account.breadcrumbLabel")}
    >
      <Link
        to="/"
        className="text-slate-500 transition hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded"
      >
        {t("nav.home")}
      </Link>
      {sep}
      {onDashboard ? (
        <span className="font-medium text-slate-200">{t("account.title")}</span>
      ) : (
        <>
          <Link
            to="/account"
            className="text-slate-500 transition hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded"
          >
            {t("account.title")}
          </Link>
          {sep}
          <span className="font-medium text-slate-200">
            {onProfile ? t("account.nav.profile") : onAddresses ? t("account.nav.addresses") : t("account.title")}
          </span>
        </>
      )}
    </nav>
  );
}
