import { authFetch } from "./authFetch.js";

/** Admin-only: multipart upload → `{ url: "/uploads/catalog/..." }`. */
export async function uploadCatalogCoverImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await authFetch("/api/admin/catalog-cover", { method: "POST", body: fd });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || String(r.status));
  if (!data.url) throw new Error("upload");
  return String(data.url);
}
