/**
 * WhatsApp deep link for web. Set `VITE_WHATSAPP_NUMBER` to digits only (country code + number),
 * e.g. Bangladesh mobile: 8801712345678 — no spaces or leading +.
 *
 * Optional: `VITE_WHATSAPP_PREFILL` — prefilled chat message (URL-encoded automatically).
 */

export function getWhatsAppChatUrl() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER?.trim?.() ?? "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length < 10) return null;

  const msg = import.meta.env.VITE_WHATSAPP_PREFILL?.trim?.() ?? "";
  const base = `https://wa.me/${digits}`;
  if (msg) {
    return `${base}?text=${encodeURIComponent(msg)}`;
  }
  return base;
}
