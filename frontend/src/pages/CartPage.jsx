import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function CartPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-grid-fade">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white">{t("nav.cart")}</h1>
        <p className="mt-3 text-slate-400">{t("nav.cartEmpty")}</p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-400"
        >
          {t("nav.continueShopping")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
