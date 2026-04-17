import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { brandName, productName } from "../../utils/productText.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { PortalSelect } from "../../components/admin/PortalSelect.jsx";

function skuLabel(row, lang) {
  const base = productName({ name_en: row.productNameEn, name_bn: row.productNameBn }, lang);
  if (row.kind === "variant") {
    const v = lang?.startsWith("bn") ? row.variantNameBn : row.variantNameEn;
    return v ? `${base} · ${v}` : base;
  }
  return base;
}

function statusBadgeClass(st) {
  if (st === "out") return "bg-rose-500/20 text-rose-200";
  if (st === "low") return "bg-amber-500/15 text-amber-200";
  return "bg-emerald-500/15 text-emerald-200";
}

export default function AdminInventory() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [tab, setTab] = useState("stock");

  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sort, setSort] = useState("stock_asc");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [movements, setMovements] = useState([]);
  const [movLoading, setMovLoading] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustRow, setAdjustRow] = useState(null);
  const [qtyDelta, setQtyDelta] = useState("");
  const [reason, setReason] = useState("adjustment");
  const [note, setNote] = useState("");
  const [adjustSaving, setAdjustSaving] = useState(false);
  const [adjustErr, setAdjustErr] = useState(null);

  const loadSummary = useCallback(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    const qs = params.toString();
    authFetch(`/api/admin/inventory/summary${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [categoryId, brandId]);

  const loadItems = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    params.set("sort", sort);
    authFetch(`/api/admin/inventory?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        setItems(d.items || []);
        setTotal(Number(d.total) || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, q, status, categoryId, brandId, sort]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([authFetch("/api/admin/categories"), authFetch("/api/admin/brands")])
      .then(async ([cr, br]) => {
        if (!cr.ok || !br.ok) return;
        const [cjson, bjson] = await Promise.all([cr.json(), br.json()]);
        if (!cancelled) {
          setCategories(cjson.categories || []);
          setBrands(bjson.brands || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setBrands([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMovements = useCallback(() => {
    setMovLoading(true);
    authFetch("/api/admin/inventory/movements?limit=50&offset=0")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => setMovements(d.movements || []))
      .catch(() => setMovements([]))
      .finally(() => setMovLoading(false));
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (tab === "history") loadMovements();
  }, [tab, loadMovements]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadSummary();
      if (tab === "stock") loadItems();
      if (tab === "history") loadMovements();
    }, 30_000);
    return () => clearInterval(id);
  }, [loadSummary, loadItems, loadMovements, tab]);

  function clearFilters() {
    setQDraft("");
    setQ("");
    setStatus("all");
    setCategoryId("");
    setBrandId("");
    setSort("stock_asc");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function openAdjust(row) {
    setAdjustRow(row);
    setQtyDelta("");
    setReason("adjustment");
    setNote("");
    setAdjustErr(null);
    setAdjustOpen(true);
  }

  async function submitAdjust() {
    if (!adjustRow) return;
    const delta = parseInt(String(qtyDelta).trim(), 10);
    if (!Number.isFinite(delta) || delta === 0) {
      setAdjustErr(t("admin.inventory.adjustInvalidQty"));
      return;
    }
    setAdjustSaving(true);
    setAdjustErr(null);
    try {
      const r = await authFetch("/api/admin/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId: adjustRow.productId,
          variantId: adjustRow.variantId,
          qtyDelta: delta,
          reason,
          note: note.trim() || null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setAdjustErr(translateAdminError(t, data.error || String(r.status)));
        return;
      }
      setAdjustOpen(false);
      loadSummary();
      loadItems();
      loadMovements();
    } catch {
      setAdjustErr(t("admin.statsError"));
    } finally {
      setAdjustSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.inventory.title")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("admin.inventory.hint")}</p>
        </div>
        <Link
          to="/admin"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          ← {t("admin.nav.dashboard")}
        </Link>
      </div>

      {summary && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { id: "a", title: t("admin.inventory.kpiTotal"), val: summary.totalSkus, sub: t("admin.inventory.kpiTotalHint") },
            { id: "b", title: t("admin.inventory.kpiIn"), val: summary.inStock, sub: t("admin.inventory.kpiInHint") },
            {
              id: "c",
              title: t("admin.inventory.kpiLow"),
              val: summary.lowStock,
              sub: t("admin.inventory.kpiLowHint", { n: summary.lowThreshold }),
            },
            { id: "d", title: t("admin.inventory.kpiOut"), val: summary.outOfStock, sub: t("admin.inventory.kpiOutHint") },
          ].map((k) => (
            <div
              key={k.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-lg shadow-black/20"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.title}</p>
              <p className="mt-2 font-display text-3xl font-bold text-white">{k.val}</p>
              <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setTab("stock")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "stock" ? "bg-brand-500/25 text-brand-100" : "text-slate-400 hover:bg-white/5"
          }`}
        >
          {t("admin.inventory.tabStock")}
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "history" ? "bg-brand-500/25 text-brand-100" : "text-slate-400 hover:bg-white/5"
          }`}
        >
          {t("admin.inventory.tabHistory")}
        </button>
      </div>

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.statsError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {tab === "stock" && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="flex min-w-0 flex-col gap-1 xl:col-span-2">
              <span className="text-xs text-slate-500">{t("admin.inventory.search")}</span>
              <input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setQ(qDraft), setPage(1))}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
                placeholder={t("admin.inventory.searchPh")}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{t("admin.inventory.filterCategory")}</span>
              <PortalSelect
                value={categoryId}
                onChange={(v) => {
                  setCategoryId(String(v));
                  setPage(1);
                }}
                options={[
                  { value: "", label: t("admin.inventory.filterCategoryAll") },
                  ...categories.map((c) => ({
                    value: String(c.id),
                    label: lang?.startsWith("bn") ? c.name_bn : c.name_en,
                  })),
                ]}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{t("admin.inventory.filterBrand")}</span>
              <PortalSelect
                value={brandId}
                onChange={(v) => {
                  setBrandId(String(v));
                  setPage(1);
                }}
                options={[
                  { value: "", label: t("admin.inventory.brandAll") },
                  { value: "none", label: t("admin.inventory.brandNone") },
                  ...brands.map((b) => ({
                    value: String(b.id),
                    label: lang?.startsWith("bn") ? b.name_bn : b.name_en,
                  })),
                ]}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{t("admin.inventory.filterStatus")}</span>
              <PortalSelect
                value={status}
                onChange={(v) => {
                  setStatus(String(v));
                  setPage(1);
                }}
                options={[
                  { value: "all", label: t("admin.inventory.statusAll") },
                  { value: "out", label: t("admin.inventory.statusOut") },
                  { value: "low", label: t("admin.inventory.statusLow") },
                  { value: "ok", label: t("admin.inventory.statusOk") },
                ]}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{t("admin.inventory.sortBy")}</span>
              <PortalSelect
                value={sort}
                onChange={(v) => {
                  setSort(String(v));
                  setPage(1);
                }}
                options={[
                  { value: "stock_asc", label: t("admin.inventory.sortStockAsc") },
                  { value: "stock_desc", label: t("admin.inventory.sortStockDesc") },
                  { value: "name_asc", label: t("admin.inventory.sortNameAsc") },
                  { value: "name_desc", label: t("admin.inventory.sortNameDesc") },
                  { value: "category_asc", label: t("admin.inventory.sortCategory") },
                  { value: "brand_asc", label: t("admin.inventory.sortBrand") },
                  { value: "sku_asc", label: t("admin.inventory.sortSku") },
                ]}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setQ(qDraft);
                setPage(1);
              }}
              className="rounded-xl border border-brand-500/30 bg-brand-600/30 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/45"
            >
              {t("admin.inventory.applySearch")}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              {t("admin.inventory.clearFilters")}
            </button>
          </div>

          {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

          {!loading && (
            <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                  <tr>
                    <th className="w-10 px-2 py-3" aria-label={t("admin.inventory.colDetail")} />
                    <th className="px-4 py-3">{t("admin.inventory.colSku")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colProduct")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colCategory")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colBrand")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colStock")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colStatus")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colActive")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const rowKey = `${row.kind}-${row.productId}-${row.variantId ?? "base"}`;
                    const exp = expandedKey === rowKey;
                    const bLabel =
                      row.brandId == null
                        ? t("admin.inventory.brandUnassigned")
                        : brandName({ name_en: row.brandNameEn, name_bn: row.brandNameBn }, lang);
                    return (
                      <Fragment key={rowKey}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              aria-expanded={exp}
                              onClick={() => setExpandedKey((k) => (k === rowKey ? null : rowKey))}
                              className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-brand-200"
                            >
                              {exp ? "▾" : "▸"}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-brand-200">{row.skuCode}</td>
                          <td className="max-w-[220px] px-4 py-3 lg:max-w-xs">
                            <span className="text-white">{skuLabel(row, lang)}</span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">/{row.slug}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {lang?.startsWith("bn") ? row.categoryNameBn : row.categoryNameEn}
                          </td>
                          <td className="max-w-[140px] px-4 py-3 text-slate-300">{bLabel}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-200">{row.stock}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}>
                              {t(`admin.inventory.stockStatus.${row.status}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                row.isActive ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-600/30 text-slate-400"
                              }`}
                            >
                              {row.isActive ? t("admin.inventory.activeLive") : t("admin.inventory.activeHidden")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openAdjust(row)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-brand-200 hover:bg-white/10"
                            >
                              {t("admin.inventory.adjust")}
                            </button>
                          </td>
                        </tr>
                        {exp && (
                          <tr className="border-b border-white/5 bg-black/25">
                            <td colSpan={9} className="px-4 py-3">
                              <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
                                <span>
                                  <span className="text-slate-500">{t("admin.inventory.detailProductId")}:</span>{" "}
                                  <code className="text-slate-300">{row.productId}</code>
                                </span>
                                <span>
                                  <span className="text-slate-500">{t("admin.inventory.detailVariantId")}:</span>{" "}
                                  <code className="text-slate-300">{row.variantId ?? "—"}</code>
                                </span>
                                <span>
                                  <span className="text-slate-500">{t("admin.inventory.detailCategoryId")}:</span>{" "}
                                  <code className="text-slate-300">{row.categoryId}</code>
                                </span>
                                <span>
                                  <span className="text-slate-500">{t("admin.inventory.detailBrandId")}:</span>{" "}
                                  <code className="text-slate-300">{row.brandId ?? "—"}</code>
                                </span>
                                <Link
                                  to={`/shop/${row.slug}`}
                                  className="text-brand-300 underline decoration-brand-500/40 underline-offset-2 hover:text-brand-200"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t("admin.inventory.detailViewStore")}
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {items.length === 0 && !error && (
                <p className="px-4 py-10 text-center text-slate-500">{t("admin.inventory.empty")}</p>
              )}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {t("admin.inventory.prev")}
              </button>
              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {t("admin.inventory.next")}
              </button>
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <div className="mt-6">
          {movLoading && <p className="text-slate-500">{t("shop.loading")}</p>}
          {!movLoading && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{t("admin.inventory.colWhen")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colProduct")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colDelta")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colAfter")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colReason")}</th>
                    <th className="px-4 py-3">{t("admin.inventory.colBy")}</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-slate-400">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-white">{m.productNameEn}</td>
                      <td className={`px-4 py-3 tabular-nums ${m.qtyDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {m.qtyDelta >= 0 ? " +" : ""}
                        {m.qtyDelta}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-200">{m.qtyAfter}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {t(`admin.inventory.reason.${m.reason}`, { defaultValue: m.reason })}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{m.createdByEmail || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {movements.length === 0 && (
                <p className="px-4 py-10 text-center text-slate-500">{t("admin.inventory.historyEmpty")}</p>
              )}
            </div>
          )}
        </div>
      )}

      {adjustOpen && adjustRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.inventory.adjustTitle")}</h2>
            <p className="mt-2 text-sm text-slate-400">{skuLabel(adjustRow, lang)}</p>
            <p className="mt-1 font-mono text-xs text-brand-200">{adjustRow.skuCode}</p>

            <label className="mt-4 block">
              <span className="text-xs text-slate-500">{t("admin.inventory.adjustQty")}</span>
              <input
                type="number"
                value={qtyDelta}
                onChange={(e) => setQtyDelta(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                placeholder={t("admin.inventory.adjustQtyPh")}
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs text-slate-500">{t("admin.inventory.adjustReason")}</span>
              <div className="mt-1">
                <PortalSelect
                  value={reason}
                  onChange={(v) => setReason(String(v))}
                  options={["adjustment", "received", "return", "damage", "correction", "count"].map((r) => ({
                    value: r,
                    label: t(`admin.inventory.reason.${r}`),
                  }))}
                />
              </div>
            </label>
            <label className="mt-3 block">
              <span className="text-xs text-slate-500">{t("admin.inventory.adjustNote")}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
              />
            </label>

            {adjustErr && <p className="mt-3 text-sm text-amber-200">{adjustErr}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                {t("admin.inventory.cancel")}
              </button>
              <button
                type="button"
                disabled={adjustSaving}
                onClick={submitAdjust}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
              >
                {adjustSaving ? t("shop.loading") : t("admin.inventory.saveAdjust")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
