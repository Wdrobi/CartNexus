import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiFetch, resolvePublicAssetUrl } from "../../api/apiBase.js";
import { authFetch } from "../../api/authFetch.js";
import { uploadCatalogCoverImage } from "../../api/catalogCoverUpload.js";
import { productName } from "../../utils/productText.js";
import { formatPrice } from "../../utils/price.js";
import { slugify } from "../../utils/slug.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { PortalSelect } from "../../components/admin/PortalSelect.jsx";

const PAGE_SIZE = 25;

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function emptySection() {
  return { title: "", body: "" };
}

function emptyForm(categories) {
  return {
    category_id: categories[0]?.id ?? "",
    brand_id: "",
    name_bn: "",
    name_en: "",
    slug: "",
    description_bn: "",
    description_en: "",
    sections_en: [emptySection()],
    sections_bn: [emptySection()],
    color_variants: [],
    price: "",
    compare_at_price: "",
    image_url: "",
    stock: 0,
    is_active: true,
  };
}

function productToForm(p) {
  const parseSections = (raw) => {
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s) => ({
        title: String(s?.title ?? ""),
        body: String(s?.body ?? ""),
      }));
    }
    return [emptySection()];
  };
  const vars = Array.isArray(p.color_variants) ? p.color_variants : [];
  return {
    category_id: p.category_id,
    brand_id: p.brand_id != null ? String(p.brand_id) : "",
    name_bn: p.name_bn || "",
    name_en: p.name_en || "",
    slug: p.slug || "",
    description_bn: p.description_bn || "",
    description_en: p.description_en || "",
    sections_en: parseSections(p.description_sections_en),
    sections_bn: parseSections(p.description_sections_bn),
    color_variants: vars.map((v) => ({
      id: v.id,
      name_en: v.name_en || "",
      name_bn: v.name_bn || "",
      image_url: v.image_url || "",
      stock: v.stock ?? 0,
    })),
    price: String(p.price ?? ""),
    compare_at_price:
      p.compare_at_price != null && p.compare_at_price !== ""
        ? String(p.compare_at_price)
        : "",
    image_url: p.image_url || "",
    stock: p.stock ?? 0,
    is_active: !!p.is_active,
  };
}

