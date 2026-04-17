/** @typedef {{ title: string, body: string }} DescriptionSection */
/** @typedef {{ sort_order: number, name_en: string, name_bn: string, image_url: string, stock: number }} ColorVariantRow */

export const PAGE_LAYOUT_VALUES = new Set([
  "clothing",
  "footwear",
  "accessories",
  "grooming",
]);

/**
 * @param {unknown} value
 * @returns {object | null}
 */
export function parseJsonColumn(value) {
  if (value == null) return null;
  if (typeof value === "object" && !Buffer.isBuffer(value)) return /** @type {object} */ (value);
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {unknown} v
 * @returns {string | null} null = invalid
 */
export function normalizePageLayout(v) {
  const s = String(v ?? "clothing").toLowerCase().trim();
  return PAGE_LAYOUT_VALUES.has(s) ? s : null;
}

/**
 * @param {unknown} input
 * @returns {{ ok: true, value: DescriptionSection[] | null } | { ok: false, error: string }}
 */
export function normalizeDescriptionSections(input) {
  if (input === null || input === undefined || input === "") {
    return { ok: true, value: null };
  }
  let arr = input;
  if (typeof input === "string") {
    try {
      arr = JSON.parse(input);
    } catch {
      return { ok: false, error: "invalid_description_sections" };
    }
  }
  if (!Array.isArray(arr)) {
    return { ok: false, error: "invalid_description_sections" };
  }
  /** @type {DescriptionSection[]} */
  const out = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const title = String(/** @type {Record<string, unknown>} */ (item).title ?? "").trim().slice(0, 200);
    const body = String(/** @type {Record<string, unknown>} */ (item).body ?? "").trim().slice(0, 8000);
    if (!title && !body) continue;
    out.push({ title, body });
  }
  return { ok: true, value: out.length ? out : null };
}

/**
 * @param {unknown} input
 * @returns {{ ok: true, value: ColorVariantRow[] } | { ok: false, error: string }}
 */
export function normalizeColorVariants(input) {
  if (input === null || input === undefined) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(input)) {
    return { ok: false, error: "invalid_color_variants" };
  }
  /** @type {ColorVariantRow[]} */
  const out = [];
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    if (!v || typeof v !== "object") continue;
    const o = /** @type {Record<string, unknown>} */ (v);
    const name_en = String(o.name_en ?? "").trim().slice(0, 64);
    const name_bn = String(o.name_bn ?? "").trim().slice(0, 64);
    const image_url = String(o.image_url ?? "").trim().slice(0, 512);
    const stock = Math.max(0, Math.floor(Number(o.stock) || 0));
    if (!name_en || !name_bn || !image_url) continue;
    out.push({
      sort_order: i,
      name_en,
      name_bn,
      image_url,
      stock,
    });
  }
  return { ok: true, value: out };
}

/**
 * @param {import("mysql2/promise").PoolConnection} conn
 * @param {number} productId
 * @param {ColorVariantRow[]} variants
 */
export async function replaceProductColorVariants(conn, productId, variants) {
  await conn.query(`DELETE FROM product_color_variants WHERE product_id = ?`, [productId]);
  for (let i = 0; i < variants.length; i++) {
    const row = variants[i];
    await conn.query(
      `INSERT INTO product_color_variants (product_id, sort_order, name_en, name_bn, image_url, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, row.sort_order ?? i, row.name_en, row.name_bn, row.image_url, row.stock]
    );
  }
}
