import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";
import { uploadCatalogCoverImage } from "../../api/catalogCoverUpload.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { slugify } from "../../utils/slug.js";
import { PortalSelect } from "../../components/admin/PortalSelect.jsx";

const emptyForm = {
  name_bn: "",
  name_en: "",
  slug: "",
  page_layout: "clothing",
  cover_image: "",
};

const PAGE_LAYOUT_OPTIONS = [
  { value: "clothing", labelKey: "admin.crud.pageLayoutClothing" },
  { value: "footwear", labelKey: "admin.crud.pageLayoutFootwear" },
  { value: "accessories", labelKey: "admin.crud.pageLayoutAccessories" },
  { value: "grooming", labelKey: "admin.crud.pageLayoutGrooming" },
];

const PAGE_SIZE = 25;

function formatCategoryDate(iso, lang) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

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

export default function AdminCategories() {
  const { t, i18n } = useTranslation();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [layoutFilter, setLayoutFilter] = useState("all");
  const [hasProductsFilter, setHasProductsFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [soldFilter, setSoldFilter] = useState("all");
  const [sort, setSort] = useState("sort_asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const modalOpenRef = useRef(false);
  modalOpenRef.current = modalOpen;

  const load = useCallback((options = {}) => {
    const silent = !!options.silent;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (layoutFilter !== "all") params.set("layout", layoutFilter);
    if (hasProductsFilter !== "all") params.set("hasProducts", hasProductsFilter);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (soldFilter !== "all") params.set("sold", soldFilter);

    return authFetch(`/api/admin/categories?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        const rows = data.categories || [];
        const tot = Number(data.total) || 0;
        const maxPage = Number.isFinite(tot) ? Math.max(1, Math.ceil(Math.max(0, tot) / PAGE_SIZE)) : 1;
        setList(rows);
        setTotal(tot);
        setPage((p) => {
          const prev = Number.isFinite(p) ? p : 1;
          const next = Math.min(prev, maxPage);
          return next;
        });
      })
      .catch((e) => {
        if (!silent) setError(e.message);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [page, q, layoutFilter, hasProductsFilter, stockFilter, soldFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (modalOpenRef.current) return;
      load({ silent: true });
    }, 45_000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !modalOpenRef.current) load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [load]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applySearch() {
    setQ(qDraft);
    setPage(1);
  }

  function clearFilters() {
    setQDraft("");
    setQ("");
    setLayoutFilter("all");
    setHasProductsFilter("all");
    setStockFilter("all");
    setSoldFilter("all");
    setSort("sort_asc");
    setPage(1);
  }

  function openAdd() {
    setError(null);
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(row) {
    setError(null);
    setEditingId(row.id);
    setForm({
      name_bn: row.name_bn,
      name_en: row.name_en,
      slug: row.slug,
      page_layout: row.page_layout || "clothing",
      cover_image: row.cover_image != null ? String(row.cover_image) : "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const r = await authFetch(`/api/admin/categories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({
            name_bn: form.name_bn,
            name_en: form.name_en,
            slug: form.slug,
            page_layout: form.page_layout || "clothing",
            cover_image: form.cover_image.trim(),
          }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data.error || "save");
          return;
        }
      } else {
        const body = {
          name_bn: form.name_bn,
          name_en: form.name_en,
          slug: form.slug || slugify(form.name_en),
          page_layout: form.page_layout || "clothing",
          cover_image: form.cover_image.trim(),
        };
        const r = await authFetch("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data.error || "save");
          return;
        }
      }
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("admin.crud.confirmDelete"))) return;
    const r = await authFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "delete");
      return;
    }
    if (editingId === id) closeModal();
    load();
  }

  function layoutLabel(code) {
    const opt = PAGE_LAYOUT_OPTIONS.find((o) => o.value === code);
    return opt ? t(opt.labelKey) : code;
  }

  async function onCoverFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setCoverUploading(true);
    try {
      const url = await uploadCatalogCoverImage(file);
      setForm((f) => ({ ...f, cover_image: url }));
    } catch (err) {
      setError(err?.message || "upload");
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.nav.categories")}</h1>
          <p className="mt-2 max-w-3xl text-slate-400">{t("admin.categoriesHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("admin.crud.addCategory")}
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
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex min-w-0 flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.categoriesFilters.searchPh")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.layout")}</span>
          <PortalSelect
            value={layoutFilter}
            onChange={(v) => {
              setLayoutFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.categoriesFilters.layoutAll") },
              ...PAGE_LAYOUT_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
              })),
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.hasProducts")}</span>
          <PortalSelect
            value={hasProductsFilter}
            onChange={(v) => {
              setHasProductsFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.categoriesFilters.hasProductsAll") },
              { value: "yes", label: t("admin.categoriesFilters.hasProductsYes") },
              { value: "no", label: t("admin.categoriesFilters.hasProductsNo") },
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.stock")}</span>
          <PortalSelect
            value={stockFilter}
            onChange={(v) => {
              setStockFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.categoriesFilters.stockAll") },
              { value: "in_stock", label: t("admin.categoriesFilters.stockInStock") },
              { value: "zero_stock", label: t("admin.categoriesFilters.stockZero") },
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.sold")}</span>
          <PortalSelect
            value={soldFilter}
            onChange={(v) => {
              setSoldFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.categoriesFilters.soldAll") },
              { value: "has_sales", label: t("admin.categoriesFilters.soldHasSales") },
              { value: "no_sales", label: t("admin.categoriesFilters.soldNoSales") },
            ]}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 lg:justify-between">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 lg:max-w-md">
          <span className="text-xs text-slate-500">{t("admin.categoriesFilters.sort")}</span>
          <PortalSelect
            value={sort}
            onChange={(v) => {
              setSort(String(v));
              setPage(1);
            }}
            options={[
              { value: "sort_asc", label: t("admin.categoriesFilters.sortOrderAsc") },
              { value: "sort_desc", label: t("admin.categoriesFilters.sortOrderDesc") },
              { value: "id_desc", label: t("admin.categoriesFilters.sortIdDesc") },
              { value: "id_asc", label: t("admin.categoriesFilters.sortIdAsc") },
              { value: "name_en_asc", label: t("admin.categoriesFilters.sortNameAsc") },
              { value: "name_en_desc", label: t("admin.categoriesFilters.sortNameDesc") },
              { value: "slug_asc", label: t("admin.categoriesFilters.sortSlugAsc") },
              { value: "created_desc", label: t("admin.categoriesFilters.sortCreatedDesc") },
              { value: "created_asc", label: t("admin.categoriesFilters.sortCreatedAsc") },
              { value: "stock_desc", label: t("admin.categoriesFilters.sortStockDesc") },
              { value: "stock_asc", label: t("admin.categoriesFilters.sortStockAsc") },
              { value: "sold_desc", label: t("admin.categoriesFilters.sortSoldDesc") },
              { value: "sold_asc", label: t("admin.categoriesFilters.sortSoldAsc") },
            ]}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applySearch}
            className="rounded-xl border border-brand-500/30 bg-brand-600/30 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/45"
          >
            {t("admin.categoriesFilters.apply")}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            {t("admin.categoriesFilters.clear")}
          </button>
        </div>
      </div>

      {!loading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.categoriesFilters.results", { count: total, page, pages: totalPages })}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{t("admin.table.name")}</th>
              <th className="px-4 py-3">{t("admin.crud.slug")}</th>
              <th className="whitespace-nowrap px-4 py-3">{t("admin.categoriesColumns.startDate")}</th>
              <th className="px-4 py-3">{t("admin.crud.pageLayout")}</th>
              <th className="px-4 py-3 text-right" title={t("admin.categoriesColumns.stockHint")}>
                {t("admin.categoriesColumns.stock")}
              </th>
              <th className="px-4 py-3 text-right" title={t("admin.categoriesColumns.saleHint")}>
                {t("admin.categoriesColumns.sale")}
              </th>
              <th className="px-4 py-3">{t("admin.crud.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  {t("shop.loading")}
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-500">{row.id}</td>
                  <td className="max-w-[200px] px-4 py-3 text-white">
                    <span className="font-medium">{i18n.language?.startsWith("bn") ? row.name_bn : row.name_en}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {i18n.language?.startsWith("bn") ? row.name_en : row.name_bn}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.slug}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                    {formatCategoryDate(row.created_at, i18n.language)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{layoutLabel(row.page_layout)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">
                    {Number(row.stock_units ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-200">
                    {Number(row.units_sold ?? 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <Link
                        to={`/categories/${encodeURIComponent(row.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/15"
                        title={t("admin.categories.viewShop")}
                        aria-label={t("admin.categories.viewShop")}
                      >
                        <IconEye />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/15"
                        title={t("admin.crud.edit")}
                        aria-label={t("admin.crud.edit")}
                      >
                        <IconPencil />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
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
        {!loading && list.length === 0 && !error && (
          <p className="px-4 py-8 text-center text-slate-500">{t("admin.categoriesFilters.empty")}</p>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("admin.ordersNext")}
          </button>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 p-4"
          onClick={closeModal}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
          role="presentation"
        >
          <div
            className="max-h-[min(92vh,920px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl outline-none"
            role="dialog"
            aria-labelledby="admin-category-modal-title"
            aria-modal="true"
            tabIndex={-1}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-category-modal-title" className="font-display text-lg font-semibold text-white">
              {editingId ? t("admin.crud.editCategory") : t("admin.crud.addCategory")}
            </h2>

            <form onSubmit={submitForm} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-xs text-slate-500">{t("admin.crud.nameBn")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  value={form.name_bn}
                  onChange={(e) => setForm((f) => ({ ...f, name_bn: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs text-slate-500">{t("admin.crud.nameEn")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  value={form.name_en}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.slug")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="electronics"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500" htmlFor="admin-category-page-layout">
                  {t("admin.crud.pageLayout")}
                </label>
                <select
                  id="admin-category-page-layout"
                  className="mt-1 w-full appearance-none rounded-lg border border-white/10 bg-black/40 bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat px-3 py-2 pr-10 text-sm text-white outline-none focus:border-brand-500/40"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
                  value={form.page_layout}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, page_layout: String(e.target.value || "clothing") }))
                  }
                >
                  {PAGE_LAYOUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-950 text-white">
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.catalogCoverUrl")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  value={form.cover_image}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                  placeholder="https://…"
                  autoComplete="off"
                />
                <p className="mt-1 text-[11px] text-slate-500">{t("admin.crud.catalogCoverHint")}</p>
                <p className="mt-1 text-[11px] text-slate-400">{t("admin.crud.imageUploadNote")}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={coverUploading || saving}
                      onChange={onCoverFileSelected}
                    />
                    {coverUploading ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
                  </label>
                  {form.cover_image.trim() ? (
                    <button
                      type="button"
                      className="text-xs text-slate-400 underline hover:text-white"
                      onClick={() => setForm((f) => ({ ...f, cover_image: "" }))}
                    >
                      {t("admin.crud.catalogCoverClear")}
                    </button>
                  ) : null}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/90">
                    {t("admin.crud.catalogCoverPreview")}
                  </p>
                  {form.cover_image.trim() ? (
                    <div className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-brand-900/30 via-slate-900/80 to-slate-950 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] ring-1 ring-brand-500/20">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.65rem] bg-black/50 shadow-inner">
                        <img
                          src={resolvePublicAssetUrl(form.cover_image.trim())}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                          loading="lazy"
                          decoding="async"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
                          aria-hidden
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex min-h-[10rem] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[radial-gradient(ellipse_at_top,_rgba(244,63,94,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.06),_transparent_50%)] px-4 py-8 text-center">
                      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{t("admin.crud.catalogCoverEmpty")}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                >
                  {saving ? t("shop.loading") : editingId ? t("admin.crud.save") : t("admin.crud.addCategory")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/15 px-6 py-2 text-slate-300 hover:bg-white/5"
                >
                  {t("admin.crud.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
