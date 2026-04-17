import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { categoryName } from "../../utils/productText.js";
import HomeProductCard from "./HomeProductCard.jsx";

export default function HomeProductShowcase({
  titleKey,
  subtitleKey,
  viewAllTo,
  viewAllKey,
  products,
  loading,
  showNewBadge,
  /** Flat layout: no scroll-snap row, minimal product cards */
  simple = false,
  /** Category filter tabs (slug → API filter) */
  categories = [],
  selectedCategorySlug = "",
  onSelectCategory,
}) {
  const { t, i18n } = useTranslation();
  const showCategoryTabs = typeof onSelectCategory === "function" && categories.length > 0;

  function pillClass(active) {
    return [
      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
      active
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50",
    ].join(" ");
  }

  return (
    <section
      className={
        simple
          ? "border-b border-neutral-200 bg-white py-10 sm:py-12"
          : "border-b border-brand-100 bg-white py-12 sm:py-14"
      }
    >
      <div className="w-full px-[20px]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={simple ? "text-lg font-semibold text-neutral-900 sm:text-xl" : "font-display text-2xl font-bold text-ink-900 sm:text-3xl"}>
              {t(titleKey)}
            </h2>
            {subtitleKey ? (
              <p className={simple ? "mt-1 max-w-xl text-sm text-neutral-600" : "mt-2 max-w-xl text-sm text-neutral-600 sm:text-base"}>
                {t(subtitleKey)}
              </p>
            ) : null}
          </div>
          <Link
            to={viewAllTo}
            className={
              simple
                ? "text-sm text-neutral-700 underline-offset-2 hover:underline"
                : "inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline-offset-4 transition hover:text-brand-800 hover:underline"
            }
          >
            {t(viewAllKey)}
            <span aria-hidden> →</span>
          </Link>
        </div>

        {showCategoryTabs ? (
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={t("home.showcaseCategoryTabsAria")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={!selectedCategorySlug}
              className={pillClass(!selectedCategorySlug)}
              onClick={() => onSelectCategory("")}
            >
              {t("home.showcaseCategoryAll")}
            </button>
            {categories.map((c) => {
              const active = selectedCategorySlug === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={pillClass(active)}
                  onClick={() => onSelectCategory(c.slug)}
                >
                  {categoryName(c, i18n.language)}
                </button>
              );
            })}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-8 text-center text-sm text-neutral-500">{t("home.productsLoading")}</p>
        ) : !products?.length ? (
          <p className="mt-8 text-center text-sm text-neutral-500">{t("home.productsEmpty")}</p>
        ) : simple ? (
          <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {products.map((p) => (
              <HomeProductCard key={p.id} product={p} showNewBadge={showNewBadge} variant="minimal" />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: Math.min(0.05 * i, 0.25), duration: 0.35 }}
                className="flex h-full min-h-0 snap-start w-[min(17.5rem,86vw)] shrink-0 flex-col sm:snap-none sm:w-full"
              >
                <HomeProductCard product={p} showNewBadge={showNewBadge} variant="light" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
