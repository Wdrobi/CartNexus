import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SafeImage from "../SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT, brandCoverUrl } from "../../utils/productImage.js";
import { brandName } from "../../utils/productText.js";

function IconChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 10h10M11 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStarTiny({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const navBtnClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 active:scale-95";

/** Primary CTA — gradient, lift, arrow nudge on hover */
const viewAllClass =
  "group/viewall relative inline-flex h-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600 px-3.5 text-xs font-semibold text-white shadow-[0_8px_24px_-6px_rgba(236,72,153,0.45)] ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(147,51,234,0.45)] hover:brightness-[1.05] hover:ring-white/35 active:translate-y-0 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 sm:h-11 sm:gap-2.5 sm:px-5 sm:text-sm";

/**
 * @param {{ brands: Array<{ id: number; slug: string; name_bn?: string; name_en?: string }>; loading: boolean }} props
 */
export default function HomeShopByBrand({ brands, loading }) {
  const { t, i18n } = useTranslation();
  const scrollerRef = useRef(null);

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.82) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <section className="border-b border-neutral-200/80 bg-gradient-to-b from-violet-50/40 via-rose-50/30 to-neutral-100/90 py-8 sm:py-10">
      <div className="w-full px-[20px]">
        <div className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.12)] ring-1 ring-neutral-100/80 sm:rounded-[1.75rem] sm:p-8 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 sm:text-[11px]">
                <IconStarTiny className="h-3 w-3 text-rose-500" />
                {t("home.shopByBrandBadge")}
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {t("home.dmBrandsTitle")}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-neutral-500 sm:text-[0.95rem]">{t("home.dmBrandsLead")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <button
                type="button"
                className={navBtnClass}
                onClick={() => scrollByDir(-1)}
                aria-label={t("home.shopByBrandScrollPrev")}
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={navBtnClass}
                onClick={() => scrollByDir(1)}
                aria-label={t("home.shopByBrandScrollNext")}
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
              {!loading && brands.length > 0 && (
                <Link to="/brands" className={viewAllClass} title={t("home.dmBrandsViewAll")}>
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-300 group-hover/viewall:opacity-100"
                    aria-hidden
                  />
                  <span className="relative min-w-0 truncate drop-shadow-sm">{t("home.dmBrandsViewAll")}</span>
                  <IconArrowRight className="relative h-4 w-4 shrink-0 text-white/95 transition-transform duration-300 ease-out group-hover/viewall:translate-x-0.5" />
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <p className="mt-10 text-center text-sm text-neutral-500">{t("shop.loading")}</p>
          ) : brands.length === 0 ? (
            <p className="mt-10 text-center text-sm text-neutral-500">{t("brandsPage.empty")}</p>
          ) : (
            <div
              ref={scrollerRef}
              className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
            >
              {brands.map((b) => {
                const name = brandName(b, i18n.language);
                const cover = brandCoverUrl(b);
                return (
                  <Link
                    key={b.id}
                    to={`/brands/${encodeURIComponent(b.slug)}`}
                    className="group flex w-[min(88vw,17.5rem)] shrink-0 items-center gap-3.5 overflow-hidden rounded-xl border border-neutral-100 bg-white p-3 shadow-sm ring-1 ring-neutral-100/80 transition hover:border-rose-200/60 hover:shadow-md sm:w-[17rem] sm:gap-4 sm:p-4"
                  >
                    <div className="relative h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-14 sm:w-14">
                      <SafeImage
                        src={cover}
                        seed={b.id}
                        fallback={PRODUCT_IMAGE_FALLBACK}
                        fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900 sm:text-[1.02rem]">{name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">{t("home.shopByBrandExplore")}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
