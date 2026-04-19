import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";
import { uploadCatalogCoverImage } from "../../api/catalogCoverUpload.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { slugify } from "../../utils/slug.js";
import { stripHtmlTags, toEditorHtml } from "../../utils/blogBody.js";
import { BLOG_POSTS } from "../../data/blogPosts.js";
import { PortalSelect } from "../../components/admin/PortalSelect.jsx";
import BlogRichTextEditor from "../../components/admin/BlogRichTextEditor.jsx";

/** Default hero tint for blog cards + article header (no custom field in admin). */
const DEFAULT_BLOG_GRADIENT = "from-slate-700 via-slate-800 to-ink-950";

const emptyForm = {
  slug: "",
  category_en: "",
  category_bn: "",
  title_en: "",
  title_bn: "",
  excerpt_en: "",
  excerpt_bn: "",
  keywords_en: "",
  keywords_bn: "",
  body_en: "",
  body_bn: "",
  author: "CartNexus Editorial",
  read_time_min: 5,
  image_url: "",
  schedule_mode: "draft",
  scheduled_date: "",
  is_featured: false,
};

const PAGE_SIZE = 25;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/** @param {{ is_published?: boolean; date_published?: string | null }} row */
function scheduleModeFromRow(row) {
  if (!row?.is_published) return "draft";
  const dp = row.date_published ? String(row.date_published).slice(0, 10) : "";
  const t = todayIsoDate();
  if (dp && dp > t) return "scheduled";
  return "publish_now";
}

