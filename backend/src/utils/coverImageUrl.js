/** Optional catalog cover (category/brand): remote URL or same-origin `/uploads/...`. */
export function normalizeCoverImageUrl(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return s.length > 512 ? s.slice(0, 512) : s;
}
