import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M12.5 12.5L17 17" strokeLinecap="round" />
    </svg>
  );
}

function IconFilter({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

function IconClose({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

const PAGE_SIZE = 24;

export default function ShopPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "latest";
  const inStockOnly = searchParams.get("in_stock") === "1";
  const saleOnly = searchParams.get("sale") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [localQ, setLocalQ] = useState(q);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const prevFilterKeyRef = useRef(null);
  const skipScrollRef = useRef(true);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    apiFetch("/api/brands")
      .then((r) => (r.ok ? r.json() : { brands: [] }))
      .then((d) => setBrands(d.brands || []))
      .catch(() => setBrands([]));
  }, []);

  const mergeParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const filterKey = `${q}|${category}|${brand}|${sort}|${inStockOnly}|${saleOnly}`;

  useEffect(() => {
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
    } else if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      if (searchParams.get("page")) {
        const next = new URLSearchParams(searchParams);
        next.delete("page");
        setSearchParams(next, { replace: true });
      }
    }
  }, [filterKey, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (page - 1) * PAGE_SIZE;
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (inStockOnly) params.set("in_stock", "1");
    if (saleOnly) params.set("sale", "1");
    apiFetch(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setTotalCount(Number(data.total) || 0);
        }
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
  }, [q, category, brand, sort, inStockOnly, saleOnly, page]);

  useEffect(() => {
    if (loading || totalCount === 0) return;
    const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    if (page > maxPage) {
      const next = new URLSearchParams(searchParams);
      if (maxPage <= 1) next.delete("page");
      else next.set("page", String(maxPage));
      setSearchParams(next, { replace: true });
    }
  }, [loading, totalCount, page, searchParams, setSearchParams]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  function onSearchSubmit(e) {
    e.preventDefault();
    mergeParams({ q: localQ.trim() || undefined, page: undefined });
  }

  function clearAllFilters() {
    const next = new URLSearchParams();
    if (sort && sort !== "latest") next.set("sort", sort);
    setSearchParams(next, { replace: true });
    setLocalQ("");
    setFiltersOpen(false);
  }

  const hasActiveFilters = Boolean(q.trim() || category || brand || inStockOnly || saleOnly);

  const activeBrandLabel =
    brand && brands.length
      ? brandName(
          brands.find((b) => b.slug === brand) || { name_bn: brand, name_en: brand },
          i18n.language
        )
      : brand;

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const rangeFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);

  function goToPage(p) {
    mergeParams({ page: p <= 1 ? undefined : String(p) });
  }

  const sortOptions = [
    { value: "latest", label: t("shop.sortLatest") },
    { value: "hot", label: t("shop.sortHot") },
    { value: "price_asc", label: t("shop.sortPriceLow") },
    { value: "price_desc", label: t("shop.sortPriceHigh") },
    { value: "name_asc", label: t("shop.sortName") },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
            {t("shop.allProducts")}
          </h1>
          <p className="mt-1 text-sm text-slate-600 md:text-base">
            {loading ? t("shop.productsFoundLoading") : t("shop.productsFound", { count: totalCount })}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("shop.subtitle")}</p>
        </motion.div>

        <form
          onSubmit={onSearchSubmit}
          className="relative mt-8"
          role="search"
        >
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-28 text-sm text-slate-900 shadow-sm outline-none ring-brand-500/0 transition placeholder:text-slate-400 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 md:h-14 md:pl-14 md:text-[15px]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-ink-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink-900 md:text-sm"
          >
            {t("shop.searchSubmit")}
          </button>
        </form>

        {(q || category || brand || saleOnly) && (
          <p className="mt-3 text-sm text-brand-700">
            {[q && t("shop.filterSearch", { q }), category && t("shop.filterCategory", { category }), brand && t("shop.filterBrand", { brand: activeBrandLabel }), saleOnly && t("shop.filterSale")]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
          <p className="text-sm text-slate-600 sm:order-first">
            {loading
              ? "—"
              : totalCount === 0
                ? t("shop.showingNone")
                : t("shop.showingRange", { from: rangeFrom, to: rangeTo, total: totalCount })}
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span className="whitespace-nowrap font-medium">{t("shop.sortBy")}</span>
            <select
              value={sort}
              onChange={(e) =>
                mergeParams({
                  sort: e.target.value === "latest" ? undefined : e.target.value,
                  page: undefined,
                })
              }
              className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-400/60 hover:bg-brand-50/80"
          >
            <IconFilter className="h-4 w-4 text-brand-600" />
            {t("shop.filters")}
          </button>
        </div>

        {loading && (
          <p className="mt-12 text-center text-slate-500">{t("shop.loading")}</p>
        )}
        {error && (
          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            {t("shop.error")}
            <code className="ml-2 text-xs text-amber-900/80">{error}</code>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <p className="mt-12 text-center text-slate-500">{t("shop.empty")}</p>
        )}

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((p, idx) => {
            const inStock = Number(p.stock) > 0;
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.03 * idx, 0.45), duration: 0.35 }}
                className="flex"
              >
                <article className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:border-brand-300/60 hover:shadow-md">
                  <div className="relative aspect-square bg-slate-50">
                    <span
                      className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
                        inStock
                          ? "bg-brand-100 text-brand-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {inStock ? t("shop.inStock") : t("shop.outOfStock")}
                    </span>
                    <div className="pointer-events-none absolute right-2 top-2 z-10 text-right font-display text-[9px] font-bold leading-tight text-slate-300 sm:text-[10px]">
                      <span className="block text-ink-950/40">CART</span>
                      <span className="block text-brand-500/50">NEXUS</span>
                    </div>
                    <Link
                      to={`/shop/${p.slug}`}
                      className="relative block h-full w-full overflow-hidden"
                      aria-label={productName(p, i18n.language)}
                    >
                      <SafeImage
                        src={p.image_url ?? p.imageUrl}
                        seed={p.id}
                        fallback={PRODUCT_IMAGE_FALLBACK}
                        fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700 sm:text-xs">
                      {categoryName(
                        {
                          name_bn: p.category_name_bn,
                          name_en: p.category_name_en,
                        },
                        i18n.language
                      )}
                      {p.brand_slug ? (
                        <>
                          {" · "}
                          <Link
                            to={`/shop?brand=${encodeURIComponent(p.brand_slug)}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {brandName(
                              {
                                name_bn: p.brand_name_bn,
                                name_en: p.brand_name_en,
                              },
                              i18n.language
                            )}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    <Link
                      to={`/shop/${p.slug}`}
                      className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink-950 hover:text-brand-700 sm:min-h-[2.75rem] sm:text-[15px]"
                    >
                      {productName(p, i18n.language)}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 sm:text-sm">
                      {productDescription(p, i18n.language)}
                    </p>
                    <p className="mt-3 font-display text-base font-bold text-ink-950 sm:text-lg">
                      {formatPrice(p.price, i18n.language)}
                      {p.compare_at_price ? (
                        <span className="ml-2 text-xs font-normal text-slate-400 line-through sm:text-sm">
                          {formatPrice(p.compare_at_price, i18n.language)}
                        </span>
                      ) : null}
                    </p>
                    <Link
                      to={`/shop/${p.slug}`}
                      className="mt-auto flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-800 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900 sm:py-3 sm:text-sm"
                    >
                      {inStock ? t("shop.addToCart") : t("shop.viewProduct")}
                    </Link>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>

        {!loading && !error && totalPages > 1 && (
          <nav
            className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:gap-8"
            aria-label={t("shop.paginationLabel")}
          >
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex min-w-[8rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("shop.prevPage")}
            </button>
            <p className="text-sm font-medium text-slate-600">
              {t("shop.pageOf", { page, total: totalPages })}
            </p>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex min-w-[8rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("shop.nextPage")}
            </button>
          </nav>
        )}
      </main>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.button
              key="shop-filter-backdrop"
              type="button"
              aria-label={t("shop.closePanel")}
              className="fixed inset-0 z-[80] bg-ink-950/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.aside
              key="shop-filter-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shop-filters-title"
              className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-md flex-col bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 id="shop-filters-title" className="font-display text-lg font-bold text-ink-950">
                  {t("shop.filtersTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink-950"
                  aria-label={t("shop.closePanel")}
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("shop.filterCategoryHint")}
                </p>
                <ul className="mt-3 space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        mergeParams({ category: undefined, page: undefined });
                      }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        !category ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t("shop.filterAllCategories")}
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => mergeParams({ category: c.slug, page: undefined })}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                          category === c.slug ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("shop.filterBrandHint")}
                </p>
                <ul className="mt-3 space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => mergeParams({ brand: undefined, page: undefined })}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        !brand ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t("shop.filterAllBrands")}
                    </button>
                  </li>
                  {brands.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => mergeParams({ brand: b.slug, page: undefined })}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                          brand === b.slug ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {brandName(b, i18n.language)}
                      </button>
                    </li>
                  ))}
                </ul>
                <label className="mt-8 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) =>
                      mergeParams({
                        in_stock: e.target.checked ? "1" : undefined,
                        page: undefined,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-800">{t("shop.filterInStockOnly")}</span>
                </label>
              </div>
              <div className="border-t border-slate-200 p-5">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("shop.clearFilters")}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
}
