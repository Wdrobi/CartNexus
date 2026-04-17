/**
 * WebSocket URL for admin dashboard (same host as API in dev via Vite proxy).
 * @param {string} token JWT (admin)
 */
export function getAdminDashboardWsUrl(token) {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (raw) {
    const u = new URL(raw.replace(/\/$/, ""));
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/ws/admin";
    u.search = "";
    u.hash = "";
    const base = u.toString().replace(/\/$/, "");
    return `${base}?token=${encodeURIComponent(token)}`;
  }
  const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:5173";
  return `${proto}//${host}/ws/admin?token=${encodeURIComponent(token)}`;
}