function sectionsToApi(rows) {
  const out = rows
    .map((r) => ({
      title: String(r.title || "").trim(),
      body: String(r.body || "").trim(),
    }))
    .filter((r) => r.title || r.body);
  return out.length ? out : null;
}

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState("id_desc");
  const [priceMin, setPriceMin] = useState("");
  const [priceMinDraft, setPriceMinDraft] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceMaxDraft, setPriceMaxDraft] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm([]));
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [variantImageUploading, setVariantImageUploading] = useState(null);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId === "none") params.set("brandId", "none");
    else if (brandId !== "all") params.set("brandId", brandId);
    if (activeFilter !== "all") params.set("active", activeFilter);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    const minN = parseFloat(String(priceMin).trim());
    if (String(priceMin).trim() !== "" && Number.isFinite(minN)) params.set("priceMin", String(minN));
    const maxN = parseFloat(String(priceMax).trim());
    if (String(priceMax).trim() !== "" && Number.isFinite(maxN)) params.set("priceMax", String(maxN));

    return authFetch(`/api/admin/products?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        const rows = data.products || [];
        const tot = Number(data.total) || 0;
        const maxPage = Math.max(1, Math.ceil(tot / PAGE_SIZE));
        setProducts(rows);
        setTotal(tot);
        setPage((p) => Math.min(p, maxPage));
      })
      .catch((e) => setError(e.message))
      .finally(() => setProductsLoading(false));
  }, [
    page,
    q,
    categoryId,
    brandId,
    activeFilter,
    stockFilter,
    sort,
    priceMin,
    priceMax,
  ]);

  useEffect(() => {
    let cancelled = false;
    setMetaLoading(true);
    Promise.all([apiFetch("/api/categories"), apiFetch("/api/brands")])
      .then(async ([cr, br]) => {
        const [cjson, bjson] = await Promise.all([cr.json(), br.json()]);
        if (!cancelled) {
          setCategories(cjson.categories || []);
          setBrands(bjson.brands || []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!modalOpen) return;
    setForm((f) => ({
      ...f,
      category_id: f.category_id || categories[0]?.id || "",
    }));
  }, [modalOpen, categories]);

  useEffect(() => {
    if (!modalOpen || !editingId) return;
    let cancelled = false;
    setDetailLoading(true);
    setError(null);
    authFetch(`/api/admin/products/${editingId}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForm(productToForm(data.product));
      })
      .catch(() => {
        if (!cancelled) setError("load_product");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalOpen, editingId]);

  function openCreate() {
    setEditingId(null);
    setDetailLoading(false);
    setMainImageUploading(false);
    setVariantImageUploading(null);
    setForm(emptyForm(categories));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setDetailLoading(false);
    setMainImageUploading(false);
    setVariantImageUploading(null);
  }

  async function onMainImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setMainImageUploading(true);
    try {
      const url = await uploadCatalogCoverImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err?.message || "upload");
    } finally {
      setMainImageUploading(false);
    }
  }

  async function onVariantImageFile(idx, e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setVariantImageUploading(idx);
    try {
      const url = await uploadCatalogCoverImage(file);
      setForm((f) => {
        const next = [...f.color_variants];
        next[idx] = { ...next[idx], image_url: url };
        return { ...f, color_variants: next };
      });
    } catch (err) {
      setError(err?.message || "upload");
    } finally {
      setVariantImageUploading(null);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if (!categories.length) {
      setError("no_categories");
      setSaving(false);
      return;
    }
    const catNum = Number(form.category_id);
    if (!Number.isFinite(catNum) || catNum < 1) {
      setError("invalid_category");
      setSaving(false);
      return;
    }
    const slug =
      form.slug.trim() || slugify(form.name_en) || slugify(form.name_bn);
    const body = {
      category_id: catNum,
      brand_id: form.brand_id === "" ? null : Number(form.brand_id),
      name_bn: form.name_bn,
      name_en: form.name_en,
      slug: slug || undefined,
      description_bn: form.description_bn || null,
      description_en: form.description_en || null,
      description_sections_en: sectionsToApi(form.sections_en),
      description_sections_bn: sectionsToApi(form.sections_bn),
      color_variants: form.color_variants
        .filter((v) => v.name_en?.trim() && v.name_bn?.trim() && v.image_url?.trim())
        .map((v) => ({
          name_en: v.name_en.trim(),
          name_bn: v.name_bn.trim(),
          image_url: v.image_url.trim(),
          stock: Number(v.stock) || 0,
        })),
      price: Number(form.price),
      compare_at_price:
        form.compare_at_price === "" ? null : Number(form.compare_at_price),
      image_url: form.image_url || null,
      stock: Number(form.stock) || 0,
      is_active: form.is_active,
    };

    try {
      const r = editingId
        ? await authFetch(`/api/admin/products/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await authFetch("/api/admin/products", {
            method: "POST",
            body: JSON.stringify(body),
          });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "save");
        return;
      }
      closeModal();
      await loadProducts();
    } catch {
      setError("network");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("admin.crud.confirmDelete"))) return;
    const r = await authFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setError(data.error || "delete");
      return;
    }
    if (Number(editingId) === Number(id)) closeModal();
    loadProducts();
  }

  function startEditFromRow(p) {
    setDetailLoading(true);
    setMainImageUploading(false);
    setVariantImageUploading(null);
    setEditingId(p.id);
    setForm(emptyForm(categories));
    setModalOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applyFilters() {
    setQ(qDraft);
    setPriceMin(priceMinDraft);
    setPriceMax(priceMaxDraft);
    setPage(1);
  }

  function clearFilters() {
    setQDraft("");
    setQ("");
    setCategoryId("");
    setBrandId("all");
    setActiveFilter("all");
    setStockFilter("all");
    setSort("id_desc");
    setPriceMin("");
    setPriceMax("");
    setPriceMinDraft("");
    setPriceMaxDraft("");
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {t("admin.nav.products")}
          </h1>
          <p className="mt-2 max-w-3xl text-slate-400">{t("admin.productsCrudHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            disabled={metaLoading || !categories.length}
            title={
              !categories.length ? t("auth.errors.no_categories") : undefined
            }
            className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("admin.crud.newProduct")}
          </button>
          <Link
            to="/admin"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            ← {t("admin.nav.dashboard")}
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex min-w-0 flex-col gap-1 xl:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.productsFilters.searchPh")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.category")}</span>
          <PortalSelect
            value={categoryId}
            onChange={(v) => {
              setCategoryId(String(v));
              setPage(1);
            }}
            disabled={metaLoading}
            options={[
              { value: "", label: t("admin.productsFilters.categoryAll") },
              ...categories.map((c) => ({
                value: String(c.id),
                label: i18n.language?.startsWith("bn") ? c.name_bn : c.name_en,
              })),
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.brand")}</span>
          <PortalSelect
            value={brandId}
            onChange={(v) => {
              setBrandId(String(v));
              setPage(1);
            }}
            disabled={metaLoading}
            options={[
              { value: "all", label: t("admin.productsFilters.brandAll") },
              { value: "none", label: t("admin.productsFilters.brandNone") },
              ...brands.map((b) => ({
                value: String(b.id),
                label: i18n.language?.startsWith("bn") ? b.name_bn : b.name_en,
              })),
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.active")}</span>
          <PortalSelect
            value={activeFilter}
            onChange={(v) => {
              setActiveFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.productsFilters.activeAll") },
              { value: "active", label: t("admin.productsFilters.activeLive") },
              { value: "inactive", label: t("admin.productsFilters.activeHidden") },
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.stock")}</span>
          <PortalSelect
            value={stockFilter}
            onChange={(v) => {
              setStockFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.productsFilters.stockAll") },
              { value: "out", label: t("admin.productsFilters.stockOut") },
              { value: "low", label: t("admin.productsFilters.stockLow") },
              { value: "ok", label: t("admin.productsFilters.stockOk") },
            ]}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:items-end">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.priceMin")}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMinDraft}
            onChange={(e) => setPriceMinDraft(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.priceMax")}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMaxDraft}
            onChange={(e) => setPriceMaxDraft(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder="—"
          />
        </label>
        <label className="flex flex-col gap-1 lg:col-span-4">
          <span className="text-xs text-slate-500">{t("admin.productsFilters.sort")}</span>
          <PortalSelect
            value={sort}
            onChange={(v) => {
              setSort(String(v));
              setPage(1);
            }}
            options={[
              { value: "id_desc", label: t("admin.productsFilters.sortIdDesc") },
              { value: "id_asc", label: t("admin.productsFilters.sortIdAsc") },
              { value: "created_desc", label: t("admin.productsFilters.sortCreatedDesc") },
              { value: "created_asc", label: t("admin.productsFilters.sortCreatedAsc") },
              { value: "name_en_asc", label: t("admin.productsFilters.sortNameAsc") },
              { value: "name_en_desc", label: t("admin.productsFilters.sortNameDesc") },
              { value: "price_desc", label: t("admin.productsFilters.sortPriceDesc") },
              { value: "price_asc", label: t("admin.productsFilters.sortPriceAsc") },
              { value: "stock_desc", label: t("admin.productsFilters.sortStockDesc") },
              { value: "stock_asc", label: t("admin.productsFilters.sortStockAsc") },
            ]}
          />
        </label>
        <div className="flex flex-wrap gap-2 lg:col-span-4 lg:justify-end">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl border border-brand-500/30 bg-brand-600/30 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/45"
          >
            {t("admin.productsFilters.apply")}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            {t("admin.productsFilters.clear")}
          </button>
        </div>
      </div>

      {!productsLoading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.productsFilters.results", { count: total, page, pages: totalPages })}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t("admin.table.name")}</th>
                <th className="px-4 py-3">{t("admin.table.category")}</th>
                <th className="px-4 py-3">{t("admin.table.brand")}</th>
                <th className="px-4 py-3">{t("admin.table.price")}</th>
                <th className="px-4 py-3">{t("admin.table.stock")}</th>
                <th className="px-4 py-3">{t("admin.table.active")}</th>
                <th className="px-4 py-3">{t("admin.crud.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    {t("shop.loading")}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-500">{p.id}</td>
                    <td className="max-w-[220px] px-4 py-3 font-medium text-white">
                      <span className="line-clamp-2">{productName(p, i18n.language)}</span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-slate-500">{p.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {i18n.language?.startsWith("bn") ? p.category_name_bn : p.category_name_en}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.brand_id
                        ? i18n.language?.startsWith("bn")
                          ? p.brand_name_bn
                          : p.brand_name_en
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-200">
                      {formatPrice(p.price, i18n.language)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-200">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.is_active ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-600/30 text-slate-400"
                        }`}
                      >
                        {p.is_active ? t("admin.inventory.activeLive") : t("admin.inventory.activeHidden")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <Link
                          to={`/shop/${encodeURIComponent(p.slug)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/15"
                          title={t("admin.productsAdmin.viewShop")}
                          aria-label={t("admin.productsAdmin.viewShop")}
                        >
                          <IconEye />
                        </Link>
                        <button
                          type="button"
                          onClick={() => startEditFromRow(p)}
                          className="inline-flex rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/15"
                          title={t("admin.crud.edit")}
                          aria-label={t("admin.crud.edit")}
                        >
                          <IconPencil />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          className="inline-flex rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/15"
                          title={t("admin.crud.delete")}
                          aria-label={t("admin.crud.delete")}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!productsLoading && products.length === 0 && !error && (
            <p className="px-4 py-8 text-center text-slate-500">{t("admin.productsFilters.empty")}</p>
          )}
        </div>

      {!productsLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((x) => Math.max(1, x - 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("admin.ordersPrev")}
          </button>
          <span className="text-sm text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("admin.ordersNext")}
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
            role="dialog"
            aria-modal
          >
            <h2 className="font-display text-xl font-semibold text-white">
              {editingId ? t("admin.crud.editProduct") : t("admin.crud.newProduct")}
            </h2>
            {editingId && detailLoading ? (
              <p className="mt-8 text-slate-400">{t("shop.loading")}</p>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.category")}</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category_id: Number(e.target.value) }))
                    }
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.brand")}</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.brand_id}
                    onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                  >
                    <option value="">{t("shop.filterAllBrands")}</option>
                    {brands.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {i18n.language?.startsWith("bn") ? b.name_bn : b.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.crud.nameBn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.name_bn}
                    onChange={(e) => setForm((f) => ({ ...f, name_bn: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.crud.nameEn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.name_en}
                    onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.slug")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="unique-url-slug"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.descBn")}</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.description_bn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description_bn: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.descEn")}</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.description_en}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description_en: e.target.value }))
                    }
                  />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{t("admin.crud.structuredDescriptionEn")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("admin.crud.structuredDescriptionHint")}</p>
                  <div className="mt-3 space-y-3">
                    {form.sections_en.map((row, idx) => (
                      <div
                        key={`en-${idx}`}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">
                            {t("admin.crud.section")} {idx + 1}
                          </span>
                          {form.sections_en.length > 1 && (
                            <button
                              type="button"
                              className="text-xs text-rose-400 hover:underline"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  sections_en: f.sections_en.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              {t("admin.crud.removeSection")}
                            </button>
                          )}
                        </div>
                        <input
                          className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.sectionTitle")}
                          value={row.title}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.sections_en];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...f, sections_en: next };
                            })
                          }
                        />
                        <textarea
                          rows={3}
                          className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.sectionBody")}
                          value={row.body}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.sections_en];
                              next[idx] = { ...next[idx], body: e.target.value };
                              return { ...f, sections_en: next };
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm text-brand-400 hover:underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        sections_en: [...f.sections_en, emptySection()],
                      }))
                    }
                  >
                    {t("admin.crud.addSection")}
                  </button>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{t("admin.crud.structuredDescriptionBn")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("admin.crud.structuredDescriptionHint")}</p>
                  <div className="mt-3 space-y-3">
                    {form.sections_bn.map((row, idx) => (
                      <div
                        key={`bn-${idx}`}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">
                            {t("admin.crud.section")} {idx + 1}
                          </span>
                          {form.sections_bn.length > 1 && (
                            <button
                              type="button"
                              className="text-xs text-rose-400 hover:underline"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  sections_bn: f.sections_bn.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              {t("admin.crud.removeSection")}
                            </button>
                          )}
                        </div>
                        <input
                          className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.sectionTitle")}
                          value={row.title}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.sections_bn];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...f, sections_bn: next };
                            })
                          }
                        />
                        <textarea
                          rows={3}
                          className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.sectionBody")}
                          value={row.body}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.sections_bn];
                              next[idx] = { ...next[idx], body: e.target.value };
                              return { ...f, sections_bn: next };
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm text-brand-400 hover:underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        sections_bn: [...f.sections_bn, emptySection()],
                      }))
                    }
                  >
                    {t("admin.crud.addSection")}
                  </button>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{t("admin.crud.colorVariants")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("admin.crud.colorVariantsHint")}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{t("admin.crud.imageUploadNote")}</p>
                  <div className="mt-3 space-y-3">
                    {form.color_variants.map((row, idx) => (
                      <div
                        key={row.id ?? `new-${idx}`}
                        className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-2"
                      >
                        <input
                          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.variantNameEn")}
                          value={row.name_en}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.color_variants];
                              next[idx] = { ...next[idx], name_en: e.target.value };
                              return { ...f, color_variants: next };
                            })
                          }
                        />
                        <input
                          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                          placeholder={t("admin.crud.variantNameBn")}
                          value={row.name_bn}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.color_variants];
                              next[idx] = { ...next[idx], name_bn: e.target.value };
                              return { ...f, color_variants: next };
                            })
                          }
                        />
                        <div className="sm:col-span-2 space-y-2">
                          <input
                            className="w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                            placeholder={t("admin.crud.variantImageUrl")}
                            value={row.image_url}
                            onChange={(e) =>
                              setForm((f) => {
                                const next = [...f.color_variants];
                                next[idx] = { ...next[idx], image_url: e.target.value };
                                return { ...f, color_variants: next };
                              })
                            }
                          />
                          <label className="inline-flex cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="sr-only"
                              disabled={saving || variantImageUploading === idx}
                              onChange={(e) => onVariantImageFile(idx, e)}
                            />
                            {variantImageUploading === idx ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
                          </label>
                          {row.image_url?.trim() ? (
                            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
                              <img
                                src={resolvePublicAssetUrl(row.image_url.trim())}
                                alt=""
                                className="max-h-28 w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <label className="text-xs text-slate-500">{t("admin.table.stock")}</label>
                          <input
                            type="number"
                            min="0"
                            className="w-24 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
                            value={row.stock}
                            onChange={(e) =>
                              setForm((f) => {
                                const next = [...f.color_variants];
                                next[idx] = {
                                  ...next[idx],
                                  stock: Number(e.target.value) || 0,
                                };
                                return { ...f, color_variants: next };
                              })
                            }
                          />
                          <button
                            type="button"
                            className="ml-auto text-xs text-rose-400 hover:underline"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                color_variants: f.color_variants.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            {t("admin.crud.removeVariant")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm text-brand-400 hover:underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        color_variants: [
                          ...f.color_variants,
                          {
                            name_en: "",
                            name_bn: "",
                            image_url: "",
                            stock: 0,
                          },
                        ],
                      }))
                    }
                  >
                    {t("admin.crud.addVariant")}
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-500">{t("admin.crud.price")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.crud.comparePrice")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.compare_at_price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, compare_at_price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.table.stock")}</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.imageUrl")}</label>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{t("admin.crud.productImageHint")}</p>
                  <input
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">{t("admin.crud.imageUploadNote")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={mainImageUploading || saving || detailLoading}
                        onChange={onMainImageFile}
                      />
                      {mainImageUploading ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
                    </label>
                  </div>
                  {form.image_url?.trim() ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      <img
                        src={resolvePublicAssetUrl(form.image_url.trim())}
                        alt=""
                        className="max-h-52 w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    id="active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    className="rounded border-white/20"
                  />
                  <label htmlFor="active" className="text-sm text-slate-300">
                    {t("admin.crud.activeProduct")}
                  </label>
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving || (editingId != null && detailLoading)}
                    className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? t("auth.submitting") : t("admin.crud.save")}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-white/15 px-6 py-2 text-slate-300"
                  >
                    {t("admin.crud.cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
