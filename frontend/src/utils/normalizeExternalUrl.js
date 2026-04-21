/** Ensure external links open correctly (matches backend normalizeUrl behaviour). */
export function normalizeExternalUrl(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://${s}`;
}
