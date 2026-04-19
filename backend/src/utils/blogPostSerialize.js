/** @param {unknown} v */
export function dateOnly(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function stripHtmlTags(s) {
  return String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadMinutes(bodyEn, bodyBn) {
  const text = stripHtmlTags(`${bodyEn ?? ""} ${bodyBn ?? ""}`);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Slim storefront shape for prev/next links (same language fields as full post). */
export function serializeBlogNavPost(row) {
  if (!row) return null;
  const dp = dateOnly(row.date_published);
  return {
    slug: row.slug,
    category: { en: row.category_en ?? "", bn: row.category_bn ?? "" },
    title: { en: row.title_en, bn: row.title_bn },
    excerpt: { en: row.excerpt_en ?? "", bn: row.excerpt_bn ?? "" },
    datePublished: dp,
    readTimeMin: Number(row.read_time_min) || 5,
    gradient: row.gradient || "from-slate-700 via-slate-800 to-ink-950",
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
  };
}

/** Map DB row → storefront BlogPost shape (matches frontend static posts). */
export function serializeBlogPostPublic(row) {
  const dp = dateOnly(row.date_published);
  const dm = dateOnly(row.date_modified) || dp;
  return {
    slug: row.slug,
    category: { en: row.category_en ?? "", bn: row.category_bn ?? "" },
    title: { en: row.title_en, bn: row.title_bn },
    excerpt: { en: row.excerpt_en ?? "", bn: row.excerpt_bn ?? "" },
    keywords: { en: row.keywords_en ?? "", bn: row.keywords_bn ?? "" },
    datePublished: dp,
    dateModified: dm,
    author: row.author || "CartNexus Editorial",
    readTimeMin: Number(row.read_time_min) || 5,
    gradient: row.gradient || "from-slate-700 via-slate-800 to-ink-950",
    body: { en: row.body_en, bn: row.body_bn },
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
    ...(Number(row.is_featured) === 1 ? { featured: true } : {}),
  };
}
