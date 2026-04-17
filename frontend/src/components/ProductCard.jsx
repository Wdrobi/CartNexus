import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/price.js";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../utils/productImage.js";
import { brandName, categoryName, productDescription, productName } from "../utils/productText.js";
import SafeImage from "./SafeImage.jsx";

/**
 * Standard product tile — same layout everywhere (shop, category, home).
 *
 * @param {{ product: object; brandHref?: string | null; showNewBadge?: boolean }} props
 */
export default function ProductCard({ product, brandHref = null, showNewBadge = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const inStock = Number(product.stock) > 0;

  return (
    <article className="group flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-md hover:ring-brand-100/60">
      <div className="relative aspect-square shrink-0 overflow-hidden bg-slate-50">
        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
              inStock ? "bg-brand-100 text-brand-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {inStock ? t("shop.inStock") : t("shop.outOfStock")}
          </span>
          {showNewBadge ? (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {t("home.productNewBadge")}
            </span>
          ) : null}
        </div>
        <div className="pointer-events-none absolute right-2 top-2 z-10 text-right font-display text-[9px] font-bold leading-tight text-slate-300 sm:text-[10px]">
          <span className="block text-ink-950/40">CART</span>
          <span className="block text-brand-500/50">NEXUS</span>
        </div>
        <Link
          to={`/shop/${product.slug}`}
          className="relative block h-full w-full overflow-hidden"
          aria-label={productName(product, lang)}
        >
          <SafeImage
            src={product.image_url ?? product.imageUrl}
            seed={product.id}
            fallback={PRODUCT_IMAGE_FALLBACK}
            fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
            alt=""
            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
        <p className="line-clamp-2 min-h-[2.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-brand-700 sm:min-h-[2.75rem] sm:text-xs">
          {categoryName(
            {
              name_bn: product.category_name_bn,
              name_en: product.category_name_en,
            },
            lang
          )}
          {brandHref ? (
            <>
              {" · "}
              <Link
                to={brandHref}
                className="transition hover:text-brand-900 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {brandName(
                  {
                    name_bn: product.brand_name_bn,
                    name_en: product.brand_name_en,
                  },
                  lang
                )}
              </Link>
            </>
          ) : null}
        </p>
        <Link
          to={`/shop/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-[2.875rem] text-sm font-semibold leading-snug text-ink-950 transition-colors hover:text-brand-700 sm:min-h-[3rem] sm:text-[15px]"
        >
          {productName(product, lang)}
        </Link>
        <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-xs leading-snug text-slate-500 sm:min-h-[2.75rem] sm:text-sm">
          {productDescription(product, lang)}
        </p>

        <div className="mt-auto flex w-full flex-col gap-1.5 pt-2">
          <div className="flex min-h-[2.75rem] flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="font-display text-base font-bold tabular-nums text-ink-950 sm:text-lg">
              {formatPrice(product.price, lang)}
            </span>
            {product.compare_at_price ? (
              <span className="text-xs font-normal text-slate-400 line-through sm:text-sm">
                {formatPrice(product.compare_at_price, lang)}
              </span>
            ) : null}
          </div>
          <Link
            to={`/shop/${product.slug}`}
            className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-xs font-semibold text-slate-800 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900 active:scale-[0.98] sm:py-2.5 sm:text-sm"
          >
            {inStock ? t("shop.viewDetails") : t("shop.viewProduct")}
          </Link>
        </div>
      </div>
    </article>
  );
}
