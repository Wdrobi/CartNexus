import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";
import { authFetch } from "../../api/authFetch.js";
import { uploadCatalogCoverImage } from "../../api/catalogCoverUpload.js";
import { translateAdminError } from "../../utils/adminApiError.js";

const empty = {
  headline_en: "",
  headline_bn: "",
  subtext_en: "",
  subtext_bn: "",
  cta_label_en: "",
  cta_label_bn: "",
  cta_url: "/shop",
  image_1_url: "",
  image_2_url: "",
  gradient_from: "#581c87",
  gradient_to: "#be185d",
};

export default function AdminHomeHero() {
  const { t } = useTranslation();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);
  const [image1Uploading, setImage1Uploading] = useState(false);
  const [image2Uploading, setImage2Uploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/admin/home-hero")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || String(r.status));
        const h = data.hero;
        if (!h) throw new Error("no_hero");
        setForm({
          headline_en: h.headline_en ?? "",
          headline_bn: h.headline_bn ?? "",
          subtext_en: h.subtext_en ?? "",
          subtext_bn: h.subtext_bn ?? "",
          cta_label_en: h.cta_label_en ?? "",
          cta_label_bn: h.cta_label_bn ?? "",
          cta_url: h.cta_url ?? "/shop",
          image_1_url: h.image_1_url ?? "",
          image_2_url: h.image_2_url ?? "",
          gradient_from: h.gradient_from ?? "#581c87",
          gradient_to: h.gradient_to ?? "#be185d",
        });
      })
      .catch((e) => setError(typeof e.message === "string" ? e.message : "load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onBannerImageFile(slot, e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (slot === 1) setImage1Uploading(true);
    else setImage2Uploading(true);
    try {
      const url = await uploadCatalogCoverImage(file);
      if (slot === 1) {
        setForm((f) => ({ ...f, image_1_url: url }));
      } else {
        setForm((f) => ({ ...f, image_2_url: url }));
      }
    } catch (err) {
      setError(err?.message || "upload");
    } finally {
      if (slot === 1) setImage1Uploading(false);
      else setImage2Uploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const body = {
      headline_en: form.headline_en,
      headline_bn: form.headline_bn,
      subtext_en: form.subtext_en,
      subtext_bn: form.subtext_bn,
      cta_label_en: form.cta_label_en,
      cta_label_bn: form.cta_label_bn,
      cta_url: form.cta_url,
      image_1_url: form.image_1_url.trim(),
      image_2_url: form.image_2_url.trim(),
      gradient_from: form.gradient_from,
      gradient_to: form.gradient_to,
    };
    const r = await authFetch("/api/admin/home-hero", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "save");
      setSaving(false);
      return;
    }
    if (data.hero) {
      setForm({
        headline_en: data.hero.headline_en ?? "",
        headline_bn: data.hero.headline_bn ?? "",
        subtext_en: data.hero.subtext_en ?? "",
        subtext_bn: data.hero.subtext_bn ?? "",
        cta_label_en: data.hero.cta_label_en ?? "",
        cta_label_bn: data.hero.cta_label_bn ?? "",
        cta_url: data.hero.cta_url ?? "/shop",
        image_1_url: data.hero.image_1_url ?? "",
        image_2_url: data.hero.image_2_url ?? "",
        gradient_from: data.hero.gradient_from ?? "#581c87",
        gradient_to: data.hero.gradient_to ?? "#be185d",
      });
    }
    setSavedOk(true);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-slate-400">{t("shop.loading")}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">{t("admin.homeHero.title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">{t("admin.homeHero.hint")}</p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {translateAdminError(t, error) || error}
        </p>
      )}
      {savedOk && !error && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
          {t("admin.homeHero.saved")}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 max-w-3xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.headlineEn")}</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.headline_en}
              onChange={(e) => setForm((f) => ({ ...f, headline_en: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.headlineBn")}</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.headline_bn}
              onChange={(e) => setForm((f) => ({ ...f, headline_bn: e.target.value }))}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.subtextEn")}</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.subtext_en}
              onChange={(e) => setForm((f) => ({ ...f, subtext_en: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.subtextBn")}</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.subtext_bn}
              onChange={(e) => setForm((f) => ({ ...f, subtext_bn: e.target.value }))}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.ctaEn")}</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.cta_label_en}
              onChange={(e) => setForm((f) => ({ ...f, cta_label_en: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.ctaBn")}</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.cta_label_bn}
              onChange={(e) => setForm((f) => ({ ...f, cta_label_bn: e.target.value }))}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-300">{t("admin.homeHero.ctaUrl")}</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
            value={form.cta_url}
            onChange={(e) => setForm((f) => ({ ...f, cta_url: e.target.value }))}
            placeholder="/shop"
          />
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="block text-sm font-medium text-slate-300">{t("admin.homeHero.image1")}</span>
            <p className="text-[11px] leading-relaxed text-slate-400">{t("admin.crud.imageUploadNote")}</p>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.image_1_url}
              onChange={(e) => setForm((f) => ({ ...f, image_1_url: e.target.value }))}
              placeholder="https://… or /uploads/…"
            />
            <label className="inline-flex cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={saving || image1Uploading}
                onChange={(e) => onBannerImageFile(1, e)}
              />
              {image1Uploading ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
            </label>
            {form.image_1_url.trim() ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                <img
                  src={resolvePublicAssetUrl(form.image_1_url.trim())}
                  alt=""
                  className="max-h-40 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="block text-sm font-medium text-slate-300">{t("admin.homeHero.image2")}</span>
            <p className="text-[11px] leading-relaxed text-slate-400">{t("admin.crud.imageUploadNote")}</p>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-white"
              value={form.image_2_url}
              onChange={(e) => setForm((f) => ({ ...f, image_2_url: e.target.value }))}
              placeholder="https://… or /uploads/…"
            />
            <label className="inline-flex cursor-pointer rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={saving || image2Uploading}
                onChange={(e) => onBannerImageFile(2, e)}
              />
              {image2Uploading ? t("shop.loading") : t("admin.crud.catalogCoverUpload")}
            </label>
            {form.image_2_url.trim() ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                <img
                  src={resolvePublicAssetUrl(form.image_2_url.trim())}
                  alt=""
                  className="max-h-40 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.gradientFrom")}</span>
            <input
              type="color"
              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-ink-900"
              value={/^#[0-9A-Fa-f]{6}$/i.test(form.gradient_from) ? form.gradient_from : "#581c87"}
              onChange={(e) => setForm((f) => ({ ...f, gradient_from: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">{t("admin.homeHero.gradientTo")}</span>
            <input
              type="color"
              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-ink-900"
              value={/^#[0-9A-Fa-f]{6}$/i.test(form.gradient_to) ? form.gradient_to : "#be185d"}
              onChange={(e) => setForm((f) => ({ ...f, gradient_to: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          {saving ? t("account.profile.saving") : t("admin.crud.save")}
        </button>
      </form>
    </div>
  );
}
