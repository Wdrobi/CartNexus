import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SafeImage from "../SafeImage.jsx";
import {
  PRODUCT_IMAGE_FALLBACK,
  PRODUCT_IMAGE_FALLBACK_ALT,
  categoryCoverUrl,
} from "../../utils/productImage.js";
import { categoryName } from "../../utils/productText.js";

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

/** Suggests “browse all categories” */
function IconCategoryGrid({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" opacity="0.92" />
    </svg>
  );
}

const navBtnClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:scale-95";

const viewAllNavClass =
  "inline-flex h-10 max-w-[11rem] shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white px-2.5 text-[0.7rem] font-semibold leading-tight text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:scale-95 sm:max-w-none sm:gap-2 sm:px-3 sm:text-xs";

/**
 * @param {{ categories: Array<{ id: number; slug: string; name_bn?: string; name_en?: string }>; loading: boolean }} props
 */
export default function HomeShopByCategory({ categories, loading }) {
  const { t, i18n } = useTranslation();
  const scrollerRef = useRef(null);

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <section className="border-b border-neutral-200 bg-neutral-100/90 py-8 sm:py-10">
      <div className="w-full px-[20px]">
        <div className="rounded-[1.35rem] border border-rose-100/80 bg-gradient-to-b from-rose-50/95 to-[#fdf6f7] p-5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] ring-1 ring-rose-100/60 sm:rounded-[1.75rem] sm:p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                {t("home.dmCategoryTitle")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 sm:text-[0.95rem]">{t("home.dmCategoryLead")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className={navBtnClass}
                onClick={() => scrollByDir(-1)}
                aria-label={t("home.shopByCategoryScrollPrev")}
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={navBtnClass}
                onClick={() => scrollByDir(1)}
                aria-label={t("home.shopByCategoryScrollNext")}
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
              {!loading && categories.length > 0 && (
                <Link
                  to="/categories"
                  className={viewAllNavClass}
                  title={t("home.dmCategoryViewAll")}
                >
                  <IconCategoryGrid className="h-4 w-4 shrink-0 opacity-90 sm:h-[1.05rem] sm:w-[1.05rem]" />
                  <span className="min-w-0 truncate sm:whitespace-nowrap">{t("home.dmCategoryViewAll")}</span>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <p className="mt-10 text-center text-sm text-neutral-500">{t("shop.loading")}</p>
          ) : categories.length === 0 ? (
            <p className="mt-10 text-center text-sm text-neutral-500">{t("categoriesPage.empty")}</p>
          ) : (
            <div
              ref={scrollerRef}
              className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((c) => {
                const name = categoryName(c, i18n.language);
                const cover = categoryCoverUrl(c);
                return (
                  <Link
                    key={c.id}
                    to={`/categories/${encodeURIComponent(c.slug)}`}
                    className="group relative block aspect-[3/4.15] w-[42vw] max-w-[15rem] shrink-0 overflow-hidden rounded-2xl bg-neutral-200 shadow-md ring-1 ring-black/5 transition hover:shadow-lg hover:ring-black/10 sm:w-[32vw] sm:max-w-[15.5rem] sm:rounded-[1.1rem] md:w-[24vw] md:max-w-[16rem] lg:w-[12.75rem]"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <SafeImage
                        src={cover}
                        seed={c.id}
                        fallback={PRODUCT_IMAGE_FALLBACK}
                        fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 ease-out will-change-transform group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 z-[2] p-4 pb-[3.25rem] sm:p-5 sm:pb-14">
                      <p className="font-serif text-lg font-semibold leading-snug tracking-tight text-white drop-shadow-md sm:text-xl md:text-2xl">
                        {name}
                      </p>
                      <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/90">
                        {t("home.shopByCategoryExplore")}
                      </p>
                    </div>
                    <span
                      className="absolute bottom-4 right-4 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-white shadow-md ring-1 ring-white/50 transition duration-200 group-hover:scale-110 group-hover:bg-white/45 group-hover:ring-white/70 sm:bottom-5 sm:right-5 sm:h-10 sm:w-10"
                      aria-hidden
                    >
                      <IconArrowRight className="h-4 w-4 -translate-x-px sm:h-[1.05rem] sm:w-[1.05rem]" />
                    </span>
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
