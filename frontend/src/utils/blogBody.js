/** Detect TipTap / rich HTML vs legacy plain text (paragraphs separated by blank lines). */
export function isProbablyHtml(s) {
  const t = String(s ?? "").trim();
  if (!t) return false;
  if (t.startsWith("<")) return true;
  return /<(p|div|br|span|img|figure|ul|ol|li|h[1-6]|blockquote)\b/i.test(t);
}

export function stripHtmlTags(s) {
  return String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtmlText(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert legacy plain blog body to minimal HTML for TipTap. */
export function plainTextToBlogHtml(text) {
  const s = String(text ?? "").trim();
  if (!s) return "";
  return s
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtmlText(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/** Normalize stored body for editor: leave HTML as-is; wrap plain text as paragraphs. */
export function toEditorHtml(raw) {
  const s = String(raw ?? "");
  if (!s.trim()) return "";
  if (isProbablyHtml(s)) return s;
  return plainTextToBlogHtml(s);
}

/** Plain preview line for cards (no HTML noise). */
export function previewPlainFromBody(htmlOrPlain, maxLen = 220) {
  const plain = stripHtmlTags(htmlOrPlain);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, Math.max(0, maxLen - 1))}…`;
}
