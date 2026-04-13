import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../utils/price.js";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../../utils/productImage.js";
import { productName } from "../../utils/productText.js";
import SafeImage from "../SafeImage.jsx";

export default function HomeProductCard({ product, showNewBadge, variant = "light" }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isLight = variant === "light";
  const onSale =
    product.compare_at_price != null && Number(product.compare_at_price) > Number(product.price);
  const pct =
    onSale && product.compare_at_price
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;

  return (
    <motion.article
      className="group w-[240px] shrink-0 sm:w-full sm:shrink"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/shop/${product.slug}`}
        className={`block overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${
          isLight
            ? "border-brand-100 bg-white hover:border-brand-200"
            : "border-white/10 bg-ink-900/60 hover:border-brand-500/35 hover:shadow-brand-900/20"
        }`}
      >
        <div className={`relative aspect-[4/5] overflow-hidden ${isLight ? "bg-neutral-100" : "bg-ink-800"}`}>
          <SafeImage
            src={product.image_url ?? product.imageUrl}
            seed={product.id}
            fallback={PRODUCT_IMAGE_FALLBACK}
            fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {onSale ? (
              <span className="rounded bg-brand-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {pct > 0 ? `-${pct}%` : t("home.productSaleBadge")}
              </span>
            ) : null}
            {showNewBadge ? (
              <span className="rounded bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {t("home.productNewBadge")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3
            className={`line-clamp-2 font-display text-sm font-semibold leading-snug ${
              isLight ? "text-ink-900 group-hover:text-brand-800" : "text-white group-hover:text-brand-200"
            }`}
          >
            {productName(product, lang)}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className={`font-semibold ${isLight ? "text-brand-800" : "text-brand-300"}`}>
              {formatPrice(product.price, lang)}
            </span>
            {onSale ? (
              <span className="text-xs text-neutral-500 line-through">{formatPrice(product.compare_at_price, lang)}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
