import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../../api/authFetch.js";
import { useStoreSettings } from "../../context/StoreSettingsContext.jsx";
import { translateAdminError } from "../../utils/adminApiError.js";

const empty = {
  contactAddressEn: "",
  contactAddressBn: "",
  contactPhone: "",
  contactEmail: "",
  businessHoursEn: "",
  businessHoursBn: "",
  socialFacebookUrl: "",
  socialInstagramUrl: "",
  socialYoutubeUrl: "",
  socialOtherUrl: "",
  mapEmbedUrl: "",
  mapExternalUrl: "",
  whatsappDigits: "",
  whatsappPrefill: "",
  messengerUrl: "",
};

export default function AdminStoreSettings() {
  const { t } = useTranslation();
  const { refresh: refreshPublic } = useStoreSettings();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/admin/store-settings")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = translateAdminError(t, data?.error) || String(r.status);
          throw new Error(msg);
        }
        const s = data.settings;
        if (!s) throw new Error("no_settings");
        setForm({
          contactAddressEn: s.contactAddressEn ?? "",
          contactAddressBn: s.contactAddressBn ?? "",
          contactPhone: s.contactPhone ?? "",
          contactEmail: s.contactEmail ?? "",
          businessHoursEn: s.businessHoursEn ?? "",
          businessHoursBn: s.businessHoursBn ?? "",
          socialFacebookUrl: s.socialFacebookUrl ?? "",
          socialInstagramUrl: s.socialInstagramUrl ?? "",
          socialYoutubeUrl: s.socialYoutubeUrl ?? "",
          socialOtherUrl: s.socialOtherUrl ?? "",
          mapEmbedUrl: s.mapEmbedUrl ?? "",
          mapExternalUrl: s.mapExternalUrl ?? "",
          whatsappDigits: s.whatsappDigits ?? "",
          whatsappPrefill: s.whatsappPrefill ?? "",
          messengerUrl: s.messengerUrl ?? "",
        });
      })
      .catch((e) => setError(e.message || "load"))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  function field(id, label, hint, opts = {}) {
    const multiline = opts.multiline === true;
    const rows = opts.rows ?? 4;
    return (
      <div className={opts.className ?? ""}>
        <label htmlFor={`ss-${id}`} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        {multiline ? (
          <textarea
            id={`ss-${id}`}
            value={form[id]}
            onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
            rows={rows}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1222] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-brand-500/50"
            placeholder={opts.placeholder}
          />
        ) : (
          <input
            id={`ss-${id}`}
            type={opts.type || "text"}
            value={form[id]}
            onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c1222] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-brand-500/50"
            placeholder={opts.placeholder}
          />
        )}
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const r = await authFetch("/api/admin/store-settings", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = translateAdminError(t, data?.error) || t("admin.storeSettings.saveError");
        throw new Error(msg);
      }
      if (data.settings) {
        const s = data.settings;
        setForm({
          contactAddressEn: s.contactAddressEn ?? "",
          contactAddressBn: s.contactAddressBn ?? "",
          contactPhone: s.contactPhone ?? "",
          contactEmail: s.contactEmail ?? "",
          businessHoursEn: s.businessHoursEn ?? "",
          businessHoursBn: s.businessHoursBn ?? "",
          socialFacebookUrl: s.socialFacebookUrl ?? "",
          socialInstagramUrl: s.socialInstagramUrl ?? "",
          socialYoutubeUrl: s.socialYoutubeUrl ?? "",
          socialOtherUrl: s.socialOtherUrl ?? "",
          mapEmbedUrl: s.mapEmbedUrl ?? "",
          mapExternalUrl: s.mapExternalUrl ?? "",
          whatsappDigits: s.whatsappDigits ?? "",
          whatsappPrefill: s.whatsappPrefill ?? "",
          messengerUrl: s.messengerUrl ?? "",
        });
      }
      await refreshPublic();
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      setError(err.message || t("admin.storeSettings.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.storeSettings.title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-400">{t("admin.storeSettings.intro")}</p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}
      {savedOk && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          {t("admin.storeSettings.saved")}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">{t("admin.storeSettings.loading")}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-10">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.storeSettings.sectionContact")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {field("contactAddressEn", t("admin.storeSettings.addressEn"), t("admin.storeSettings.addressHint"), {
                multiline: true,
                rows: 5,
              })}
              {field("contactAddressBn", t("admin.storeSettings.addressBn"), t("admin.storeSettings.addressHint"), {
                multiline: true,
                rows: 5,
              })}
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {field("contactPhone", t("admin.storeSettings.phone"), t("admin.storeSettings.phoneHint"))}
              {field("contactEmail", t("admin.storeSettings.email"), "", { type: "email" })}
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {field("businessHoursEn", t("admin.storeSettings.hoursEn"), t("admin.storeSettings.hoursHint"), {
                multiline: true,
                rows: 4,
              })}
              {field("businessHoursBn", t("admin.storeSettings.hoursBn"), t("admin.storeSettings.hoursHint"), {
                multiline: true,
                rows: 4,
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.storeSettings.sectionChat")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("admin.storeSettings.sectionChatHint")}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {field("whatsappDigits", t("admin.storeSettings.whatsappDigits"), t("admin.storeSettings.whatsappDigitsHint"))}
              {field("whatsappPrefill", t("admin.storeSettings.whatsappPrefill"), t("admin.storeSettings.whatsappPrefillHint"))}
            </div>
            <div className="mt-6">
              {field("messengerUrl", t("admin.storeSettings.messengerUrl"), t("admin.storeSettings.messengerUrlHint"))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.storeSettings.sectionSocial")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {field("socialFacebookUrl", t("admin.storeSettings.socialFacebook"), "")}
              {field("socialInstagramUrl", t("admin.storeSettings.socialInstagram"), "")}
              {field("socialYoutubeUrl", t("admin.storeSettings.socialYoutube"), "")}
              {field("socialOtherUrl", t("admin.storeSettings.socialOther"), t("admin.storeSettings.socialOtherHint"))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.storeSettings.sectionMap")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("admin.storeSettings.sectionMapHint")}</p>
            <div className="mt-6 space-y-6">
              {field("mapEmbedUrl", t("admin.storeSettings.mapEmbedUrl"), t("admin.storeSettings.mapEmbedHint"), {
                multiline: true,
                rows: 3,
              })}
              {field("mapExternalUrl", t("admin.storeSettings.mapExternalUrl"), t("admin.storeSettings.mapExternalHint"))}
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? t("admin.storeSettings.saving") : t("admin.storeSettings.save")}
          </button>
        </form>
      )}
    </div>
  );
}
