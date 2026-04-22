import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-24 text-center sm:px-5">
        <p className="font-display text-6xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">{t("notFound.title")}</h1>
        <p className="mt-2 text-slate-600">{t("notFound.body")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-500"
          >
            {t("notFound.home")}
          </Link>
          <Link
            to="/shop"
            className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-brand-400 hover:text-brand-800"
          >
            {t("notFound.shop")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
