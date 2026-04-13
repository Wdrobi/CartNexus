import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { formatPrice } from "../utils/price.js";
import {
  productName,
  productDescription,
  categoryName,
  brandName,
} from "../utils/productText.js";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../utils/productImage.js";
import SafeImage from "../components/SafeImage.jsx";

export default function ShopProductPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) throw new Error("404");
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setProduct(data.product);
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
  }, [slug]);

  return (
    <div className="min-h-screen bg-grid-fade">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <Link
          to="/shop"
          className="text-sm text-brand-400 transition hover:text-brand-300"
        >
          ← {t("shop.back")}
        </Link>

        {loading && <p className="mt-10 text-slate-500">{t("shop.loading")}</p>}
        {error && (
          <p className="mt-10 text-slate-400">
            {error === "404" ? t("shop.notFound") : t("shop.error")}
          </p>
        )}
        {product && !loading && (
          <motion.div
            className="mt-8 grid gap-10 md:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
              <SafeImage
                src={product.image_url ?? product.imageUrl}
                seed={product.id}
                fallback={PRODUCT_IMAGE_FALLBACK}
                fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-400">
                {categoryName(
                  {
                    name_bn: product.category_name_bn,
                    name_en: product.category_name_en,
                  },
                  i18n.language
                )}
                {product.brand_slug ? (
                  <>
                    {" · "}
                    <Link
                      to={`/shop?brand=${encodeURIComponent(product.brand_slug)}`}
                      className="text-brand-300 transition hover:text-white"
                    >
                      {brandName(
                        {
                          name_bn: product.brand_name_bn,
                          name_en: product.brand_name_en,
                        },
                        i18n.language
                      )}
                    </Link>
                  </>
                ) : null}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                {productName(product, i18n.language)}
              </h1>
              <p className="mt-4 text-lg text-slate-400">
                {productDescription(product, i18n.language)}
              </p>
              <p className="mt-6 text-2xl font-semibold text-brand-300">
                {formatPrice(product.price, i18n.language)}
                {product.compare_at_price ? (
                  <span className="ml-3 text-lg font-normal text-slate-500 line-through">
                    {formatPrice(product.compare_at_price, i18n.language)}
                  </span>
                ) : null}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                {t("shop.stock")}: {product.stock}
              </p>
            </div>
          </motion.div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
