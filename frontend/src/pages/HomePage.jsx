import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const viewFade = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function IconShop({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 9l1.5 12h15L21 9M3 9h18l-2-6H5L3 9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13v6M15 13v6" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className }) {
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

function IconBolt({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" strokeLinejoin="round" />
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

export default function HomePage() {
  const { t } = useTranslation();
  const [productCount, setProductCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products?limit=200")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.products) {
          setProductCount(data.products.length);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const featureItems = [
    { key: "shop", icon: IconShop },
    { key: "manage", icon: IconShield },
    { key: "experience", icon: IconBolt },
  ];

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="fixed inset-0 bg-grid-fade opacity-90" aria-hidden />
      <div className="fixed inset-0 bg-hero-mesh opacity-100" aria-hidden />

      <div className="relative">
        <SiteHeader />

        <main>
          <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-6 lg:pb-28 lg:pt-10">
            <motion.div
              className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-[100px] md:right-10"
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-400/10 blur-[90px]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />

            <div className="relative grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <motion.p
                  className="mb-5 inline-flex items-center rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300"
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  {t("home.badge")}
                </motion.p>
                <motion.h1
                  className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem]"
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  {t("home.titleLine1")}{" "}
                  <span className="text-gradient-brand">{t("home.titleHighlight")}</span>
                </motion.h1>
                <motion.p
                  className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl"
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  {t("home.description")}
                </motion.p>

                <motion.div
                  className="mt-8 flex flex-wrap gap-3"
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    {t("home.trustFast")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    {t("home.trustSecure")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    {t("home.trustBilingual")}
                  </span>
                </motion.div>

                <motion.div
                  className="mt-10 flex flex-wrap gap-4"
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/shop"
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-ink-950 shadow-xl shadow-black/20 transition hover:bg-brand-50"
                    >
                      {t("home.ctaShop")}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.p
                  className="mt-8 text-sm text-slate-500"
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  {productCount == null
                    ? t("home.statsLoading")
                    : t("home.statsLine", { count: productCount })}
                </motion.p>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
                <motion.div
                  className="relative z-10"
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-500/25 via-transparent to-brand-800/20 blur-2xl" />
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/90 to-ink-950/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-sm font-medium text-white">{t("home.previewCart")}</span>
                      <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        {t("home.previewLive")}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02, borderColor: "rgba(45,212,191,0.25)" }}
                        >
                          <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/20" />
                          <div className="min-w-0 flex-1">
                            <div className="h-2.5 w-3/4 max-w-[140px] rounded-full bg-white/15" />
                            <div className="mt-2 h-2 w-1/2 max-w-[80px] rounded-full bg-white/10" />
                          </div>
                          <div className="h-8 w-16 shrink-0 rounded-lg bg-brand-500/20" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      type="button"
                      className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {t("home.previewCheckout")}
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -right-4 top-8 z-20 hidden w-[52%] rounded-2xl border border-white/10 bg-ink-900/95 p-4 shadow-xl backdrop-blur-md sm:block lg:-right-8 lg:top-12"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <p className="text-xs font-medium text-slate-500">{t("home.previewLive")}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">
                    {productCount != null ? productCount : "—"}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-brand-400"
                      initial={{ width: "0%" }}
                      animate={{ width: productCount != null ? "72%" : "40%" }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-2 z-0 h-24 w-24 rounded-2xl border border-brand-500/20 bg-brand-500/10 sm:-left-6"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                />
                <motion.div
                  className="absolute -right-2 bottom-12 z-0 h-16 w-16 rounded-full border border-white/10 bg-white/5 sm:right-4"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  aria-hidden
                />
              </div>
            </div>
          </section>

          <section id="features" className="relative scroll-mt-24 border-t border-white/5 bg-black/20 py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <motion.div
                className="mx-auto max-w-2xl text-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={viewFade}
              >
                <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {t("home.features.title")}
                </h2>
                <p className="mt-4 text-lg text-slate-400">{t("home.features.subtitle")}</p>
              </motion.div>

              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map(({ key, icon: Icon }, idx) => (
                  <motion.article
                    key={key}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 p-8 transition hover:border-brand-500/30 hover:bg-ink-800/60"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: idx * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="mb-5 inline-flex rounded-xl bg-brand-500/15 p-3 text-brand-300 transition group-hover:bg-brand-500/25 group-hover:text-brand-200">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {t(`home.features.${key}.title`)}
                    </h3>
                    <p className="mt-3 leading-relaxed text-slate-400">
                      {t(`home.features.${key}.body`)}
                    </p>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-400/15" />
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
