import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { brandName } from "../utils/productText.js";
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

/** Sliders + lines — filter header icon */
function IconSliders({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
      <path d="M4 6h4M4 12h2M4 18h6" strokeLinecap="round" />
      <path d="M10 6h10M8 12h14M14 18h6" strokeLinecap="round" />
      <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PAGE_SIZE = 24;

const FILTER_PINK = "bg-[#e91e63] border-transparent text-white shadow-sm";
const FILTER_PINK_RING = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e91e63] focus-visible:ring-offset-2";

export default function ShopPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "latest";
  const inStockOnly = searchParams.get("in_stock") === "1";
  const saleOnly = searchParams.get("sale") === "1";
  const minPriceParam = searchParams.get("min_price") || "";
  const maxPriceParam = searchParams.get("max_price") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [localQ, setLocalQ] = useState(q);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({
    category: "",
    brand: "",
    sort: "latest",
    inStockOnly: false,
    saleOnly: false,
    minPrice: "",
    maxPrice: "",
  });
  const filterDrawerWasOpen = useRef(false);
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

  const filterKey = `${q}|${category}|${brand}|${sort}|${inStockOnly}|${saleOnly}|${minPriceParam}|${maxPriceParam}`;

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
    if (filtersOpen) {
      if (!filterDrawerWasOpen.current) {
        setFilterDraft({
          category: category || "",
          brand: brand || "",
          sort: sort || "latest",
          inStockOnly,
          saleOnly,
          minPrice: searchParams.get("min_price") || "",
          maxPrice: searchParams.get("max_price") || "",
        });
      }
      filterDrawerWasOpen.current = true;
    } else {
      filterDrawerWasOpen.current = false;
    }
  }, [filtersOpen, category, brand, sort, inStockOnly, saleOnly, searchParams]);

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
    if (minPriceParam.trim()) params.set("min_price", minPriceParam.trim());
    if (maxPriceParam.trim()) params.set("max_price", maxPriceParam.trim());
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
  }, [q, category, brand, sort, inStockOnly, saleOnly, minPriceParam, maxPriceParam, page]);

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
    setSearchParams(next, { replace: true });
    setLocalQ("");
    setFilterDraft({
      category: "",
      brand: "",
      sort: "latest",
      inStockOnly: false,
      saleOnly: false,
      minPrice: "",
      maxPrice: "",
    });
    setFiltersOpen(false);
  }

  function applyFilterDraft() {
    mergeParams({
      category: filterDraft.category || undefined,
      brand: filterDraft.brand || undefined,
      sort: filterDraft.sort === "latest" ? undefined : filterDraft.sort,
      in_stock: filterDraft.inStockOnly ? "1" : undefined,
      sale: filterDraft.saleOnly ? "1" : undefined,
      min_price: filterDraft.minPrice !== "" && filterDraft.minPrice != null ? String(filterDraft.minPrice).trim() : undefined,
      max_price: filterDraft.maxPrice !== "" && filterDraft.maxPrice != null ? String(filterDraft.maxPrice).trim() : undefined,
      page: undefined,
    });
    setFiltersOpen(false);
  }

  /** URL-level filters (anything that changes the product query) */
  const hasActiveFilters = Boolean(
    q.trim() ||
      category ||
      brand ||
      inStockOnly ||
      saleOnly ||
      minPriceParam ||
      maxPriceParam ||
      sort !== "latest" ||
      page > 1
  );

  /** Draft out of sync with URL (user changed pills but didn’t press Apply yet) */
  const filterDraftMatchesUrl =
    (filterDraft.category || "") === (category || "") &&
    (filterDraft.brand || "") === (brand || "") &&
    (filterDraft.sort || "latest") === (sort || "latest") &&
    filterDraft.inStockOnly === inStockOnly &&
    filterDraft.saleOnly === saleOnly &&
    (filterDraft.minPrice || "").trim() === (minPriceParam || "") &&
    (filterDraft.maxPrice || "").trim() === (maxPriceParam || "");

  const canClearFilters = hasActiveFilters || !filterDraftMatchesUrl;

  function filterPillClass(active) {
    return [
      "inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition",
      active ? `${FILTER_PINK} ${FILTER_PINK_RING}` : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50",
    ].join(" ");
  }

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
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-none px-[20px] pb-24 pt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl md:text-4xl">
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

        {(q || category || brand || saleOnly || inStockOnly || minPriceParam || maxPriceParam) && (
          <p className="mt-3 break-words text-sm text-brand-700">
            {[
              q && t("shop.filterSearch", { q }),
              category && t("shop.filterCategory", { category }),
              brand && t("shop.filterBrand", { brand: activeBrandLabel }),
              saleOnly && t("shop.filterSale"),
              inStockOnly && t("shop.filterInStockOnly"),
              (minPriceParam || maxPriceParam) &&
                t("shop.filterPriceSummary", {
                  min: minPriceParam || "—",
                  max: maxPriceParam || "—",
                }),
            ]
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
          {products.map((p, idx) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.03 * idx, 0.45), duration: 0.35 }}
              className="flex h-full min-h-0 min-w-0"
            >
              <ProductCard
                product={p}
                brandHref={
                  p.brand_slug && p.category_slug
                    ? `/brands/${encodeURIComponent(p.brand_slug)}?category=${encodeURIComponent(p.category_slug)}`
                    : p.brand_slug
                      ? `/brands/${encodeURIComponent(p.brand_slug)}`
                      : null
                }
              />
            </motion.li>
          ))}
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
              <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <IconSliders className="h-5 w-5" />
                </div>
                <h2 id="shop-filters-title" className="font-display flex-1 text-lg font-bold text-gray-900">
                  {t("shop.filtersDrawerTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                  aria-label={t("shop.closePanel")}
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.25)_transparent]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{t("shop.filterCategoriesTitle")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterDraft((d) => ({ ...d, category: "" }))}
                        className={filterPillClass(!filterDraft.category)}
                      >
                        {t("shop.filterAllCategories")}
                      </button>
                      {categories.map((c) => {
                        const name = i18n.language?.startsWith("bn") ? c.name_bn : c.name_en;
                        const active = filterDraft.category === c.slug;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFilterDraft((d) => ({ ...d, category: c.slug }))}
                            className={filterPillClass(active)}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{t("shop.filterBrandsTitle")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterDraft((d) => ({ ...d, brand: "" }))}
                        className={filterPillClass(!filterDraft.brand)}
                      >
                        {t("shop.filterAllBrands")}
                      </button>
                      {brands.map((b) => {
                        const active = filterDraft.brand === b.slug;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setFilterDraft((d) => ({ ...d, brand: b.slug }))}
                            className={filterPillClass(active)}
                          >
                            {brandName(b, i18n.language)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{t("shop.filterSectionSort")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFilterDraft((d) => ({ ...d, sort: opt.value }))}
                          className={filterPillClass(filterDraft.sort === opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{t("shop.filterSectionPrice")}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500" htmlFor="shop-filter-min-price">
                          {t("shop.filterMinPrice")}
                        </label>
                        <div className="relative mt-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            ৳
                          </span>
                          <input
                            id="shop-filter-min-price"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="0"
                            value={filterDraft.minPrice}
                            onChange={(e) => setFilterDraft((d) => ({ ...d, minPrice: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-3 text-sm text-gray-900 outline-none ring-0 transition placeholder:text-gray-400 focus:border-[#e91e63]/40 focus:bg-white focus:ring-2 focus:ring-[#e91e63]/15"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500" htmlFor="shop-filter-max-price">
                          {t("shop.filterMaxPrice")}
                        </label>
                        <div className="relative mt-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            ৳
                          </span>
                          <input
                            id="shop-filter-max-price"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="10000"
                            value={filterDraft.maxPrice}
                            onChange={(e) => setFilterDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#e91e63]/40 focus:bg-white focus:ring-2 focus:ring-[#e91e63]/15"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">{t("shop.filterSectionAvailability")}</p>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{t("shop.filterInStockOnly")}</span>
                        <input
                          type="checkbox"
                          checked={filterDraft.inStockOnly}
                          onChange={(e) => setFilterDraft((d) => ({ ...d, inStockOnly: e.target.checked }))}
                          className="h-5 w-5 shrink-0 rounded border-gray-300 text-[#e91e63] focus:ring-[#e91e63]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{t("shop.filterSale")}</span>
                        <input
                          type="checkbox"
                          checked={filterDraft.saleOnly}
                          onChange={(e) => setFilterDraft((d) => ({ ...d, saleOnly: e.target.checked }))}
                          className="h-5 w-5 shrink-0 rounded border-gray-300 text-[#e91e63] focus:ring-[#e91e63]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
                  <button
                    type="button"
                    onClick={applyFilterDraft}
                    className="w-full rounded-xl bg-[#e91e63] py-3.5 text-sm font-bold text-white shadow-md shadow-pink-500/30 transition hover:bg-[#d81b60] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e91e63] focus-visible:ring-offset-2 active:scale-[0.99]"
                  >
                    {t("shop.applyFilters")}
                  </button>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    disabled={!canClearFilters}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("shop.clearFilters")}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
}
