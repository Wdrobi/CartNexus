import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch, resolvePublicAssetUrl } from "../../api/apiBase.js";
import SafeImage from "../SafeImage.jsx";

function pickLang(lang, en, bn) {
  const useBn = String(lang || "").toLowerCase().startsWith("bn");
  if (useBn && bn != null && String(bn).trim() !== "") return String(bn);
  if (en != null && String(en).trim() !== "") return String(en);
  return bn != null ? String(bn) : "";
}

/** Auto-advance interval (both hero images required in admin). Hover pause only when interval is slower. */
const AUTO_MS = 50;

/** Crossfade duration — must stay below interval so slides visibly swap (was stuck when fade > interval). */
function fadeDurationMs(reduceMotion, intervalMs) {
  if (reduceMotion) return 0;
  if (intervalMs <= 80) return Math.max(0, Math.floor(intervalMs * 0.45));
  return Math.min(320, Math.max(180, intervalMs - 160));
}

const PAUSE_ON_HOVER = AUTO_MS >= 400;

function IconChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomeHeroBanner() {
  const { t, i18n } = useTranslation();
  const [hero, setHero] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduceMotion(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/home/hero")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.hero) return;
        setHero(data.hero);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    if (!hero) return [];
    const a = resolvePublicAssetUrl(hero.image_1_url);
    const b = resolvePublicAssetUrl(hero.image_2_url);
    return [a, b].filter(Boolean);
  }, [hero]);

  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return undefined;
    if (PAUSE_ON_HOVER && hovered) return undefined;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [slides.length, reduceMotion, hovered]);

  useEffect(() => {
    const onKey = (e) => {
      if (slides.length < 2) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, goPrev, goNext]);

  if (loadError || !hero) {
    return null;
  }

  const lang = i18n.language;
  const headline = pickLang(lang, hero.headline_en, hero.headline_bn);
  const subtext = pickLang(lang, hero.subtext_en, hero.subtext_bn);
  const ctaLabel = pickLang(lang, hero.cta_label_en, hero.cta_label_bn);
  const ctaPath = String(hero.cta_url || "/shop").trim() || "/shop";
  const isExternal = /^https?:\/\//i.test(ctaPath);

  const from = hero.gradient_from || "#0f172a";
  const to = hero.gradient_to || "#0f766e";
  const fadeMs = fadeDurationMs(reduceMotion, AUTO_MS);

  const arrowBtnClass =
    "pointer-events-auto absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/80 sm:h-12 sm:w-12 opacity-95 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

  const ctaClass =
    "pointer-events-auto inline-flex max-w-full items-center justify-center gap-2 break-words rounded-full bg-brand-500 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400 sm:px-7 sm:text-sm";

  const ctaInner = (
    <>
      {ctaLabel}
      <span aria-hidden>→</span>
    </>
  );

  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-b border-neutral-200 bg-neutral-900"
      aria-roledescription="carousel"
      aria-label={t("home.heroBannerAria")}
    >
      <div
        className="group relative min-h-[min(88dvh,920px)] w-full overflow-hidden sm:min-h-[min(82dvh,880px)]"
        onMouseEnter={() => PAUSE_ON_HOVER && setHovered(true)}
        onMouseLeave={() => PAUSE_ON_HOVER && setHovered(false)}
      >
        {slides.length > 0 &&
          slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: i === active ? 1 : 0,
                transition: `opacity ${fadeMs}ms ease-in-out`,
                zIndex: 0,
              }}
              aria-hidden={i !== active}
            >
              <SafeImage
                src={src}
                seed={i}
                alt=""
                className="h-full w-full object-cover object-center"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}

        {/* Readability scrim + brand tint */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink-950/75 via-ink-950/45 to-ink-950/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light"
          style={{
            opacity: 0.55,
            background: `linear-gradient(135deg, ${from} 0%, transparent 45%, ${to} 100%)`,
          }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-[20px] py-20 text-center sm:py-24">
          <h1 className="pointer-events-none max-w-3xl break-words font-display text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl md:leading-tight lg:text-[2.35rem]">
            {headline}
          </h1>
          <p className="pointer-events-none mt-4 max-w-2xl break-words text-sm leading-relaxed text-white/90 drop-shadow sm:text-base md:text-lg">
            {subtext}
          </p>
          <div className="pointer-events-auto mt-8">
            {isExternal ? (
              <a href={ctaPath} className={ctaClass}>
                {ctaInner}
              </a>
            ) : (
              <Link to={ctaPath} className={ctaClass}>
                {ctaInner}
              </Link>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className={`${arrowBtnClass} left-2 sm:left-4`}
              onClick={goPrev}
              aria-label={t("home.bannerPrev")}
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className={`${arrowBtnClass} right-2 sm:right-4`}
              onClick={goNext}
              aria-label={t("home.bannerNext")}
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
            <div
              className="pointer-events-auto absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-6"
              role="tablist"
              aria-label={t("home.heroDotsAria")}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={t("home.bannerGoTo", { n: i + 1 })}
                  className={`h-1.5 w-9 rounded-full transition sm:w-10 ${i === active ? "bg-white" : "bg-white/35 hover:bg-white/55"}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
