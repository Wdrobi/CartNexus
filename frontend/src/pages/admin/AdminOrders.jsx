import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { formatPrice } from "../../utils/price.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { deliveryZoneDisplayName } from "../../utils/deliveryZoneLabel.js";

/** Background/border tint for the custom status picker trigger button. */
function statusSelectSurface(status) {
  const s = String(status || "");
  if (s === "pending") return "border-amber-500/40 bg-amber-500/15";
  if (s === "confirmed") return "border-violet-500/40 bg-violet-500/15";
  if (s === "shipped") return "border-sky-500/40 bg-sky-500/15";
  if (s === "delivered") return "border-emerald-500/40 bg-emerald-500/15";
  if (s === "cancelled") return "border-slate-500/45 bg-slate-500/20";
  return "border-slate-500/35 bg-slate-500/15";
}

const PAGE_SIZE = 25;

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

/**
 * Custom listbox instead of native <select>: OS dropdowns often use a light panel with
 * inherited light text → invisible labels. Portal + dark menu fixes that everywhere.
 */
function OrderStatusPicker({ value, busy, onSelect, variant, t }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [rect, setRect] = useState(null);

  const disabled = !!busy;

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({
      top: r.bottom + 6,
      left: r.left,
      width: Math.max(r.width, variant === "compact" ? 148 : 140),
    });
  }, [variant]);

  useLayoutEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onScrollResize = () => measure();
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let removeListener = () => {};
    const timer = window.setTimeout(() => {
      const closeIfOutside = (e) => {
        if (btnRef.current?.contains(e.target)) return;
        if (menuRef.current?.contains(e.target)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", closeIfOutside, true);
      removeListener = () => document.removeEventListener("pointerdown", closeIfOutside, true);
    }, 0);
    return () => {
      clearTimeout(timer);
      removeListener();
    };
  }, [open]);

  const btnClass =
    variant === "compact"
      ? `shrink-0 max-w-[160px] rounded-lg border px-2 py-1 text-[11px] font-medium text-white outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/40 disabled:opacity-50 ${statusSelectSurface(value)}`
      : `w-full min-w-[140px] max-w-[200px] rounded-lg border px-2 py-1.5 text-xs text-white outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/40 disabled:opacity-50 ${statusSelectSurface(value)}`;

  const menu =
    open &&
    rect &&
    createPortal(
      <div
        ref={menuRef}
        role="listbox"
        className="z-[300] overflow-hidden rounded-lg border border-white/15 bg-slate-900 py-1 shadow-2xl shadow-black/70"
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          minWidth: rect.width,
          maxHeight: "min(60vh, 280px)",
          overflowY: "auto",
        }}
      >
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="option"
            aria-selected={s === value}
            className={`flex w-full items-center px-3 py-2 text-left text-sm text-slate-100 hover:bg-white/12 ${
              s === value ? "bg-white/10 font-medium text-white" : ""
            }`}
            onClick={() => {
              setOpen(false);
              if (s !== value) onSelect(s);
            }}
          >
            {t(`admin.orderStatus.${s}`)}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <div className="relative inline-block max-w-full">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
        className={`flex items-center justify-between gap-2 text-left ${btnClass}`}
      >
        <span className="min-w-0 truncate">{t(`admin.orderStatus.${value}`)}</span>
        <span className="shrink-0 opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {menu}
    </div>
  );
}

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("created_desc");
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [expandedId, setExpandedId] = useState(null);
  const [copyFlash, setCopyFlash] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    authFetch(`/api/admin/orders?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        setOrders(d.orders || []);
        setTotal(Number(d.total) || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, q, status, sort, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearFilters() {
    setQDraft("");
    setQ("");
    setStatus("all");
    setSort("created_desc");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function presetRange(days) {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      const y = end.getFullYear();
      const m = String(end.getMonth() + 1).padStart(2, "0");
      const d = String(end.getDate()).padStart(2, "0");
      setDateFrom(`${y}-${m}-${d}`);
      setDateTo(`${y}-${m}-${d}`);
    } else {
      start.setDate(start.getDate() - (days - 1));
      setDateFrom(start.toISOString().slice(0, 10));
      setDateTo(end.toISOString().slice(0, 10));
    }
    setPage(1);
  }

  async function copyText(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash(id);
      setTimeout(() => setCopyFlash(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function patchStatus(orderId, newStatus) {
    setStatusUpdatingId(orderId);
    setError(null);
    try {
      const r = await authFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || String(r.status));
        return;
      }
      const nextStatus = data.order?.status ?? newStatus;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    } catch (e) {
      setError(e.message || "network");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  const orderRow = (o) => {
    const exp = expandedId === o.id;
    const zoneLabel = deliveryZoneDisplayName(t, o.delivery_zone);
    return (
      <Fragment key={o.id}>
        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
          <td className="px-2 py-2">
            <button
              type="button"
              aria-expanded={exp}
              onClick={() => setExpandedId((x) => (x === o.id ? null : o.id))}
              className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-brand-200"
            >
              {exp ? "▾" : "▸"}
            </button>
          </td>
          <td className="px-3 py-2 text-slate-500">{o.id}</td>
          <td className="px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-brand-200">{o.order_number}</span>
              <button
                type="button"
                onClick={() => copyText(o.order_number, `n-${o.id}`)}
                className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/10"
              >
                {copyFlash === `n-${o.id}` ? t("admin.ordersCopied") : t("admin.ordersCopyNumber")}
              </button>
            </div>
          </td>
          <td className="max-w-[160px] px-3 py-2 text-white">{o.customer_name}</td>
          <td className="px-3 py-2 text-slate-400">{o.phone}</td>
          <td className="px-3 py-2 tabular-nums text-slate-300">{formatPrice(o.subtotal ?? o.total, lang)}</td>
          <td className="px-3 py-2 tabular-nums text-brand-200">{formatPrice(o.total, lang)}</td>
          <td className="px-3 py-2">
            <OrderStatusPicker
              value={o.status}
              busy={statusUpdatingId === o.id}
              variant="table"
              t={t}
              onSelect={(next) => patchStatus(o.id, next)}
            />
          </td>
          <td className="whitespace-nowrap px-3 py-2 text-slate-400">{fmtDate(o.created_at)}</td>
        </tr>
        {exp && (
          <tr className="border-b border-white/5 bg-black/25">
            <td colSpan={9} className="px-4 py-3">
              <div className="grid gap-3 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <span className="text-slate-500">{t("admin.ordersColPayment")}:</span>{" "}
                  <span className="text-slate-200">{String(o.payment_method || "—").toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t("admin.ordersColZone")}:</span>{" "}
                  <span className="text-slate-200">{zoneLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t("admin.ordersColDeliveryFee")}:</span>{" "}
                  <span className="text-slate-200">{formatPrice(o.delivery_fee ?? 0, lang)}</span>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-500">{t("admin.ordersColAddress")}:</span>
                  <p className="mt-1 whitespace-pre-wrap text-slate-300">{o.delivery_address || "—"}</p>
                </div>
              </div>
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.nav.orders")}</h1>
          <p className="mt-2 text-slate-400">{t("admin.ordersHintRich")}</p>
        </div>
        <Link
          to="/admin"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          ← {t("admin.nav.dashboard")}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">{t("admin.ordersViewMode")}:</span>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            viewMode === "table" ? "bg-brand-500/25 text-brand-100" : "text-slate-400 hover:bg-white/5"
          }`}
        >
          {t("admin.ordersViewTable")}
        </button>
        <button
          type="button"
          onClick={() => setViewMode("compact")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            viewMode === "compact" ? "bg-brand-500/25 text-brand-100" : "text-slate-400 hover:bg-white/5"
          }`}
        >
          {t("admin.ordersViewCompact")}
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1 xl:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.ordersSearch")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setQ(qDraft), setPage(1))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.ordersSearchPh")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.ordersStatusFilter")}</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
          >
            <option value="all">{t("admin.ordersStatusAll")}</option>
            <option value="pending">{t("admin.orderStatus.pending")}</option>
            <option value="confirmed">{t("admin.orderStatus.confirmed")}</option>
            <option value="shipped">{t("admin.orderStatus.shipped")}</option>
            <option value="delivered">{t("admin.orderStatus.delivered")}</option>
            <option value="cancelled">{t("admin.orderStatus.cancelled")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.ordersSort")}</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
          >
            <option value="created_desc">{t("admin.ordersSortCreatedDesc")}</option>
            <option value="created_asc">{t("admin.ordersSortCreatedAsc")}</option>
            <option value="total_desc">{t("admin.ordersSortTotalDesc")}</option>
            <option value="total_asc">{t("admin.ordersSortTotalAsc")}</option>
            <option value="customer_asc">{t("admin.ordersSortCustomer")}</option>
            <option value="order_number_asc">{t("admin.ordersSortNumber")}</option>
            <option value="status_asc">{t("admin.ordersSortStatus")}</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.ordersDateFrom")}</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.ordersDateTo")}</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => presetRange(0)}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
          >
            {t("admin.ordersPresetToday")}
          </button>
          <button
            type="button"
            onClick={() => presetRange(7)}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
          >
            {t("admin.ordersPreset7d")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setQ(qDraft);
            setPage(1);
          }}
          className="rounded-xl border border-brand-500/30 bg-brand-600/30 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/45"
        >
          {t("admin.ordersApplySearch")}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {t("admin.ordersClearFilters")}
        </button>
      </div>

      {!loading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.ordersResults", { count: total, page, pages: totalPages })}
        </p>
      )}

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.statsError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && viewMode === "table" && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="w-8 px-2 py-2" aria-label="expand" />
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t("admin.ordersColNumber")}</th>
                <th className="px-3 py-2">{t("admin.ordersColCustomer")}</th>
                <th className="px-3 py-2">{t("admin.ordersColPhone")}</th>
                <th className="px-3 py-2">{t("admin.ordersColSubtotal")}</th>
                <th className="px-3 py-2">{t("admin.ordersColTotal")}</th>
                <th className="px-3 py-2">{t("admin.ordersColStatus")}</th>
                <th className="px-3 py-2">{t("admin.ordersColDate")}</th>
              </tr>
            </thead>
            <tbody>{orders.map((o) => orderRow(o))}</tbody>
          </table>
          {orders.length === 0 && !error && (
            <p className="px-4 py-10 text-center text-slate-500">{t("admin.ordersEmpty")}</p>
          )}
        </div>
      )}

      {!loading && viewMode === "compact" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => {
            const exp = expandedId === o.id;
            const zoneLabel = deliveryZoneDisplayName(t, o.delivery_zone);
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4 shadow-lg shadow-black/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-brand-200">{o.order_number}</p>
                    <p className="mt-1 font-medium text-white">{o.customer_name}</p>
                    <p className="text-xs text-slate-500">{o.phone}</p>
                  </div>
                  <OrderStatusPicker
                    value={o.status}
                    busy={statusUpdatingId === o.id}
                    variant="compact"
                    t={t}
                    onSelect={(next) => patchStatus(o.id, next)}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-sm">
                  <span className="text-slate-500">{t("admin.ordersColTotal")}</span>
                  <span className="tabular-nums font-semibold text-brand-200">{formatPrice(o.total, lang)}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{fmtDate(o.created_at)}</p>
                <button
                  type="button"
                  onClick={() => setExpandedId((x) => (x === o.id ? null : o.id))}
                  className="mt-2 text-xs text-brand-300 hover:underline"
                >
                  {exp ? t("admin.ordersHideDetail") : t("admin.ordersShowDetail")}
                </button>
                {exp && (
                  <div className="mt-3 space-y-2 border-t border-white/5 pt-3 text-xs text-slate-400">
                    <p>
                      <span className="text-slate-500">{t("admin.ordersColZone")}:</span> {zoneLabel}
                    </p>
                    <p>
                      <span className="text-slate-500">{t("admin.ordersColPayment")}:</span>{" "}
                      {String(o.payment_method || "—").toUpperCase()}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-300">{o.delivery_address || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
          {orders.length === 0 && !error && (
            <p className="col-span-full py-10 text-center text-slate-500">{t("admin.ordersEmpty")}</p>
          )}
        </div>
      )}

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
    </div>
  );
}
