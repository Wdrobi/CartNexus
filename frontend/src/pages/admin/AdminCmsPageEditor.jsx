import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authFetch } from "../../api/authFetch.js";
import BlogRichTextEditor from "../../components/admin/BlogRichTextEditor.jsx";
import CmsHtmlBody from "../../components/legal/CmsHtmlBody.jsx";
import { getDefaultCmsBodies, htmlHasMeaningfulText } from "../../utils/cmsDefaultHtml.js";
import { translateAdminError } from "../../utils/adminApiError.js";

const KEYS = new Set(["terms", "faqs", "privacy"]);

function publicPathFor(key) {
  if (key === "terms") return "/terms";
  if (key === "privacy") return "/privacy";
  return "/faqs";
}

export default function AdminCmsPageEditor() {
  const { pageKey: rawKey } = useParams();
  const pageKey = String(rawKey || "").trim().toLowerCase();
  const { t, i18n } = useTranslation();

  const title = useMemo(() => {
    if (pageKey === "terms") return t("admin.cmsPage.titleTerms");
    if (pageKey === "privacy") return t("admin.cmsPage.titlePrivacy");
    return t("admin.cmsPage.titleFaqs");
  }, [pageKey, t]);

  const defaultBodies = useMemo(() => getDefaultCmsBodies(pageKey, i18n), [pageKey, i18n]);

  const [tab, setTab] = useState("en");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyBn, setBodyBn] = useState("");
  const [editorTick, setEditorTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedHint, setSavedHint] = useState(false);

  const previewHtml = tab === "en" ? defaultBodies.htmlEn : defaultBodies.htmlBn;

  const load = useCallback(async () => {
    if (!KEYS.has(pageKey)) return;
    setLoading(true);
    setError(null);
    try {
      const r = await authFetch(`/api/admin/cms-pages/${encodeURIComponent(pageKey)}`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = translateAdminError(t, data?.error) || t("admin.cmsPage.loadError");
        throw new Error(msg);
      }
      const p = data.page;
      setBodyEn(p?.bodyHtmlEn ?? "");
      setBodyBn(p?.bodyHtmlBn ?? "");
      setEditorTick((k) => k + 1);
    } catch (e) {
      setError(e.message || t("admin.cmsPage.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pageKey, t]);

  useEffect(() => {
    load();
  }, [load]);

  function confirmReplaceIfNeeded(scope) {
    if (scope === "en") {
      if (!htmlHasMeaningfulText(bodyEn)) return true;
      return window.confirm(t("admin.cmsPage.confirmReplace"));
    }
    if (scope === "bn") {
      if (!htmlHasMeaningfulText(bodyBn)) return true;
      return window.confirm(t("admin.cmsPage.confirmReplace"));
    }
    if (scope === "both") {
      if (!htmlHasMeaningfulText(bodyEn) && !htmlHasMeaningfulText(bodyBn)) return true;
      return window.confirm(t("admin.cmsPage.confirmReplace"));
    }
    return true;
  }

  function loadBuiltIn(scope) {
    if (!confirmReplaceIfNeeded(scope)) return;
    const d = getDefaultCmsBodies(pageKey, i18n);
    if (scope === "en" || scope === "both") setBodyEn(d.htmlEn);
    if (scope === "bn" || scope === "both") setBodyBn(d.htmlBn);
    setEditorTick((k) => k + 1);
  }

  async function onSave() {
    if (!KEYS.has(pageKey)) return;
    setSaving(true);
    setError(null);
    setSavedHint(false);
    try {
      const r = await authFetch(`/api/admin/cms-pages/${encodeURIComponent(pageKey)}`, {
        method: "PATCH",
        body: JSON.stringify({
          body_html_en: bodyEn,
          body_html_bn: bodyBn,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = translateAdminError(t, data?.error) || t("admin.cmsPage.saveError");
        throw new Error(msg);
      }
      const p = data.page;
      setBodyEn(p?.bodyHtmlEn ?? "");
      setBodyBn(p?.bodyHtmlBn ?? "");
      setSavedHint(true);
      setTimeout(() => setSavedHint(false), 2500);
    } catch (e) {
      setError(e.message || t("admin.cmsPage.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (!KEYS.has(pageKey)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-slate-300">
        <p>{t("admin.cmsPage.invalidKey")}</p>
        <Link to="/admin" className="mt-4 inline-block text-brand-400 hover:text-brand-300">
          ← {t("admin.backSite")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">{t("admin.cmsPage.hint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={publicPathFor(pageKey)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-200"
          >
            {t("admin.cmsPage.viewLive")}
          </Link>
          <button
            type="button"
            disabled={saving || loading}
            onClick={onSave}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? t("admin.cmsPage.saving") : t("admin.cmsPage.save")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}
      {savedHint && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          {t("admin.cmsPage.saved")}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="font-display text-lg font-semibold text-white">{t("admin.cmsPage.defaultPreviewTitle")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("admin.cmsPage.defaultPreviewHint")}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => loadBuiltIn("en")}
            className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-brand-400/35 hover:bg-brand-500/10 disabled:opacity-50 sm:text-sm"
          >
            {t("admin.cmsPage.loadDefaultEn")}
          </button>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => loadBuiltIn("bn")}
            className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-brand-400/35 hover:bg-brand-500/10 disabled:opacity-50 sm:text-sm"
          >
            {t("admin.cmsPage.loadDefaultBn")}
          </button>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => loadBuiltIn("both")}
            className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-100 transition hover:bg-brand-500/20 disabled:opacity-50 sm:text-sm"
          >
            {t("admin.cmsPage.loadDefaultBoth")}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {tab === "en" ? t("admin.cmsPage.tabEn") : t("admin.cmsPage.tabBn")} · {t("admin.cmsPage.previewMatchesTab")}
        </p>

        <div className="mt-4 max-h-[min(420px,55vh)] overflow-y-auto rounded-xl border border-slate-200/20 bg-white p-4 text-slate-900">
          <CmsHtmlBody html={previewHtml} className="!text-sm [&_h2]:text-base" />
        </div>
      </section>

      <div className="mt-8 flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("en")}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === "en" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("admin.cmsPage.tabEn")}
        </button>
        <button
          type="button"
          onClick={() => setTab("bn")}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === "bn" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("admin.cmsPage.tabBn")}
        </button>
      </div>

      <div className="mt-6 min-h-[320px] rounded-2xl border border-white/10 bg-[#0c1222] p-4">
        {loading ? (
          <p className="text-sm text-slate-500">{t("admin.cmsPage.loading")}</p>
        ) : tab === "en" ? (
          <BlogRichTextEditor
            key={`en-${editorTick}`}
            initialHtml={bodyEn}
            onChange={setBodyEn}
            placeholder={t("admin.cmsPage.placeholderEn")}
            disabled={saving}
            uploadLabel={t("admin.cmsPage.uploadImage")}
          />
        ) : (
          <BlogRichTextEditor
            key={`bn-${editorTick}`}
            initialHtml={bodyBn}
            onChange={setBodyBn}
            placeholder={t("admin.cmsPage.placeholderBn")}
            disabled={saving}
            uploadLabel={t("admin.cmsPage.uploadImage")}
          />
        )}
      </div>
    </div>
  );
}
