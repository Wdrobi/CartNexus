/**
 * Optional absolute API origin (no trailing slash), e.g. http://localhost:5000
 * when the SPA is served without a dev proxy to the backend.
 */
const raw = import.meta.env.VITE_API_URL?.trim();
const API_BASE = raw ? raw.replace(/\/$/, "") : "";

export function resolveApiUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export function apiFetch(path, init) {
  return fetch(resolveApiUrl(path), init);
}

/** Avatar and other files served from API `/uploads/...` — works with Vite proxy in dev. */
export function resolvePublicAssetUrl(url) {
  if (url == null || url === "") return url;
  const u = String(url).trim();
  if (/^https?:\/\//i.test(u)) return u;
  return resolveApiUrl(u.startsWith("/") ? u : `/${u}`);
}
