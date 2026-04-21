/**
 * WhatsApp deep link. Priority: admin store settings → env (`VITE_WHATSAPP_NUMBER`).
 * Digits: country code + number, no spaces (e.g. 8801712345678).
 */

export function buildWhatsAppUrl(digits, prefill) {
  const d = String(digits ?? "").replace(/\D/g, "");
  if (d.length < 8) return null;
  const base = `https://wa.me/${d}`;
  const msg = prefill != null ? String(prefill).trim() : "";
  if (msg) {
    return `${base}?text=${encodeURIComponent(msg)}`;
  }
  return base;
}

/** Env-only fallback when DB settings are empty. */
export function getWhatsAppChatUrl() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER?.trim?.() ?? "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length < 10) return null;

  const msg = import.meta.env.VITE_WHATSAPP_PREFILL?.trim?.() ?? "";
  return buildWhatsAppUrl(digits, msg || undefined);
}

/** Prefer `store_settings` from API; then `.env` fallback. */
export function resolveWhatsAppUrl(settings) {
  const fromDb =
    settings?.whatsappDigits != null && String(settings.whatsappDigits).replace(/\D/g, "").length >= 8
      ? buildWhatsAppUrl(settings.whatsappDigits, settings.whatsappPrefill)
      : null;
  if (fromDb) return fromDb;
  return getWhatsAppChatUrl();
}
