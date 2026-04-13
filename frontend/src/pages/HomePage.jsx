import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/price.js";
import {
  PRODUCT_IMAGE_FALLBACK,
  PRODUCT_IMAGE_FALLBACK_ALT,
  categoryCoverUrl,
} from "../utils/productImage.js";
import { productName, categoryName, brandName } from "../utils/productText.js";
import SafeImage from "../components/SafeImage.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import HomeBannerCarousel from "../components/home/HomeBannerCarousel.jsx";
import HomeOfferStrip from "../components/home/HomeOfferStrip.jsx";
import HomeProductShowcase from "../components/home/HomeProductShowcase.jsx";
import HomeDealCountdown from "../components/home/HomeDealCountdown.jsx";

const viewFade = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function IconShop({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 9l1.5 12h15L21 9M3 9h18l-2-6H5L3 9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13v6M15 13v6" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBolt({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconTruck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h1M14 18h-4M14 18h-4" strokeLinecap="round" />
      <path d="M14 18v-2a2 2 0 012-2h3.5l2.5 3v3a1 1 0 01-1 1h-1M9 18h.01" strokeLinecap="round" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function IconHeadphones({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 18v-6a9 9 0 1118 0v6" strokeLinecap="round" />
      <path d="M21 19a2 2 0 01-2 2h-1v-8h1a2 2 0 012 2v4zM3 19a2 2 0 002 2h1v-8H4a2 2 0 00-2 2v4z" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconGrid({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 5h7v7H4V5ZM13 5h7v7h-7V5ZM4 14h7v7H4v-7ZM13 14h7v7h-7v-7Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconTag({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M4 10V6a2 2 0 012-2h4M4 10l8 8a2 2 0 002 0l6-6a2 2 0 000-2.83l-2.34-2.34a2 2 0 00-2.83 0L4 10Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconBook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

async function fetchProductRows(params) {
  const q = new URLSearchParams({ limit: "40", ...params });
  try {
    const r = await apiFetch(`/api/products?${q}`);
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j.products) ? j.products : [];
  } catch {
    return [];
  }
}

function preferProductsWithImage(rows) {
  const has = (p) => String(p.image_url ?? p.imageUrl ?? "").trim();
  const withImg = rows.filter((p) => has(p));
  const rest = rows.filter((p) => !has(p));
  return [...withImg, ...rest];
}

/** Prefer in-stock + hot, then relax until we have catalog rows (stock 0 / no image still show). */
async function loadHotForHome() {
  let rows = await fetchProductRows({ sort: "hot", in_stock: "1" });
  if (rows.length < 4) rows = await fetchProductRows({ sort: "hot" });
  if (rows.length === 0) rows = await fetchProductRows({ sort: "latest", in_stock: "1" });
  if (rows.length === 0) rows = await fetchProductRows({ sort: "latest" });
  if (rows.length === 0) rows = await fetchProductRows({});
  return preferProductsWithImage(rows).slice(0, 8);
}

async function loadLatestForHome() {
  let rows = await fetchProductRows({ sort: "latest", in_stock: "1" });
  if (rows.length < 4) rows = await fetchProductRows({ sort: "latest" });
  if (rows.length === 0) rows = await fetchProductRows({});
  return preferProductsWithImage(rows).slice(0, 8);
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [productCount, setProductCount] = useState(null);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [homeProductsLoading, setHomeProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/products?limit=1&offset=0")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.total === "number") setProductCount(data.total);
        else if (Array.isArray(data.products)) setProductCount(data.products.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHomeProductsLoading(true);

    Promise.all([loadHotForHome(), loadLatestForHome()])
      .then(([hotList, latestList]) => {
        if (cancelled) return;
        setHotProducts(hotList);
        const hotIds = new Set(hotList.map((p) => p.id));
        let newList = latestList.filter((p) => !hotIds.has(p.id)).slice(0, 8);
        if (newList.length < 4 && latestList.length > 0) {
          newList = latestList.slice(0, 8);
        }
        setNewProducts(newList);
      })
      .catch(() => {
        if (!cancelled) {
          setHotProducts([]);
          setNewProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setHomeProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    Promise.all([
      apiFetch("/api/categories").then((r) => (r.ok ? r.json() : { categories: [] })),
      apiFetch("/api/brands").then((r) => (r.ok ? r.json() : { brands: [] })),
    ])
      .then(([cat, br]) => {
        if (cancelled) return;
        setCategories(cat.categories || []);
        setBrands(br.brands || []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setBrands([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const heroGrid = hotProducts.slice(0, 4);
  const categoryShow = categories.slice(0, 8);
  const brandShow = brands.slice(0, 12);

  const quickLinks = [
    { to: "/shop", labelKey: "nav.products", Icon: IconShop },
    { to: "/categories", labelKey: "nav.categories", Icon: IconGrid },
    { to: "/brands", labelKey: "nav.brands", Icon: IconTag },
    { to: "/blog", labelKey: "nav.blog", Icon: IconBook },
  ];

  const whyItems = [
    { Icon: IconTruck, titleKey: "home.dmWhy1Title", bodyKey: "home.dmWhy1Body" },
    { Icon: IconHeadphones, titleKey: "home.dmWhy2Title", bodyKey: "home.dmWhy2Body" },
    { Icon: IconShield, titleKey: "home.dmWhy3Title", bodyKey: "home.dmWhy3Body" },
    { Icon: IconBolt, titleKey: "home.dmWhy4Title", bodyKey: "home.dmWhy4Body" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="relative">
        <SiteHeader />

        <main>
          {/* Hero — DM-style: light, headline + product grid */}
          <section className="border-b border-neutral-200 bg-white">
            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:py-20">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <motion.div initial="hidden" animate="show" variants={viewFade}>
                  <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-800">
                    {t("home.dmHeroEyebrow")}
                  </p>
                  <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-ink-900 sm:text-5xl lg:text-[3rem]">
                    {t("home.dmHeroTitle")}{" "}
                    <span className="text-brand-600">{t("home.dmHeroHighlight")}</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t("home.dmHeroSubtitle")}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {[t("home.trustFast"), t("home.trustSecure"), t("home.trustBilingual")].map((text) => (
                      <span key={text} className="rounded-md bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800">
                        {text}
                      </span>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <Link
                      to="/shop"
                      className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-900/15 transition hover:bg-brand-700 sm:px-8 sm:text-base"
                    >
                      {t("home.ctaShop")}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition hover:border-brand-400 hover:bg-brand-50 sm:px-7 sm:text-base"
                    >
                      {t("home.ctaCategories")}
                    </Link>
                  </div>

                  <p className="mt-8 text-sm text-neutral-500">
                    {productCount == null ? t("home.statsLoading") : t("home.statsLine", { count: productCount })}
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-2.5 sm:gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                >
                  {[0, 1, 2, 3].map((i) => {
                    const p = heroGrid[i];
                    const href = p?.slug ? `/shop/${p.slug}` : "/shop";
                    return (
                      <motion.div
                        key={p?.id ?? `h-${i}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to={href} className="block h-full w-full">
                          <SafeImage
                            src={p?.image_url ?? p?.imageUrl}
                            seed={p?.id}
                            fallback={PRODUCT_IMAGE_FALLBACK}
                            fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            loading={i < 2 ? "eager" : "lazy"}
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                            {p ? (
                              <>
                                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white sm:text-xs">
                                  {productName(p, i18n.language)}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-white/90">{formatPrice(p.price, i18n.language)}</p>
                              </>
                            ) : (
                              <p className="text-[11px] font-medium text-white/90">{t("home.ctaShop")}</p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            <motion.a
              href="#shop-category"
              className="mx-auto flex max-w-[10rem] flex-col items-center gap-2 pb-7 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span>{t("home.scrollCue")}</span>
              <motion.span
                animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="h-5 w-5 text-brand-500" />
              </motion.span>
            </motion.a>
          </section>

          {/* Shop by category */}
          <section id="shop-category" className="scroll-mt-24 border-b border-neutral-200 bg-neutral-50 py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("home.dmCategoryTitle")}</h2>
                  <p className="mt-1.5 text-neutral-600">{t("home.dmCategoryLead")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <Link to="/categories" className="font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline">
                    {t("home.dmCategoryViewAll")} →
                  </Link>
                  <Link to="/shop" className="text-neutral-500 transition hover:text-neutral-800">
                    {t("home.dmBrowseCatalog")}
                  </Link>
                </div>
              </div>

              {catalogLoading ? (
                <p className="mt-10 text-center text-neutral-500">{t("shop.loading")}</p>
              ) : categoryShow.length === 0 ? (
                <p className="mt-10 text-center text-neutral-500">{t("categoriesPage.empty")}</p>
              ) : (
                <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                  {categoryShow.map((c, idx) => {
                    const name = categoryName(c, i18n.language);
                    const cover = categoryCoverUrl(c);
                    return (
                      <motion.li
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-24px" }}
                        transition={{ delay: Math.min(0.03 * idx, 0.15) }}
                      >
                        <Link
                          to={`/shop?category=${encodeURIComponent(c.slug)}`}
                          className="group flex flex-col overflow-hidden rounded-xl border border-brand-100 bg-white transition hover:border-brand-200 hover:shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                            <SafeImage
                              src={cover}
                              seed={c.id}
                              fallback={PRODUCT_IMAGE_FALLBACK}
                              fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                              <span className="font-display text-sm font-semibold text-white">{name}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <HomeBannerCarousel />
          <HomeOfferStrip />
          <HomeDealCountdown />

          <section className="border-b border-neutral-200 bg-white py-10">
            <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 sm:px-6 lg:max-w-5xl">
              <div className="flex gap-4 rounded-xl border border-brand-100 bg-brand-50/50 p-5">
                <div className="shrink-0 text-brand-600">
                  <IconShield className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">{t("home.dmTrust1Title")}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{t("home.dmTrust1Body")}</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-xl border border-brand-100 bg-brand-50/50 p-5">
                <div className="shrink-0 text-brand-600">
                  <IconTruck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">{t("home.dmTrust2Title")}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{t("home.dmTrust2Body")}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-neutral-200 bg-white py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("home.dmBrandsTitle")}</h2>
                  <p className="mt-1.5 text-neutral-600">{t("home.dmBrandsLead")}</p>
                </div>
                <Link to="/brands" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline">
                  {t("home.dmBrandsViewAll")} →
                </Link>
              </div>
              {brandShow.length === 0 && !catalogLoading ? (
                <p className="mt-8 text-center text-neutral-500">{t("brandsPage.empty")}</p>
              ) : (
                <div className="mt-6 flex flex-wrap gap-2 sm:gap-2.5">
                  {brandShow.map((b) => (
                    <Link
                      key={b.id}
                      to={`/shop?brand=${encodeURIComponent(b.slug)}`}
                      className="rounded-full border border-brand-100 bg-brand-50/80 px-3.5 py-1.5 text-sm font-medium text-ink-900 transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      {brandName(b, i18n.language)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="border-b border-brand-100 bg-brand-50/60 py-3 text-center">
            <p className="mx-auto max-w-3xl px-4 text-xs text-brand-800/80">{t("home.marqueeStrip")}</p>
          </div>

          <section id="explore" className="scroll-mt-24 border-b border-neutral-200 bg-white py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <motion.div
                className="mx-auto max-w-2xl text-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={viewFade}
              >
                <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("home.quickTitle")}</h2>
                <p className="mt-2 text-neutral-600">{t("home.quickSubtitle")}</p>
              </motion.div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {quickLinks.map(({ to, labelKey, Icon }, idx) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={to}
                      className="group flex flex-col rounded-xl border border-brand-100 bg-white p-5 transition hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm"
                    >
                      <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-700 ring-1 ring-brand-100">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-display text-base font-semibold text-ink-900">{t(labelKey)}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm text-brand-700">
                        {t("home.ctaArrow")}
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <HomeProductShowcase
            titleKey="home.hotTitle"
            subtitleKey="home.hotSubtitle"
            viewAllTo="/shop?sort=hot"
            viewAllKey="home.hotViewAll"
            products={hotProducts}
            loading={homeProductsLoading}
            showNewBadge={false}
          />
          <HomeProductShowcase
            titleKey="home.newTitle"
            subtitleKey="home.newSubtitle"
            viewAllTo="/shop?sort=latest"
            viewAllKey="home.newViewAll"
            products={newProducts}
            loading={homeProductsLoading}
            showNewBadge
          />

          <section className="border-t border-neutral-200 bg-neutral-50 py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <motion.div
                className="mx-auto max-w-2xl text-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={viewFade}
              >
                <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("home.dmWhyTitle")}</h2>
                <p className="mt-2 text-neutral-600">{t("home.dmWhyLead")}</p>
              </motion.div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {whyItems.map(({ Icon, titleKey, bodyKey }, idx) => (
                  <motion.article
                    key={titleKey}
                    className="rounded-xl border border-brand-100 bg-white p-5"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{t(titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t(bodyKey)}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-neutral-200 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-2xl px-5 text-center sm:px-6">
              <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("home.dmFinalTitle")}</h2>
              <p className="mt-3 text-neutral-600">{t("home.dmFinalLead")}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-900/15 transition hover:bg-brand-700 sm:text-base"
                >
                  {t("home.dmFinalShop")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex rounded-full border border-brand-200 bg-white px-7 py-3 text-sm font-semibold text-ink-900 transition hover:border-brand-300 hover:bg-brand-50 sm:text-base"
                >
                  {t("home.dmFinalContact")}
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
