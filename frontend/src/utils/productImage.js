/** Primary product placeholder (reliable Unsplash). */
export const PRODUCT_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80";

/** Secondary fallback if primary CDN fails (different asset). */
export const PRODUCT_IMAGE_FALLBACK_ALT =
  "https://images.unsplash.com/photo-1562157873-818bc0856db6?auto=format&fit=crop&w=800&q=80";

/** Tertiary — another Unsplash asset (some regions block individual IDs). */
export const PRODUCT_IMAGE_FALLBACK_3 =
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80";

/** Same-origin file — always loads when remote CDNs fail. */
export const LOCAL_PLACEHOLDER_PRODUCT = "/images/placeholder-product.svg";

/** Hero / banner / auth — wide retail shot. */
export const WIDE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

const CATEGORY_FALLBACKS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
];

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Sanitize remote/local image URL: https upgrade, block unsafe schemes.
 * Returns null if unusable.
 */
export function normalizeImageUrl(url) {
  if (typeof url !== "string") return null;
  let t = url.trim();
  if (!t) return null;
  if (/^javascript:/i.test(t) || /^vbscript:/i.test(t)) return null;
  if (t.startsWith("//")) t = `https:${t}`;
  else if (t.startsWith("http://")) t = `https://${t.slice(7)}`;
  if (t.startsWith("/")) return t;
  if (t.startsWith("data:image")) return t;
  if (!/^https?:\/\//i.test(t)) return null;
  return t;
}

/** Deterministic placeholder image per id/slug when product URL is broken (picsum). */
export function picsumSeedUrl(seed) {
  if (seed == null || seed === "") return null;
  const s = encodeURIComponent(String(seed));
  return `https://picsum.photos/seed/cn-${s}/800/1000`;
}

/** Resolved image URL for product cards (never empty). */
export function productImageUrl(product) {
  if (!product) return PRODUCT_IMAGE_FALLBACK;
  const u = normalizeImageUrl(str(product.image_url ?? product.imageUrl));
  return u || PRODUCT_IMAGE_FALLBACK;
}

/** Category tile: API cover, or stable fallback by slug. */
export function categoryCoverUrl(category) {
  if (!category) return CATEGORY_FALLBACKS[0];
  const u = normalizeImageUrl(str(category.cover_image ?? category.coverImage));
  if (u) return u;
  const slug = str(category.slug) || "x";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * (i + 1)) % 997;
  return CATEGORY_FALLBACKS[Math.abs(h) % CATEGORY_FALLBACKS.length];
}

/** Brand tile — same idea as categories. */
export function brandCoverUrl(brand) {
  if (!brand) return CATEGORY_FALLBACKS[0];
  const u = normalizeImageUrl(str(brand.cover_image ?? brand.coverImage));
  if (u) return u;
  const slug = str(brand.slug) || "x";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * (i + 1)) % 997;
  return CATEGORY_FALLBACKS[(Math.abs(h) + 1) % CATEGORY_FALLBACKS.length];
}
