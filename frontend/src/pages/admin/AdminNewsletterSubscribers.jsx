import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { translateAdminError } from "../../utils/adminApiError.js";

const PAGE_SIZE = 25;

function formatDate(iso, lang) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

export default function AdminNewsletterSubscribers() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (q.trim()) params.set("q", q.trim());
    authFetch(`/api/admin/newsletter-subscribers?${params}`)
      .then((r) => {
        if (!r.ok) return r.json().then((data) => Promise.reject(new Error(data.error || String(r.status))));
        return r.json();
      })
      .then((data) => {
        const rows = data.subscribers || [];
        const tot = Number(data.total) || 0;
        const maxPage = Math.max(1, Math.ceil(tot / PAGE_SIZE));
        setList(rows);
        setTotal(tot);
        setPage((p) => Math.min(p, maxPage));
      })
      .catch((e) => setError(typeof e.message === "string" ? e.message : "error"))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearFilters() {
    setQDraft("");
    setQ("");
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.newsletterSubscribers.title")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("admin.newsletterSubscribers.hint")}</p>
        </div>
        <Link
          to="/admin"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          ← {t("admin.nav.dashboard")}
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.newsletterSubscribers.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setQ(qDraft), setPage(1))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.newsletterSubscribers.searchPh")}
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
          {t("admin.newsletterSubscribers.applySearch")}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {t("admin.newsletterSubscribers.clearFilters")}
        </button>
      </div>

      {!loading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.newsletterSubscribers.results", { count: total, page, pages: totalPages })}
        </p>
      )}

      {error && (
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
        {loading ? (
          <p className="px-4 py-8 text-center text-slate-500">{t("admin.newsletterSubscribers.loading")}</p>
        ) : list.length === 0 ? (
          <p className="px-4 py-10 text-center text-slate-500">{t("admin.newsletterSubscribers.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("admin.newsletterSubscribers.colDate")}</th>
                  <th className="px-4 py-3 font-semibold">{t("admin.newsletterSubscribers.colEmail")}</th>
                  <th className="px-4 py-3 font-semibold">{t("admin.newsletterSubscribers.colSource")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.06] text-slate-200 transition hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {formatDate(row.createdAt, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${String(row.email || "").trim()}`} className="break-all text-brand-300 hover:underline">
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.source || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && list.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
          >
            {t("admin.newsletterSubscribers.prev")}
          </button>
          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
          >
            {t("admin.newsletterSubscribers.next")}
          </button>
        </div>
      )}
    </div>
  );
}
