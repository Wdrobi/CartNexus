import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

function Prose({ text, className = "" }) {
  const paragraphs = String(text || "")
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p key={i} className="mt-4 text-sm leading-relaxed text-slate-600 first:mt-0 md:text-[15px] md:leading-relaxed">
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

const SECTIONS = [
  { id: "scope", titleKey: "scopeTitle", bodyKey: "scopeBody" },
  { id: "collect", titleKey: "collectTitle", bodyKey: "collectBody" },
  { id: "use", titleKey: "useTitle", bodyKey: "useBody" },
  { id: "legal", titleKey: "legalTitle", bodyKey: "legalBody" },
  { id: "cookies", titleKey: "cookiesTitle", bodyKey: "cookiesBody" },
  { id: "sharing", titleKey: "sharingTitle", bodyKey: "sharingBody" },
  { id: "retention", titleKey: "retentionTitle", bodyKey: "retentionBody" },
  { id: "security", titleKey: "securityTitle", bodyKey: "securityBody" },
  { id: "rights", titleKey: "rightsTitle", bodyKey: "rightsBody" },
  { id: "children", titleKey: "childrenTitle", bodyKey: "childrenBody" },
  { id: "transfers", titleKey: "transfersTitle", bodyKey: "transfersBody" },
  { id: "changes", titleKey: "changesTitle", bodyKey: "changesBody" },
  { id: "contact", titleKey: "contactTitle", bodyKey: "contactBody" },
];

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-90" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("privacyPage.heroKicker")}
          </motion.p>
          <motion.h1
            className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {t("privacyPage.heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("privacyPage.heroSubtitle")}
          </motion.p>
          <motion.p
            className="mt-6 text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {t("privacyPage.lastUpdated", { date: t("privacyPage.lastUpdatedDate") })}
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mx-auto max-w-3xl rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 md:text-[15px]">
          {t("privacyPage.disclaimer")}
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              aria-label={t("privacyPage.tocTitle")}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("privacyPage.tocTitle")}</p>
              <ol className="mt-4 space-y-2 text-sm">
                {SECTIONS.map(({ id, titleKey }) => (
                  <li key={id}>
                    <a
                      href={`#privacy-${id}`}
                      className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-800"
                    >
                      {t(`privacyPage.${titleKey}`)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <div className="space-y-12">
              {SECTIONS.map(({ id, titleKey, bodyKey }, idx) => (
                <motion.section
                  key={id}
                  id={`privacy-${id}`}
                  className="scroll-mt-28 border-b border-slate-100 pb-12 last:border-b-0 last:pb-0"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: Math.min(0.04 * idx, 0.2) }}
                >
                  <h2 className="font-display text-xl font-bold text-ink-950 md:text-2xl">
                    {t(`privacyPage.${titleKey}`)}
                  </h2>
                  <Prose text={t(`privacyPage.${bodyKey}`)} className="mt-2" />
                  {id === "contact" && (
                    <Link
                      to="/contact"
                      className="mt-6 inline-flex rounded-xl bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-900"
                    >
                      {t("privacyPage.contactCta")}
                    </Link>
                  )}
                </motion.section>
              ))}
            </div>
          </article>
        </div>
      </div>

      <SiteFooter showCta={false} />
    </div>
  );
}
