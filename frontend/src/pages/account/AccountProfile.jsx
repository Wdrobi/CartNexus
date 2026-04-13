import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import AuthPasswordField from "../../components/customer/AuthPasswordField.jsx";
import AvatarCropModal from "../../components/account/AvatarCropModal.jsx";
import SafeImage from "../../components/SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK_ALT } from "../../utils/productImage.js";
import { userInitials } from "../../utils/userDisplay.js";

function IconMail({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeLinejoin="round" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  );
}

function IconCamera({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9a2 2 0 012-2Z" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M8.5 4.5h2l1.5 4.5-2 1a8 8 0 004 4l1-2 4.5 1.5v2a2 2 0 01-2 2A18 18 0 013 8.5a2 2 0 012-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PasswordStrength({ password, t }) {
  const ok = password.length >= 8;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-1.5 flex-1 max-w-[120px] rounded-full transition ${ok ? "bg-emerald-500/80" : "bg-white/10"}`} />
      <span className={ok ? "text-emerald-400/95" : "text-slate-500"}>
        {ok ? t("account.profile.strengthOk") : t("account.profile.strengthHint")}
      </span>
    </div>
  );
}

export default function AccountProfile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [uploadErr, setUploadErr] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone != null ? String(user.phone) : "");
      setAvatarUrl(user.avatar_url != null ? String(user.avatar_url) : "");
    }
  }, [user]);

  useEffect(() => {
    setProfileMsg(null);
    setProfileErr(null);
  }, [name, email, phone, avatarUrl]);

  useEffect(() => {
    setPwMsg(null);
    setPwErr(null);
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  function onAvatarFilePick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadErr("invalid_file_type");
      return;
    }
    setUploadErr(null);
    setProfileMsg(null);
    setCropSrc(URL.createObjectURL(file));
  }

  function closeCropModal() {
    setCropSrc(null);
  }

  async function uploadAvatarFile(file) {
    setUploadErr(null);
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await authFetch("/api/auth/profile/avatar", { method: "POST", body: fd });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "save");
      if (data.user) {
        updateUser(data.user);
        setAvatarUrl(data.user.avatar_url != null ? String(data.user.avatar_url) : "");
        setProfileMsg("saved");
      }
    } catch (e) {
      if (e && typeof e.message === "string") throw e;
      throw new Error("network");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeUploadedAvatar() {
    setUploadErr(null);
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const r = await authFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          avatar_url: null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setProfileErr(data.error || "save");
        return;
      }
      if (data.user) {
        updateUser(data.user);
        setAvatarUrl("");
      }
      setProfileMsg("saved");
    } catch {
      setProfileErr("network");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const r = await authFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setProfileErr(data.error || "save");
        return;
      }
      if (data.user) updateUser(data.user);
      setProfileMsg("saved");
    } catch {
      setProfileErr("network");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePassword(e) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwErr("password_mismatch");
      return;
    }
    if (newPassword.length < 8) {
      setPwErr("weak_password");
      return;
    }
    setSavingPassword(true);
    try {
      const r = await authFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setPwErr(data.error || "save");
        return;
      }
      if (data.user) updateUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwMsg("saved");
    } catch {
      setPwErr("network");
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = userInitials(user?.name, user?.email);

  return (
    <div className="space-y-8">
      <header className="border-b border-white/5 pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("account.profile.heading")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {t("account.profile.intro")}
        </p>
        <Link
          to="/account/addresses"
          className="group mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition hover:border-brand-500/30 hover:bg-ink-900/80"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
              <IconMapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white">{t("account.profile.addressesCta")}</p>
              <p className="text-xs text-slate-500">{t("account.profile.addressesCtaHint")}</p>
            </div>
          </div>
          <span className="shrink-0 text-brand-400 transition group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
        <div className="min-w-0 space-y-8">
          <motion.form
            onSubmit={onSaveProfile}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/50 to-ink-950/80 shadow-xl shadow-black/20"
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4 sm:px-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/25">
                <IconMail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">{t("account.profile.sectionDetails")}</h2>
                <p className="text-xs text-slate-500">{t("account.profile.sectionDetailsHint")}</p>
              </div>
            </div>

            <div className="border-b border-white/5 px-6 py-6 sm:px-8">
              <div className="flex items-start gap-3 pb-4">
                <IconCamera className="mt-0.5 h-5 w-5 shrink-0 text-brand-400/90" aria-hidden />
                <div>
                  <p className="font-medium text-white">{t("account.profile.sectionPhoto")}</p>
                  <p className="text-xs text-slate-500">{t("account.profile.sectionPhotoHint")}</p>
                </div>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex shrink-0 justify-center sm:justify-start">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 ring-2 ring-white/5">
                    {avatarUrl.trim() ? (
                      <SafeImage
                        src={resolvePublicAssetUrl(avatarUrl.trim())}
                        alt=""
                        className="h-full w-full object-cover"
                        fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-teal-900 text-2xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-500/15 px-4 py-2.5 text-sm font-semibold text-brand-200 ring-1 ring-brand-500/30 transition hover:bg-brand-500/25">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadingAvatar || savingProfile || !!cropSrc}
                        onChange={onAvatarFilePick}
                      />
                      {uploadingAvatar ? t("account.profile.uploadingAvatar") : t("account.profile.avatarUploadButton")}
                    </label>
                    {avatarUrl.trim() ? (
                      <button
                        type="button"
                        onClick={removeUploadedAvatar}
                        disabled={uploadingAvatar || savingProfile || !!cropSrc}
                        className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline disabled:opacity-50"
                      >
                        {t("account.profile.clearPhoto")}
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-600">{t("account.profile.avatarFormatsHint")}</p>
                  {uploadErr && (
                    <p className="text-xs text-amber-300/95" role="alert">
                      {t(`auth.errors.${uploadErr}`, { defaultValue: uploadErr })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
              <AnimatePresence mode="wait">
                {profileErr && (
                  <motion.div
                    key="pe"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                    role="alert"
                  >
                    {t(`auth.errors.${profileErr}`, { defaultValue: profileErr })}
                  </motion.div>
                )}
                {profileMsg === "saved" && (
                  <motion.div
                    key="ps"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                    role="status"
                  >
                    {t("account.profile.saved")}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="acc-name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("account.profile.nameLabel")}
                  </label>
                  <input
                    id="acc-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/15"
                    required
                  />
                </div>
                <div className="sm:col-span-2 border-t border-white/5 pt-6">
                  <p className="font-medium text-white">{t("account.profile.sectionContact")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t("account.profile.sectionContactHint")}</p>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="acc-email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("account.profile.emailLabel")}
                      </label>
                      <input
                        id="acc-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/15"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="acc-phone" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <IconPhone className="h-3.5 w-3.5 text-slate-500" />
                        {t("account.profile.phoneLabel")}
                      </label>
                      <input
                        id="acc-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("account.profile.phonePlaceholder")}
                        className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/15"
                      />
                      <p className="mt-1.5 text-xs text-slate-600">{t("account.profile.phoneHint")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? t("account.profile.saving") : t("account.profile.saveDetails")}
              </button>
            </div>
          </motion.form>

          <motion.form
            onSubmit={onSavePassword}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 shadow-xl shadow-black/15"
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4 sm:px-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10">
                <IconLock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">{t("account.profile.sectionPassword")}</h2>
                <p className="text-xs text-slate-500">{t("account.profile.passwordHint")}</p>
              </div>
            </div>
            <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
              <AnimatePresence mode="wait">
                {pwErr && (
                  <motion.div
                    key="pwe"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                    role="alert"
                  >
                    {t(`auth.errors.${pwErr}`, { defaultValue: pwErr })}
                  </motion.div>
                )}
                {pwMsg === "saved" && (
                  <motion.div
                    key="pws"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                    role="status"
                  >
                    {t("account.profile.passwordSaved")}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid max-w-lg gap-4">
                <AuthPasswordField
                  id="acc-current-pw"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("account.profile.currentPassword")}
                  autoComplete="current-password"
                  disabled={savingPassword}
                  ariaLabel={t("account.profile.currentPassword")}
                />
                <AuthPasswordField
                  id="acc-new-pw"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("account.profile.newPassword")}
                  autoComplete="new-password"
                  disabled={savingPassword}
                  ariaLabel={t("account.profile.newPassword")}
                />
                {newPassword.length > 0 && <PasswordStrength password={newPassword} t={t} />}
                <AuthPasswordField
                  id="acc-confirm-pw"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("account.profile.confirmPassword")}
                  autoComplete="new-password"
                  disabled={savingPassword}
                  ariaLabel={t("account.profile.confirmPassword")}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-8 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPassword ? t("account.profile.saving") : t("account.profile.savePassword")}
              </button>
            </div>
          </motion.form>
        </div>

        <aside className="xl:sticky xl:top-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/40 to-ink-950/90 p-6 text-center shadow-lg shadow-black/20 xl:text-left">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 ring-2 ring-white/5 xl:mx-0">
              {user?.avatar_url ? (
                <SafeImage
                  src={resolvePublicAssetUrl(user.avatar_url)}
                  alt=""
                  className="h-full w-full object-cover"
                  fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-teal-800 text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-white">{user?.name?.trim() || t("account.preview.unnamed")}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{user?.email}</p>
            {user?.phone && <p className="mt-2 text-sm text-slate-400">{user.phone}</p>}
            <p className="mt-4 text-xs leading-relaxed text-slate-600">{t("account.preview.asideHint")}</p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {cropSrc && (
          <motion.div
            key={cropSrc}
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AvatarCropModal
              imageSrc={cropSrc}
              onCancel={closeCropModal}
              onConfirm={uploadAvatarFile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
