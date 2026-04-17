import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { categoryName, brandName } from "../utils/productText.js";
import ProductCard from "../components/ProductCard.jsx";

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

export default function CategoryProductsPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam ? decodeURIComponent(slugParam) : "";
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "latest";
  const inStockOnly = searchParams.get("in_stock") === "1";
  const saleOnly = searchParams.get("sale") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [localQ, setLocalQ] = useState(q);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const prevFilterKeyRef = useRef(null);
  const skipScrollRef = useRef(true);

  const currentCategory = categories.find((c) => c.slug === slug) || null;
  const slugUnknown = Boolean(!catLoading && categories.length > 0 && slug && !currentCategory);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setCatLoading(true);
    apiFetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => {
        if (!cancelled) setCategories(d.categories || []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCatLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  const filterKey = `${q}|${brand}|${sort}|${inStockOnly}|${saleOnly}`;

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
    if (!slug) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    if (slugUnknown) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const offset = (page - 1) * PAGE_SIZE;
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    params.set("sort", sort);
    params.set("category", slug);
    if (q.trim()) params.set("q", q.trim());
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
  }, [slug, slugUnknown, q, brand, sort, inStockOnly, saleOnly, page]);

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
    skipScrollRef.current = true;
  }, [slug]);

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

  const hasActiveFilters = Boolean(q.trim() || brand || inStockOnly || saleOnly);

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

  const displayName = currentCategory ? categoryName(currentCategory, i18n.language) : slug;

  if (!catLoading && slug && categories.length > 0 && !currentCategory) {
    return (
      <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-none px-[20px] py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-950">{t("categoryPage.notFoundTitle")}</h1>
          <p className="mt-3 text-slate-600">{t("categoryPage.notFoundBody")}</p>
          <Link
            to="/categories"
            className="mt-8 inline-flex rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {t("categoryPage.backToCategories")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
      <SiteHeader />

      <section className="border-b border-rose-100 bg-gradient-to-r from-rose-50 via-rose-50/90 to-rose-50/70">
        <div className="w-full px-[20px] py-8 sm:py-10">
          <nav className="text-xs text-slate-500">
            <Link to="/" className="transition hover:text-brand-700">
              {t("nav.home")}
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link to="/categories" className="transition hover:text-brand-700">
              {t("nav.categories")}
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="font-medium text-slate-700">{displayName}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">{t("categoryPage.kicker")}</p>
              <h1 className="mt-2 break-words font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl md:text-[2.5rem] md:leading-tight">
                {catLoading ? "…" : displayName}
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                {loading && !error ? t("shop.productsFoundLoading") : t("categoryPage.productsAvailable", { count: totalCount })}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25">
              {loading && !error ? "—" : t("categoryPage.badge", { count: totalCount })}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-none px-[20px] pb-24 pt-8">
        <form onSubmit={onSearchSubmit} className="relative" role="search">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-12 pr-[5.25rem] text-sm text-slate-900 shadow-sm outline-none ring-brand-500/0 transition placeholder:text-slate-400 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 sm:pr-28 md:h-14 md:pl-14 md:text-[15px]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 shrink-0 -translate-y-1/2 rounded-lg bg-ink-950 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-ink-900 sm:px-4 sm:text-xs md:text-sm"
          >
            {t("shop.searchSubmit")}
          </button>
        </form>

        {(q || brand || saleOnly) && (
          <p className="mt-3 break-words text-sm text-brand-700">
            {[q && t("shop.filterSearch", { q }), brand && t("shop.filterBrand", { brand: activeBrandLabel }), saleOnly && t("shop.filterSale")]
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

        <ul className="mt-10 grid grid-cols-2 items-stretch gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((p, idx) => {
            const brandShop = p.brand_slug
              ? `/brands/${encodeURIComponent(p.brand_slug)}?category=${encodeURIComponent(slug)}`
              : null;
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.03 * idx, 0.45), duration: 0.35 }}
                className="flex h-full min-h-0 min-w-0"
              >
                <ProductCard product={p} brandHref={brandShop} />
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
              key="cat-filter-backdrop"
              type="button"
              aria-label={t("shop.closePanel")}
              className="fixed inset-0 z-[80] bg-ink-950/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.aside
              key="cat-filter-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cat-filters-title"
              className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-md flex-col bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 id="cat-filters-title" className="font-display text-lg font-bold text-ink-950">
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
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{t("categoryPage.filterLockedCategory")}</span>{" "}
                  {displayName}
                </p>
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
