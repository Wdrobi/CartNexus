import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Skincare / bottles lifestyle — reference-style composition */
const BG_IMAGE =
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=2000&h=1200&q=85";

function pad2(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function IconSparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2zm0 10l1 3.5L16 17l-3 1.5L12 22l-1-3.5L8 17l3-1.5 1.5-3.5z" />
    </svg>
  );
}

function IconStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4L12 17.8l-6.3 4.6 2.4-7.4-6.3-4.6h7.8L12 2z" />
    </svg>
  );
}

function IconBag({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" strokeLinecap="round" />
    </svg>
  );
}

function IconClock({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePremiumPromo() {
  const { t } = useTranslation();
  const endAt = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, endAt - now);
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((diff % (60 * 1000)) / 1000);

  const unitClass =
    "flex min-w-[3.25rem] flex-col items-center rounded-xl bg-black/55 px-2 py-2.5 ring-1 ring-white/15 sm:min-w-[3.75rem] sm:px-3 sm:py-3";

  return (
    <section className="group/section w-full border-b border-neutral-200 bg-neutral-100 py-8 sm:py-10">
      <div className="w-full px-[20px]">
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:rounded-[2rem]">
          <div className="absolute inset-0 isolate min-h-[22rem] overflow-hidden rounded-[inherit] bg-ink-950 sm:min-h-[26rem]">
            {/*
              Right → left: sharp on the right, blur increases toward the left (gradient blend, no vertical “split” strip).
              Blur layer below; sharp layer on top with soft mask.
            */}
            <img
              src={BG_IMAGE}
              alt=""
              style={{
                maskImage:
                  "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.2) 78%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.2) 78%, transparent 100%)",
              }}
              className="pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-[68%] min-w-[260px] max-w-[940px] origin-right scale-[1.06] object-cover object-right brightness-[0.9] saturate-[0.92] blur-[22px] transition duration-[1.2s] ease-out will-change-transform motion-safe:group-hover/section:scale-[1.12] sm:w-[64%] sm:blur-[24px] md:w-[62%]"
              loading="lazy"
              decoding="async"
            />
            <img
              src={BG_IMAGE}
              alt=""
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 12%, rgba(0,0,0,0.92) 28%, #000 42%, #000 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 12%, rgba(0,0,0,0.92) 28%, #000 42%, #000 100%)",
              }}
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] h-full w-[68%] min-w-[260px] max-w-[940px] origin-right object-cover object-right brightness-[0.93] saturate-[0.95] transition duration-[1.2s] ease-out will-change-transform motion-safe:group-hover/section:scale-[1.08] sm:w-[64%] md:w-[62%]"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-0 z-[2] bg-gradient-to-r from-[#070a10]/98 from-[0%] via-[#0c1018]/85 via-[30%] to-transparent to-[56%]"
              aria-hidden
            />
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-black/75" aria-hidden />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[56%] bg-[radial-gradient(ellipse_95%_80%_at_75%_25%,rgba(255,255,255,0.04),transparent_55%)]"
              aria-hidden
            />
          </div>

          <div className="relative z-10 grid gap-10 p-6 sm:p-8 md:grid-cols-2 md:gap-12 md:p-10 lg:p-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-100/95 sm:text-xs">
                <IconSparkle className="h-3.5 w-3.5 text-amber-300" />
                {t("home.premiumPromo.badge")}
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-[2rem] lg:text-[2.25rem]">
                {t("home.premiumPromo.title")}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#e8e8e8] [text-shadow:0_1px_12px_rgba(0,0,0,0.65)] sm:text-base sm:leading-relaxed">
                {t("home.premiumPromo.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3" aria-label={t("home.premiumPromo.countdownAria")}>
                <div className={unitClass}>
                  <span className="text-xl font-bold tabular-nums text-amber-300 sm:text-2xl">{pad2(days)}</span>
                  <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white/75">
                    {t("home.premiumPromo.days")}
                  </span>
                </div>
                <span className="pb-6 text-lg font-light text-white/65 sm:text-xl" aria-hidden>
                  :
                </span>
                <div className={unitClass}>
                  <span className="text-xl font-bold tabular-nums text-amber-300 sm:text-2xl">{pad2(hours)}</span>
                  <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white/75">
                    {t("home.premiumPromo.hours")}
                  </span>
                </div>
                <span className="pb-6 text-lg font-light text-white/65 sm:text-xl" aria-hidden>
                  :
                </span>
                <div className={unitClass}>
                  <span className="text-xl font-bold tabular-nums text-amber-300 sm:text-2xl">{pad2(mins)}</span>
                  <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white/75">
                    {t("home.premiumPromo.mins")}
                  </span>
                </div>
                <span className="pb-6 text-lg font-light text-white/65 sm:text-xl" aria-hidden>
                  :
                </span>
                <div className={unitClass}>
                  <span className="text-xl font-bold tabular-nums text-amber-300 sm:text-2xl">{pad2(secs)}</span>
                  <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white/75">
                    {t("home.premiumPromo.secs")}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/shop?sort=hot"
                  className="premium-shop-cta relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(236,72,153,0.55)] ring-1 ring-white/25 transition hover:shadow-[0_16px_48px_-10px_rgba(236,72,153,0.65)] sm:px-8"
                >
                  <span
                    className="premium-cta-shimmer-bar pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
                    aria-hidden
                  >
                    <span className="absolute -inset-y-4 left-0 w-[42%] max-w-[11rem] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-90" />
                  </span>
                  <IconBag className="relative z-10 h-5 w-5 shrink-0" />
                  <span className="relative z-10">{t("home.premiumPromo.shopCollection")}</span>
                </Link>
                <Link
                  to="/shop?sale=1"
                  className="group/explore inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/45 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-black/60 hover:shadow-lg"
                >
                  {t("home.premiumPromo.exploreOffers")}
                  <span aria-hidden className="transition group-hover/explore:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-3 sm:items-end sm:gap-3.5 md:max-w-none">
              <div className="premium-feature-card group/card w-full max-w-[15.5rem] rounded-xl border border-white/18 bg-ink-900 p-4 shadow-lg transition duration-300 sm:max-w-[16.25rem] sm:rounded-2xl sm:p-4 md:p-5 hover:-translate-y-0.5 hover:border-amber-500/35 hover:bg-ink-800 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.55)]">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 shadow-md shadow-orange-950/40 ring-2 ring-white/10 transition group-hover/card:scale-105 group-hover/card:ring-amber-300/40 sm:h-12 sm:w-12">
                    <IconStar className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-white sm:text-lg md:text-xl">{t("home.premiumPromo.card1Title")}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-300 sm:text-sm">{t("home.premiumPromo.card1Body")}</p>
                  </div>
                </div>
              </div>
              <div className="premium-feature-card group/card w-full max-w-[15.5rem] rounded-xl border border-white/18 bg-ink-900 p-4 shadow-lg transition duration-300 sm:max-w-[16.25rem] sm:rounded-2xl sm:p-4 md:p-5 hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-ink-800 hover:shadow-[0_16px_36px_-12px_rgba(6,95,70,0.22)]">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-700 shadow-md shadow-emerald-950/35 ring-2 ring-white/10 transition group-hover/card:scale-105 group-hover/card:ring-emerald-300/40 sm:h-12 sm:w-12">
                    <IconClock className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-white sm:text-lg md:text-xl">{t("home.premiumPromo.card2Title")}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-300 sm:text-sm">{t("home.premiumPromo.card2Body")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
