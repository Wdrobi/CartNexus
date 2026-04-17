import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { formatPrice } from "../utils/price.js";
import { productName, productDescription, categoryName, brandName } from "../utils/productText.js";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../utils/productImage.js";
import SafeImage from "../components/SafeImage.jsx";
import { useCart } from "../cart/CartContext.jsx";
import ProductDescriptionSections from "../components/product/ProductDescriptionSections.jsx";
import {
  defaultSizeForLayout,
  showApparelOrShoeSize,
  sizeOptionsForLayout,
  variantOptionKind,
  PAGE_LAYOUT,
} from "../utils/productPageLayout.js";

export default function ShopProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("M");
  const [variantId, setVariantId] = useState(null);
  const [addedFlash, setAddedFlash] = useState(false);

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

  const layout = product?.page_layout || PAGE_LAYOUT.CLOTHING;
  const variants = Array.isArray(product?.color_variants) ? product.color_variants : [];

  useEffect(() => {
    if (!product) return;
    setSize(defaultSizeForLayout(layout));
  }, [product?.slug, layout]);

  useEffect(() => {
    if (!product) return;
    if (variants.length > 0) {
      const first = variants[0];
      setVariantId((v) => {
        if (v != null && variants.some((x) => x.id === v)) return v;
        return first.id;
      });
    } else {
      setVariantId(null);
    }
  }, [product, variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find((v) => v.id === variantId) || variants[0];
  }, [variants, variantId]);

  const displayImage = selectedVariant?.image_url || product?.image_url || product?.imageUrl;
  const stockAvailable = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) return Number(selectedVariant.stock) || 0;
    return Number(product.stock) || 0;
  }, [product, selectedVariant]);

  const inStock = stockAvailable > 0;
  const maxQty = Math.min(stockAvailable, 99);

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, maxQty || 1)));
  }, [maxQty, product, variantId]);

  const showSizes = showApparelOrShoeSize(layout);
  const optionKind = variantOptionKind(layout);
  const sizeOpts = sizeOptionsForLayout(layout);

  const displayName = product ? productName(product, i18n.language) : "";
  const sectionsLang = i18n.language?.startsWith("bn") ? product?.description_sections_bn : product?.description_sections_en;
  const fallbackDescription = product ? productDescription(product, i18n.language) : "";

  const panelAccent =
    layout === PAGE_LAYOUT.FOOTWEAR
      ? "border-l-amber-500"
      : layout === PAGE_LAYOUT.ACCESSORIES
        ? "border-l-violet-500"
        : layout === PAGE_LAYOUT.GROOMING
          ? "border-l-teal-500"
          : "border-l-brand-500";

  function handleAddToCart() {
    if (!product || !inStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name_bn: product.name_bn,
      name_en: product.name_en,
      image_url: displayImage ?? null,
      price: Number(product.price),
      qty,
      size: showSizes ? size : "ONE",
      variantId: selectedVariant ? selectedVariant.id : null,
      variantName_bn: selectedVariant ? selectedVariant.name_bn : "",
      variantName_en: selectedVariant ? selectedVariant.name_en : "",
    });
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 2200);
  }

  function handleBuyNow() {
    if (!product || !inStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name_bn: product.name_bn,
      name_en: product.name_en,
      image_url: displayImage ?? null,
      price: Number(product.price),
      qty,
      size: showSizes ? size : "ONE",
      variantId: selectedVariant ? selectedVariant.id : null,
      variantName_bn: selectedVariant ? selectedVariant.name_bn : "",
      variantName_en: selectedVariant ? selectedVariant.name_en : "",
    });
    navigate("/checkout");
  }

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100">
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-6xl px-4 pb-20 pt-6 sm:px-5 lg:pb-24 lg:pt-8">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600" aria-label="Breadcrumb">
          <Link to="/" className="rounded-lg px-1 py-0.5 transition hover:bg-slate-200/80 hover:text-brand-700">
            {t("nav.home")}
          </Link>
          <span className="text-slate-400" aria-hidden>
            /
          </span>
          <Link to="/shop" className="rounded-lg px-1 py-0.5 transition hover:bg-slate-200/80 hover:text-brand-700">
            {t("shop.title")}
          </Link>
          {product ? (
            <>
              <span className="text-slate-400" aria-hidden>
                /
              </span>
              <span className="font-medium text-slate-900">{displayName}</span>
            </>
          ) : null}
        </nav>

        <Link
          to="/shop"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition hover:text-brand-600"
        >
          <span aria-hidden>←</span> {t("shop.back")}
        </Link>

        {loading && <p className="mt-10 text-slate-600">{t("shop.loading")}</p>}
        {error && (
          <p className="mt-10 text-slate-600">
            {error === "404" ? t("shop.notFound") : t("shop.error")}
          </p>
        )}

        {product && !loading && (
          <motion.div
            className="mt-8 space-y-10 lg:space-y-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
              <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50">
                <div className="aspect-square w-full bg-slate-50" key={displayImage}>
                  <SafeImage
                    src={displayImage}
                    seed={product.id}
                    fallback={PRODUCT_IMAGE_FALLBACK}
                    fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                    alt=""
                    className="h-full w-full object-cover transition-opacity duration-300"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                {variants.length > 1 ? (
                  <div className="grid grid-cols-4 gap-2 border-t border-slate-100 p-3 sm:grid-cols-5 sm:p-4">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVariantId(v.id)}
                        className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${
                          variantId === v.id ? "ring-brand-500 ring-offset-2" : "ring-transparent hover:ring-slate-300"
                        }`}
                      >
                        <SafeImage
                          src={v.image_url}
                          seed={v.id}
                          fallback={PRODUCT_IMAGE_FALLBACK}
                          fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t(`shop.product.layoutLabel.${layout}`, { defaultValue: layout })}
                </p>
                <p className="mt-2 text-sm font-medium text-brand-700">
                  {categoryName(
                    { name_bn: product.category_name_bn, name_en: product.category_name_en },
                    i18n.language,
                  )}
                  {product.brand_slug ? (
                    <>
                      {" · "}
                      <Link
                        to={`/brands/${encodeURIComponent(product.brand_slug)}`}
                        className="text-slate-700 underline-offset-2 transition hover:text-brand-800 hover:underline"
                      >
                        {brandName(
                          { name_bn: product.brand_name_bn, name_en: product.brand_name_en },
                          i18n.language,
                        )}
                      </Link>
                    </>
                  ) : null}
                </p>
                <h1 className="mt-2 break-words font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {displayName}
                </h1>
                <p className="mt-4 break-words text-base leading-relaxed text-slate-600 sm:text-lg">{fallbackDescription}</p>

                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-3xl font-bold tabular-nums text-slate-900">
                    {formatPrice(product.price, i18n.language)}
                  </span>
                  {product.compare_at_price ? (
                    <span className="text-lg font-normal text-slate-400 line-through">
                      {formatPrice(product.compare_at_price, i18n.language)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{t("shop.stock")}:</span>{" "}
                  {inStock ? (
                    <span className="text-emerald-700">
                      {t("shop.inStock")} ({stockAvailable})
                    </span>
                  ) : (
                    <span className="text-rose-700">{t("shop.outOfStock")}</span>
                  )}
                </p>

                <div
                  className={`mt-8 space-y-6 rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm sm:p-6 ${panelAccent}`}
                >
                  {variants.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {optionKind === "volume" ? t("shop.product.optionVolume") : t("shop.product.optionColor")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {variants.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            disabled={!inStock && variantId !== v.id}
                            onClick={() => setVariantId(v.id)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                              variantId === v.id
                                ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/25"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 disabled:opacity-40"
                            }`}
                          >
                            {i18n.language?.startsWith("bn") ? v.name_bn : v.name_en}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {showSizes ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {layout === PAGE_LAYOUT.FOOTWEAR ? t("shop.product.shoeSize") : t("shop.product.size")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sizeOpts.map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={!inStock}
                            onClick={() => setSize(s)}
                            className={`min-w-[2.75rem] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              size === s
                                ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/25"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 disabled:opacity-40"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("shop.product.quantity")}</p>
                    <div className="mt-3 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        disabled={!inStock || qty <= 1}
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-semibold text-slate-700 transition hover:bg-white disabled:opacity-30"
                        aria-label={t("shop.product.decreaseQty")}
                      >
                        −
                      </button>
                      <span className="min-w-[3rem] text-center font-display text-lg font-semibold tabular-nums text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={!inStock || qty >= maxQty}
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-semibold text-slate-700 transition hover:bg-white disabled:opacity-30"
                        aria-label={t("shop.product.increaseQty")}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={handleAddToCart}
                      className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-slate-900 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[200px]"
                    >
                      {t("shop.addToCart")}
                    </button>
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={handleBuyNow}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[200px]"
                    >
                      {t("shop.product.buyNow")}
                    </button>
                  </div>

                  <AnimatePresence>
                    {addedFlash ? (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
                        role="status"
                      >
                        {t("shop.product.addedToCart")}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <ProductDescriptionSections sections={sectionsLang} fallbackText={fallbackDescription} />
          </motion.div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
