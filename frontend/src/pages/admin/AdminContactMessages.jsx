import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function AdminContactMessages() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (q.trim()) params.set("q", q.trim());
    authFetch(`/api/admin/contact-messages?${params}`)
      .then((r) => {
        if (!r.ok) return r.json().then((data) => Promise.reject(new Error(data.error || String(r.status))));
        return r.json();
      })
      .then((data) => {
        const rows = data.messages || [];
        const tot = Number(data.total) || 0;
        const maxPage = Math.max(1, Math.ceil(tot / PAGE_SIZE));
        setList(rows);
        setTotal(tot);
        setPage((p) => Math.min(p, maxPage));
        setExpandedId((cur) => (cur && rows.some((m) => m.id === cur) ? cur : null));
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

  function buildMailto(row) {
    const subj = encodeURIComponent(`Re: ${row.subject || ""}`);
    const addr = String(row.email || "").trim();
    return `mailto:${addr}?subject=${subj}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.contactMessages.title")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("admin.contactMessages.hint")}</p>
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
          <span className="text-xs text-slate-500">{t("admin.contactMessages.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setQ(qDraft), setPage(1))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.contactMessages.searchPh")}
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
          {t("admin.contactMessages.applySearch")}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {t("admin.contactMessages.clearFilters")}
        </button>
      </div>

      {!loading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.contactMessages.results", { count: total, page, pages: totalPages })}
        </p>
      )}

      {error && (
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
        {loading ? (
          <p className="px-4 py-8 text-center text-slate-500">{t("admin.contactMessages.loading")}</p>
        ) : list.length === 0 ? (
          <p className="px-4 py-10 text-center text-slate-500">{t("admin.contactMessages.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("admin.contactMessages.colDate")}</th>
                  <th className="px-4 py-3 font-semibold">{t("admin.contactMessages.colFrom")}</th>
                  <th className="px-4 py-3 font-semibold">{t("admin.contactMessages.colEmail")}</th>
                  <th className="px-4 py-3 font-semibold">{t("admin.contactMessages.colSubject")}</th>
                  <th className="w-32 px-4 py-3 font-semibold">{t("admin.contactMessages.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => {
                  const open = expandedId === row.id;
                  const fullName = `${row.firstName || ""} ${row.lastName || ""}`.trim() || "—";
                  return (
                    <FragmentRow
                      key={row.id}
                      row={row}
                      open={open}
                      fullName={fullName}
                      lang={lang}
                      t={t}
                      onToggle={() => setExpandedId(open ? null : row.id)}
                      mailtoHref={buildMailto(row)}
                    />
                  );
                })}
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
            {t("admin.contactMessages.prev")}
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
            {t("admin.contactMessages.next")}
          </button>
        </div>
      )}
    </div>
  );
}

function FragmentRow({ row, open, fullName, lang, t, onToggle, mailtoHref }) {
  return (
    <>
      <motion.tr layout className="border-b border-white/[0.06] text-slate-200 transition hover:bg-white/[0.02]">
        <td className="whitespace-nowrap px-4 py-3 align-top text-slate-400">
          {formatDate(row.createdAt, lang)}
        </td>
        <td className="max-w-[180px] px-4 py-3 align-top font-medium text-white">
          <span className="line-clamp-2">{fullName}</span>
        </td>
        <td className="max-w-[200px] px-4 py-3 align-top">
          <a href={mailtoHref} className="break-all text-brand-300 hover:underline">
            {row.email}
          </a>
        </td>
        <td className="max-w-[min(280px,40vw)] px-4 py-3 align-top">
          <span className="line-clamp-2 text-slate-300">{row.subject}</span>
        </td>
        <td className="px-4 py-3 align-top">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onToggle}
              className="whitespace-nowrap rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              {open ? t("admin.contactMessages.collapse") : t("admin.contactMessages.expand")}
            </button>
            <a
              href={mailtoHref}
              className="whitespace-nowrap rounded-lg border border-brand-500/30 bg-brand-600/20 px-2 py-1 text-center text-xs text-brand-200 hover:bg-brand-600/35"
            >
              {t("admin.contactMessages.replyMail")}
            </a>
          </div>
        </td>
      </motion.tr>
      {open && (
        <tr className="border-b border-white/[0.06] bg-black/30">
          <td colSpan={5} className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("admin.contactMessages.fullMessage")}</p>
            <pre className="mt-2 max-h-[min(360px,50vh)] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-sm leading-relaxed text-slate-200">
              {row.message || ""}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
