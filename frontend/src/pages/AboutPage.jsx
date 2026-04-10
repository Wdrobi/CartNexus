import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const AVATAR_STYLES = [
  "from-brand-500 to-teal-600",
  "from-teal-500 to-brand-700",
  "from-ink-800 to-brand-600",
];

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() || "?";
}

function StarRow({ className = "", align = "center" }) {
  const justify = align === "start" ? "justify-start" : "justify-center";
  return (
    <div className={`flex gap-0.5 ${justify} ${className}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TestimonialsShowcase({ keys }) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hoverPause, setHoverPause] = useState(false);
  const len = keys.length;

  const go = useCallback(
    (dir) => {
      setIndex((i) => (i + dir + len) % len);
    },
    [len]
  );

  const pick = useCallback((i) => {
    setIndex(i);
  }, []);

  useEffect(() => {
    if (hoverPause || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % len), 5200);
    return () => clearInterval(id);
  }, [hoverPause, reduceMotion, len]);

  const slideVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 36 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -36 },
      };

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <p className="text-center text-xs text-slate-500">{t("aboutPage.testimonialHint")}</p>

      <div
        className="relative mt-6 rounded-[1.75rem] outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("aboutPage.testimonialsTitle")}
        onMouseEnter={() => setHoverPause(true)}
        onMouseLeave={() => setHoverPause(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-brand-50/50 p-8 shadow-[0_20px_50px_-12px_rgba(15,118,110,0.15)] md:p-11"
          initial={false}
          animate={hoverPause ? { scale: 1.008 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-400/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl"
            aria-hidden
          />

          <StarRow className="relative" />

          <div className="relative mt-8 min-h-[200px] sm:min-h-[180px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={keys[index]}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <blockquote className="max-w-2xl">
                  <p className="font-display text-lg font-medium leading-relaxed text-slate-800 sm:text-xl md:text-[1.35rem] md:leading-snug">
                    <span className="text-brand-500/90">&ldquo;</span>
                    {t(`aboutPage.${keys[index]}Quote`)}
                    <span className="text-brand-500/90">&rdquo;</span>
                  </p>
                </blockquote>
                <div className="mt-8 flex flex-col items-center gap-1">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-md ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                  >
                    {initialsFromName(t(`aboutPage.${keys[index]}Name`))}
                  </div>
                  <p className="mt-2 font-display text-base font-bold text-ink-950">
                    {t(`aboutPage.${keys[index]}Name`)}
                  </p>
                  <p className="text-sm font-medium text-brand-700">{t(`aboutPage.${keys[index]}Role`)}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mt-8 flex items-center justify-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              aria-label={t("aboutPage.testimonialPrev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2" role="tablist" aria-label={t("aboutPage.testimonialsTitle")}>
              {keys.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={t("aboutPage.testimonialGoTo", { n: i + 1 })}
                  onClick={() => pick(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                    i === index ? "w-8 bg-brand-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              aria-label={t("aboutPage.testimonialNext")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {keys.map((key, i) => {
            const active = i === index;
            return (
              <li key={key}>
                <motion.button
                  type="button"
                  onClick={() => pick(i)}
                  whileHover={reduceMotion ? {} : { y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full flex-col rounded-2xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                    active
                      ? "border-brand-400 bg-white shadow-md shadow-brand-500/10 ring-2 ring-brand-500/20"
                      : "border-slate-200/90 bg-white/80 hover:border-brand-200 hover:bg-white"
                  }`}
                >
                  <StarRow align="start" className="scale-90" />
                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-slate-600">
                    {t(`aboutPage.${key}Quote`)}
                  </p>
                  <p className="mt-3 text-sm font-bold text-ink-950">{t(`aboutPage.${key}Name`)}</p>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function IconLayers({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5Z" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinejoin="round" />
    </svg>
  );
}

function IconShieldCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTruck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 17h10V8h-3l-3-3H4v12h2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </svg>
  );
}

function ArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function AboutPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ products: null, categories: null, brands: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/products?limit=1").then((r) => (r.ok ? r.json() : {})),
      fetch("/api/categories").then((r) => (r.ok ? r.json() : {})),
      fetch("/api/brands").then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([prodData, catData, brandData]) => {
        if (cancelled) return;
        setStats({
          products: prodData.total != null ? Number(prodData.total) : null,
          categories: Array.isArray(catData.categories) ? catData.categories.length : null,
          brands: Array.isArray(brandData.brands) ? brandData.brands.length : null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const statDisplay = (n) => (n == null ? "—" : n >= 100 ? `${n}+` : String(n));

  const principles = [
    { key: "p1" },
    { key: "p2" },
    { key: "p3" },
    { key: "p4" },
  ];

  const steps = [
    { key: "s1", icon: IconLayers },
    { key: "s2", icon: IconShieldCheck },
    { key: "s3", icon: IconTruck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-90" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-28">
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {t("aboutPage.heroKicker")}
          </motion.p>
          <motion.h1
            className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            {t("aboutPage.heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {t("aboutPage.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("aboutPage.trustTitle")}</h2>
            <p className="mt-3 text-lg font-medium text-brand-800">{t("aboutPage.trustLead")}</p>
            <p className="mt-4 text-slate-600 leading-relaxed">{t("aboutPage.trustBody")}</p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-display text-xl font-bold text-ink-950 md:text-2xl">
            {t("aboutPage.statsTitle")}
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[
              { value: statDisplay(stats.products), labelKey: "statProductsLabel" },
              { value: statDisplay(stats.categories), labelKey: "statCategoriesLabel" },
              { value: statDisplay(stats.brands), labelKey: "statBrandsLabel" },
              { value: t("aboutPage.statSupportValue"), labelKey: "statSupportLabel" },
            ].map((item, idx) => (
              <motion.li
                key={item.labelKey}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                custom={idx}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(15,118,110,0.18)" }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <motion.p
                  className="font-display text-3xl font-bold text-brand-700 md:text-4xl"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.value}
                </motion.p>
                <p className="mt-2 text-sm font-medium text-slate-600">{t(`aboutPage.${item.labelKey}`)}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            className="grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("aboutPage.storyKicker")}</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("aboutPage.storyTitle")}</h2>
            </div>
            <div className="lg:col-span-8 space-y-5 text-slate-600 leading-relaxed">
              <p>{t("aboutPage.storyP1")}</p>
              <p>{t("aboutPage.storyP2")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-slate-50 py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("aboutPage.valuesKicker")}</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("aboutPage.valuesTitle")}</h2>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {principles.map(({ key }, idx) => (
              <motion.li
                key={key}
                className="cursor-default rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-colors hover:border-brand-200/80"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                custom={idx}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              >
                <h3 className="font-display text-lg font-bold text-ink-950">{t(`aboutPage.${key}Title`)}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t(`aboutPage.${key}Body`)}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("aboutPage.processKicker")}</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("aboutPage.processTitle")}</h2>
            <p className="mt-4 text-slate-600">{t("aboutPage.processIntro")}</p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map(({ key, icon: Icon }, idx) => (
              <motion.li
                key={key}
                className="relative rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 pt-10 transition-colors hover:border-brand-300/50 hover:bg-white"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                custom={idx}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                <span className="absolute left-6 top-4 font-display text-4xl font-bold text-brand-200/90">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="mb-4 inline-flex rounded-xl bg-brand-100 p-3 text-brand-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-ink-950">{t(`aboutPage.${key}Title`)}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t(`aboutPage.${key}Body`)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-slate-50 py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("aboutPage.testimonialsKicker")}</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("aboutPage.testimonialsTitle")}</h2>
            <p className="mt-3 text-slate-600">{t("aboutPage.testimonialsIntro")}</p>
          </motion.div>
          <TestimonialsShowcase keys={["t1", "t2", "t3"]} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-950 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,212,191,0.12),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">{t("aboutPage.ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300 leading-relaxed">{t("aboutPage.ctaSubtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              to="/shop"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400 sm:w-auto"
            >
              {t("aboutPage.ctaShop")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10 sm:w-auto"
            >
              {t("aboutPage.ctaContact")}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter showCta={false} />
    </div>
  );
}