function estimateReadMinutesLocal(en, bn) {
  const text = `${stripHtmlTags(en)} ${stripHtmlTags(bn)}`;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
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

export default function AdminBlog() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [sort, setSort] = useState("date_desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  /** Read-only dates shown when editing an existing DB row */
  const [savedDatesHint, setSavedDatesHint] = useState(null);

  const load = useCallback(
    (options = {}) => {
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

      return authFetch(`/api/admin/blog-posts?${params}`)
        .then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) {
            const code = data.error || `http_${r.status}`;
            throw new Error(code);
          }
          return data;
        })
        .then((data) => {
          const rows = data.posts || [];
          let tot = Number(data.total);
          if (!Number.isFinite(tot)) tot = rows.length;
          const maxPage = Math.max(1, Math.ceil(tot / PAGE_SIZE));
          setList(rows);
          setTotal(tot);
          setPage((p) => Math.min(p, maxPage));
        })
        .catch((e) => {
          if (!silent) setError(String(e.message || "request_failed"));
        })
        .finally(() => {
          if (!silent) setLoading(false);
        });
    },
    [page, q, sort],
  );

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applySearch() {
    setQ(qDraft);
    setPage(1);
  }

  function clearFilters() {
    setQDraft("");
    setQ("");
    setSort("date_desc");
    setPage(1);
  }

  function openAdd() {
    setError(null);
    setEditingId(null);
    setSavedDatesHint(null);
    setForm({ ...emptyForm });
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openEdit(row) {
    setError(null);
    setEditingId(row.id);
    const sm = scheduleModeFromRow(row);
    setSavedDatesHint({
      published: row.date_published ? String(row.date_published).slice(0, 10) : "",
      modified: row.date_modified ? String(row.date_modified).slice(0, 10) : "",
    });
    setForm({
      slug: row.slug ?? "",
      category_en: row.category_en ?? "",
      category_bn: row.category_bn ?? "",
      title_en: row.title_en ?? "",
      title_bn: row.title_bn ?? "",
      excerpt_en: row.excerpt_en ?? "",
      excerpt_bn: row.excerpt_bn ?? "",
      keywords_en: row.keywords_en ?? "",
      keywords_bn: row.keywords_bn ?? "",
      body_en: toEditorHtml(row.body_en ?? ""),
      body_bn: toEditorHtml(row.body_bn ?? ""),
      author: row.author ?? "CartNexus Editorial",
      read_time_min: row.read_time_min ?? 5,
      image_url: row.image_url != null ? String(row.image_url) : "",
      schedule_mode: sm,
      scheduled_date: sm === "scheduled" ? String(row.date_published ?? "").slice(0, 10) : "",
      is_featured: !!row.is_featured,
    });
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openDuplicateFromStatic(post) {
    setError(null);
    setEditingId(null);
    setSavedDatesHint(null);
    setForm({
      ...emptyForm,
      slug: `${post.slug}-draft`,
      category_en: post.category.en,
      category_bn: post.category.bn,
      title_en: post.title.en,
      title_bn: post.title.bn,
      excerpt_en: post.excerpt.en,
      excerpt_bn: post.excerpt.bn,
      keywords_en: post.keywords.en,
      keywords_bn: post.keywords.bn,
      body_en: toEditorHtml(post.body.en),
      body_bn: toEditorHtml(post.body.bn),
      author: post.author,
      read_time_min: post.readTimeMin,
      image_url: "",
      schedule_mode: "draft",
      scheduled_date: "",
      is_featured: false,
    });
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setSavedDatesHint(null);
    setForm(emptyForm);
  }

  async function submitForm(e) {
    e.preventDefault();
    if (form.schedule_mode === "scheduled" && !String(form.scheduled_date || "").trim()) {
      setError("invalid_scheduled_date");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim() || slugify(form.title_en),
        category_en: form.category_en.trim(),
        category_bn: form.category_bn.trim(),
        title_en: form.title_en.trim(),
        title_bn: form.title_bn.trim(),
        excerpt_en: form.excerpt_en.trim(),
        excerpt_bn: form.excerpt_bn.trim(),
        keywords_en: form.keywords_en.trim(),
        keywords_bn: form.keywords_bn.trim(),
        body_en: form.body_en,
        body_bn: form.body_bn,
        author: form.author.trim() || "CartNexus Editorial",
        read_time_min: Number(form.read_time_min) || estimateReadMinutesLocal(form.body_en, form.body_bn),
        gradient: DEFAULT_BLOG_GRADIENT,
        image_url: form.image_url.trim(),
        schedule_mode: form.schedule_mode,
        ...(form.schedule_mode === "scheduled" ? { scheduled_date: form.scheduled_date.trim() } : {}),
        is_featured: form.is_featured,
      };

      if (editingId) {
        const r = await authFetch(`/api/admin/blog-posts/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data.error || "save");
          return;
        }
      } else {
        const r = await authFetch(`/api/admin/blog-posts`, {
          method: "POST",
          body: JSON.stringify(payload),
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
    const r = await authFetch(`/api/admin/blog-posts/${id}`, { method: "DELETE" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "delete");
      return;
    }
    if (Number(editingId) === Number(id)) closeModal();
    load();
  }

  async function onImageFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setImageUploading(true);
    try {
      const url = await uploadCatalogCoverImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err?.message || "upload");
    } finally {
      setImageUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.nav.blog")}</h1>
          <p className="mt-2 max-w-3xl text-slate-400">{t("admin.blog.hint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("admin.blog.newPost")}
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

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.blog.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.blog.searchPh")}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 lg:justify-between">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 lg:max-w-md">
          <span className="text-xs text-slate-500">{t("admin.blog.sort")}</span>
          <PortalSelect
            value={sort}
            onChange={(v) => {
              setSort(String(v));
              setPage(1);
            }}
            options={[
              { value: "date_desc", label: t("admin.blog.sortDateDesc") },
              { value: "date_asc", label: t("admin.blog.sortDateAsc") },
              { value: "title_en_asc", label: t("admin.blog.sortTitleAsc") },
              { value: "title_en_desc", label: t("admin.blog.sortTitleDesc") },
              { value: "id_desc", label: t("admin.blog.sortIdDesc") },
            ]}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applySearch}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            {t("admin.ordersApplySearch")}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            {t("admin.ordersClearFilters")}
          </button>
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold text-white">{t("admin.blog.dbSection")}</h2>
      <p className="mt-1 max-w-3xl text-xs text-slate-500">{t("admin.blog.dbSectionHint")}</p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("admin.crud.slug")}</th>
              <th className="px-4 py-3">{t("admin.blog.colTitle")}</th>
              <th className="px-4 py-3">{t("admin.blog.colPublished")}</th>
              <th className="px-4 py-3">{t("admin.blog.colFeatured")}</th>
              <th className="px-4 py-3">{t("admin.blog.colDate")}</th>
              <th className="px-4 py-3">{t("admin.crud.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {t("shop.loading")}
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03]">
                  <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-slate-400">{row.slug}</td>
                  <td className="max-w-[280px] px-4 py-3">
                    <span className="line-clamp-2 font-medium text-white">{row.title_en}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.is_published ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                        {t("admin.blog.yes")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-600/40 px-2 py-0.5 text-xs text-slate-400">
                        {t("admin.blog.no")}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.is_featured ? (
                      <span className="rounded-full bg-brand-500/25 px-2 py-0.5 text-xs text-brand-200">
                        {t("admin.blog.featuredYes")}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <span className="whitespace-nowrap">{row.date_published || "—"}</span>
                    {row.is_published &&
                    row.date_published &&
                    String(row.date_published).slice(0, 10) > todayIsoDate() ? (
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-amber-300/90">
                        {t("admin.blog.badgeScheduled")}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <Link
                        to={`/blog/${encodeURIComponent(row.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/15"
                        title={t("admin.blog.viewLive")}
                        aria-label={t("admin.blog.viewLive")}
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
          <p className="px-4 py-8 text-center text-slate-500">{t("admin.blog.empty")}</p>
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

      <div className="mt-14 border-t border-white/10 pt-12">
        <h2 className="font-display text-lg font-semibold text-white">{t("admin.blog.builtinTitle")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">{t("admin.blog.builtinHint")}</p>
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-black/40 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("admin.crud.slug")}</th>
                <th className="px-4 py-3">{t("admin.blog.colTitle")}</th>
                <th className="px-4 py-3">{t("admin.blog.colDate")}</th>
                <th className="px-4 py-3">{t("admin.crud.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {BLOG_POSTS.map((post) => (
                <tr key={post.slug} className="hover:bg-white/[0.03]">
                  <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-slate-400">{post.slug}</td>
                  <td className="max-w-[280px] px-4 py-3">
                    <span className="mr-2 inline-flex rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-200">
                      {t("admin.blog.badgeBuiltin")}
                    </span>
                    <span className="line-clamp-2 font-medium text-white">{post.title.en}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{post.datePublished}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link
                        to={`/blog/${encodeURIComponent(post.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/15"
                        title={t("admin.blog.viewLive")}
                        aria-label={t("admin.blog.viewLive")}
                      >
                        <IconEye />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openDuplicateFromStatic(post)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                      >
                        {t("admin.blog.importToDb")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="flex min-h-0 max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
            role="dialog"
            aria-labelledby="admin-blog-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-white/10 px-6 py-4">
              <h2 id="admin-blog-modal-title" className="font-display text-lg font-semibold text-white">
                {editingId ? t("admin.blog.editPost") : t("admin.blog.newPost")}
              </h2>
            </div>
            <form onSubmit={submitForm} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.crud.slug")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder={t("admin.blog.slugPh")}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.titleEn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.title_en}
                    onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.titleBn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.title_bn}
                    onChange={(e) => setForm((f) => ({ ...f, title_bn: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.categoryEn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.category_en}
                    onChange={(e) => setForm((f) => ({ ...f, category_en: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.categoryBn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.category_bn}
                    onChange={(e) => setForm((f) => ({ ...f, category_bn: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.excerptEn")}</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.excerpt_en}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.excerptBn")}</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.excerpt_bn}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt_bn: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.keywordsEn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.keywords_en}
                    onChange={(e) => setForm((f) => ({ ...f, keywords_en: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.keywordsBn")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.keywords_bn}
                    onChange={(e) => setForm((f) => ({ ...f, keywords_bn: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.bodyEn")}</label>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t("admin.blog.richEditorHint")}</p>
                  <div className="mt-2">
                    <BlogRichTextEditor
                      key={`${editingId ?? "new"}-${modalKey}-en`}
                      initialHtml={form.body_en}
                      onChange={(html) => setForm((f) => ({ ...f, body_en: html }))}
                      placeholder={t("admin.blog.editorPlaceholder")}
                      disabled={saving}
                      uploadLabel={t("admin.blog.insertImage")}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.bodyBn")}</label>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t("admin.blog.richEditorHint")}</p>
                  <div className="mt-2">
                    <BlogRichTextEditor
                      key={`${editingId ?? "new"}-${modalKey}-bn`}
                      initialHtml={form.body_bn}
                      onChange={(html) => setForm((f) => ({ ...f, body_bn: html }))}
                      placeholder={t("admin.blog.editorPlaceholder")}
                      disabled={saving}
                      uploadLabel={t("admin.blog.insertImage")}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.author")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t("admin.blog.readTime")}</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-24 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                      value={form.read_time_min}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, read_time_min: Number(e.target.value) || 1 }))
                      }
                    />
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          read_time_min: estimateReadMinutesLocal(f.body_en, f.body_bn),
                        }))
                      }
                    >
                      {t("admin.blog.estimateRead")}
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">{t("admin.blog.coverField")}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://…"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">{t("admin.blog.coverHint")}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{t("admin.crud.imageUploadNote")}</p>
                  <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={imageUploading || saving}
                      onChange={onImageFileSelected}
                    />
                    {imageUploading ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
                  </label>
                  {form.image_url.trim() ? (
                    <div className="mt-3 max-h-40 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={resolvePublicAssetUrl(form.image_url.trim())}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("admin.blog.publication")}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{t("admin.blog.datesAutoHint")}</p>
                  {savedDatesHint ? (
                    <p className="mt-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-slate-400">
                      {t("admin.blog.savedDatesHint", {
                        published: savedDatesHint.published || "—",
                        modified: savedDatesHint.modified || "—",
                      })}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`schedule-${modalKey}`}
                        className="h-4 w-4 border-white/20 bg-black/40"
                        checked={form.schedule_mode === "draft"}
                        onChange={() =>
                          setForm((f) => ({ ...f, schedule_mode: "draft", scheduled_date: "", is_featured: false }))
                        }
                      />
                      <span className="text-sm text-slate-300">{t("admin.blog.scheduleDraft")}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`schedule-${modalKey}`}
                        className="h-4 w-4 border-white/20 bg-black/40"
                        checked={form.schedule_mode === "publish_now"}
                        onChange={() => setForm((f) => ({ ...f, schedule_mode: "publish_now" }))}
                      />
                      <span className="text-sm text-slate-300">{t("admin.blog.schedulePublishNow")}</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name={`schedule-${modalKey}`}
                        className="mt-1 h-4 w-4 border-white/20 bg-black/40"
                        checked={form.schedule_mode === "scheduled"}
                        onChange={() => setForm((f) => ({ ...f, schedule_mode: "scheduled" }))}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="text-sm text-slate-300">{t("admin.blog.scheduleLater")}</span>
                        {form.schedule_mode === "scheduled" ? (
                          <input
                            type="date"
                            required
                            min={todayIsoDate()}
                            className="max-w-[220px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                            value={form.scheduled_date}
                            onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                          />
                        ) : null}
                      </span>
                    </label>
                  </div>
                </div>
                <label
                  className={`flex cursor-pointer items-start gap-2 sm:col-span-2 ${form.schedule_mode === "draft" ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40"
                    checked={form.schedule_mode === "draft" ? false : form.is_featured}
                    disabled={form.schedule_mode === "draft"}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  />
                  <span>
                    <span className="block text-sm text-slate-300">{t("admin.blog.featuredPost")}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{t("admin.blog.featuredPostHint")}</span>
                  </span>
                </label>
              </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/10 bg-slate-950 px-6 py-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                >
                  {saving ? t("shop.loading") : editingId ? t("admin.crud.save") : t("admin.blog.create")}
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
