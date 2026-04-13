import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HomeOfferStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-brand-100 bg-brand-50/70 py-3.5 sm:py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
          <span className="shrink-0 rounded-full border border-brand-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-800">
            {t("home.offerStripBadge")}
          </span>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-brand-900/90">{t("home.offerStripTitle")}</p>
        </div>
        <Link
          to="/shop?sale=1"
          className="shrink-0 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/10 transition hover:bg-brand-700"
        >
          {t("home.offerStripCta")}
        </Link>
      </div>
    </section>
  );
}
