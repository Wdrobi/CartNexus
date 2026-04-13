import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import HomeProductCard from "./HomeProductCard.jsx";

export default function HomeProductShowcase({
  titleKey,
  subtitleKey,
  viewAllTo,
  viewAllKey,
  products,
  loading,
  showNewBadge,
}) {
  const { t } = useTranslation();

  return (
    <section className="border-b border-brand-100 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t(titleKey)}</h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">{t(subtitleKey)}</p>
          </div>
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline-offset-4 transition hover:text-brand-800 hover:underline"
          >
            {t(viewAllKey)}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-slate-500">{t("home.productsLoading")}</p>
        ) : !products?.length ? (
          <p className="mt-10 text-center text-slate-500">{t("home.productsEmpty")}</p>
        ) : (
          <>
            <div className="mt-10 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: Math.min(0.05 * i, 0.25), duration: 0.35 }}
                  className="snap-start sm:snap-none"
                >
                  <HomeProductCard product={p} showNewBadge={showNewBadge} variant="light" />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
