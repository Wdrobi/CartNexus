import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HOME_BANNERS } from "../../data/homeBanners.js";
import SafeImage from "../SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK_ALT, WIDE_IMAGE_FALLBACK } from "../../utils/productImage.js";

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Auto-advance interval (ms). */
const AUTO_MS = 5500;

export default function HomeBannerCarousel() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const n = HOME_BANNERS.length;

  /* Auto-advance; restart interval when slide changes so manual nav gets a full delay. */
  useEffect(() => {
    if (reduce || n <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [n, reduce, index]);

  const go = (dir) => {
    setIndex((i) => (dir === "next" ? (i + 1) % n : (i - 1 + n) % n));
  };

  const slide = HOME_BANNERS[index];

  /** Same 16∶9 frame on every slide — URLs use identical crop (see homeBanners.js). */
  const imagePane = (
    <div className="relative order-1 w-full overflow-hidden bg-brand-50 md:order-2">
      <div className="relative aspect-[16/9] w-full">
        <SafeImage
          src={slide.image}
          seed={slide.id}
          fallback={WIDE_IMAGE_FALLBACK}
          fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/35 to-transparent md:from-white/90 md:via-white/25"
          aria-hidden
        />
      </div>
    </div>
  );

  return (
    <section className="bg-brand-50/40 py-10 sm:py-12" aria-roledescription="carousel">
      <div className="relative w-full px-[20px]">
        <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm ring-1 ring-brand-100/60">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              initial={{ opacity: 0, x: reduce ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduce ? 0 : -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 md:items-center"
            >
              <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 md:order-1 md:py-12 lg:pl-14">
                <span className="inline-flex w-fit rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-800">
                  {t(slide.badgeKey)}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-ink-900 sm:text-3xl md:text-[1.75rem]">
                  {t(slide.titleKey)}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-[15px]">{t(slide.subtitleKey)}</p>
                <div className="mt-8">
                  <Link
                    to={slide.to}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-900/10 transition hover:bg-brand-700"
                  >
                    {t(slide.ctaKey)}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
              {imagePane}
            </motion.div>
          </AnimatePresence>

          {n > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go("prev")}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-800 shadow-md transition hover:bg-brand-50 md:left-4"
                aria-label={t("home.bannerPrev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go("next")}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-800 shadow-md transition hover:bg-brand-50 md:right-4"
                aria-label={t("home.bannerNext")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {HOME_BANNERS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-brand-600" : "w-1.5 bg-brand-200 hover:bg-brand-300"}`}
                    aria-label={t("home.bannerGoTo", { n: i + 1 })}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
