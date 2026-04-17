import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiBase.js";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import HomeProductShowcase from "../components/home/HomeProductShowcase.jsx";
import HomeHeroBanner from "../components/home/HomeHeroBanner.jsx";
import HomeShopByCategory from "../components/home/HomeShopByCategory.jsx";
import HomePremiumPromo from "../components/home/HomePremiumPromo.jsx";
import HomeShopByBrand from "../components/home/HomeShopByBrand.jsx";
import HomeWhyShop from "../components/home/HomeWhyShop.jsx";

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

function categoryParams(slug) {
  const s = String(slug || "").trim();
  return s ? { category: s } : {};
}

async function loadHotForHome(categorySlug) {
  const cat = categoryParams(categorySlug);
  let rows = await fetchProductRows({ sort: "hot", in_stock: "1", ...cat });
  if (rows.length < 4) rows = await fetchProductRows({ sort: "hot", ...cat });
  if (rows.length === 0) rows = await fetchProductRows({ sort: "latest", in_stock: "1", ...cat });
  if (rows.length === 0) rows = await fetchProductRows({ sort: "latest", ...cat });
  if (rows.length === 0) rows = await fetchProductRows({ ...cat });
  return preferProductsWithImage(rows).slice(0, 8);
}

async function loadLatestForHome(categorySlug) {
  const cat = categoryParams(categorySlug);
  let rows = await fetchProductRows({ sort: "latest", in_stock: "1", ...cat });
  if (rows.length < 4) rows = await fetchProductRows({ sort: "latest", ...cat });
  if (rows.length === 0) rows = await fetchProductRows({ ...cat });
  return preferProductsWithImage(rows).slice(0, 8);
}

export default function HomePage() {
  const { t } = useTranslation();
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [hotCategorySlug, setHotCategorySlug] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [homeProductsLoading, setHomeProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setHomeProductsLoading(true);
    Promise.all([loadHotForHome(hotCategorySlug), loadLatestForHome(newCategorySlug)])
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
  }, [hotCategorySlug, newCategorySlug]);

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

  const categoryShow = categories.slice(0, 14);
  const brandShow = brands.slice(0, 16);

  return (
    <div className="min-h-dvh min-w-0 bg-white text-neutral-900">
      <SiteHeader />

      <main className="min-w-0">
        <HomeHeroBanner />

        <HomeShopByCategory categories={categoryShow} loading={catalogLoading} />

        <HomePremiumPromo />

        <HomeShopByBrand brands={brandShow} loading={catalogLoading} />

        <HomeProductShowcase
          titleKey="home.hotTitle"
          subtitleKey="home.hotSubtitle"
          viewAllTo={
            hotCategorySlug
              ? `/shop?sort=hot&category=${encodeURIComponent(hotCategorySlug)}`
              : "/shop?sort=hot"
          }
          viewAllKey="home.hotViewAll"
          products={hotProducts}
          loading={homeProductsLoading}
          showNewBadge={false}
          simple
          categories={categoryShow}
          selectedCategorySlug={hotCategorySlug}
          onSelectCategory={setHotCategorySlug}
        />
        <HomeProductShowcase
          titleKey="home.newTitle"
          subtitleKey="home.newSubtitle"
          viewAllTo={
            newCategorySlug
              ? `/shop?sort=latest&category=${encodeURIComponent(newCategorySlug)}`
              : "/shop?sort=latest"
          }
          viewAllKey="home.newViewAll"
          products={newProducts}
          loading={homeProductsLoading}
          showNewBadge
          simple
          categories={categoryShow}
          selectedCategorySlug={newCategorySlug}
          onSelectCategory={setNewCategorySlug}
        />

        <HomeWhyShop />
      </main>

      <SiteFooter />
    </div>
  );
}
