import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import CmsHtmlBody from "../components/legal/CmsHtmlBody.jsx";
import { useCmsPage } from "../hooks/useCmsPage.js";

export default function FaqsPage() {
  const { t, i18n } = useTranslation();
  const cms = useCmsPage("faqs");
  const locale = i18n.language?.startsWith("bn") ? "bn-BD" : "en-GB";

  function formatCmsDate(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(iso)
      );
    } catch {
      return "";
    }
  }

  if (cms.loading) {
    return (
      <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
        <SiteHeader />
        <div className="flex min-h-[45vh] items-center justify-center px-[20px] text-slate-500">{t("shop.loading")}</div>
        <SiteFooter showCta={false} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-90" aria-hidden />
        <div className="relative mx-auto w-full max-w-none px-[20px] py-14 sm:py-16 md:py-20">
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("faqPage.heroKicker")}
          </motion.p>
          <motion.h1
            className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {t("faqPage.heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("faqPage.heroSubtitle")}
          </motion.p>
          {cms.updatedAt ? (
            <motion.p
              className="mt-6 text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14 }}
            >
              {t("faqPage.lastUpdated", { date: formatCmsDate(cms.updatedAt) })}
            </motion.p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-[20px] py-10 sm:py-14">
        <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          {cms.hasContent ? (
            <CmsHtmlBody html={cms.html} />
          ) : (
            <>
              <p className="text-sm leading-relaxed text-slate-600 md:text-[15px]">{t("faqPage.staticIntro")}</p>
              <p className="mt-6 text-sm leading-relaxed text-slate-600 md:text-[15px]">{t("faqPage.staticBody")}</p>
              <Link
                to="/contact"
                className="mt-8 inline-flex rounded-xl bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-900"
              >
                {t("faqPage.contactCta")}
              </Link>
            </>
          )}
        </article>
      </div>

      <SiteFooter showCta={false} />
    </div>
  );
}
