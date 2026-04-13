import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { getCroppedImg } from "../../utils/cropImage.js";

export default function AvatarCropModal({ imageSrc, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function apply() {
    if (!croppedAreaPixels || !imageSrc) {
      setErr("crop_incomplete");
      return;
    }
    setErr(null);
    setWorking(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, {
        maxSide: 1024,
        mime: "image/jpeg",
        quality: 0.92,
      });
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      await onConfirm(file);
      onCancel();
    } catch (e) {
      const code = e && typeof e.message === "string" ? e.message : "";
      setErr(code && code.length < 64 ? code : "crop_failed");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
      className="relative flex h-full min-h-0 w-full items-center justify-center p-4"
    >
      <button
          type="button"
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onCancel}
          aria-label={t("account.profile.cropCancel")}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-ink-900 shadow-2xl shadow-black/60"
        >
          <div className="border-b border-white/10 px-5 py-4">
            <h2 id="avatar-crop-title" className="font-display text-lg font-semibold text-white">
              {t("account.profile.cropTitle")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{t("account.profile.cropHint")}</p>
          </div>

          <div className="relative aspect-square w-full bg-ink-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="space-y-3 border-t border-white/10 px-5 py-4">
            <div>
              <label htmlFor="avatar-crop-zoom" className="text-xs font-medium text-slate-500">
                {t("account.profile.cropZoom")}
              </label>
              <input
                id="avatar-crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-2 w-full accent-brand-500"
              />
            </div>
            {err && (
              <p className="text-xs text-amber-300/95" role="alert">
                {t(`auth.errors.${err}`, { defaultValue: err })}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={working}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                {t("account.profile.cropCancel")}
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={working}
                className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:opacity-50"
              >
                {working ? t("account.profile.uploadingAvatar") : t("account.profile.cropApply")}
              </button>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
