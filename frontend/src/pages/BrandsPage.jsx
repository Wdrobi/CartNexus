import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { brandName } from "../utils/productText.js";

export default function BrandsPage() {
  const { t, i18n } = useTranslation();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/brands")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setBrands(data.brands || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
            {t("brandsPage.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">{t("brandsPage.subtitle")}</p>
        </motion.div>

        {loading && (
          <p className="mt-14 text-center text-slate-500">{t("shop.loading")}</p>
        )}
        {error && (
          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            {t("brandsPage.error")}
            <code className="ml-2 text-xs">{error}</code>
          </div>
        )}

        {!loading && !error && brands.length === 0 && (
          <p className="mt-14 text-center text-slate-500">{t("brandsPage.empty")}</p>
        )}

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {brands.map((b, idx) => {
            const name = brandName(b, i18n.language);
            const count = Number(b.product_count) || 0;
            const cover = b.cover_image || null;
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.04 * idx, 0.4), duration: 0.35 }}
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-brand-300/70 hover:shadow-md">
                  <Link
                    to={`/shop?brand=${encodeURIComponent(b.slug)}`}
                    className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-500/15 to-ink-900/10">
                        <span className="font-display text-4xl font-bold text-brand-600/40">
                          {name.slice(0, 1)}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">CartNexus</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="font-display text-lg font-bold text-white drop-shadow-sm sm:text-xl">{name}</h2>
                      <p className="mt-1 text-sm text-white/90">
                        {t("brandsPage.productCount", { count })}
                      </p>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{t("brandsPage.cardHint")}</p>
                    <Link
                      to={`/shop?brand=${encodeURIComponent(b.slug)}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-ink-950 py-3 text-sm font-semibold text-white transition hover:bg-ink-900"
                    >
                      {t("brandsPage.shopBrand")}
                    </Link>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
