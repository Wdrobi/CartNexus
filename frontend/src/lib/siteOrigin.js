/** Base URL for canonical and Open Graph (set VITE_SITE_URL in production, e.g. https://yoursite.com). */
export function siteOrigin() {
  const env = import.meta.env.VITE_SITE_URL;
  if (env && typeof env === "string") return env.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}
