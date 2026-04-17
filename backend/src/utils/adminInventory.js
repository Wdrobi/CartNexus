/**
 * Admin inventory: product + color-variant SKU rows, summary counts, manual adjustments with audit log.
 */

const DEFAULT_LOW_THRESHOLD = 5;
const MAX_PAGE_SIZE = 100;

/** Shared SKU union: variants + base-only products, with category & brand names. */
const INVENTORY_SKU_UNION_SQL = `
  SELECT
    'variant' AS kind,
    p.id AS product_id,
    v.id AS variant_id,
    p.slug,
    p.category_id,
    p.brand_id,
    p.name_en AS product_name_en,
    p.name_bn AS product_name_bn,
    v.name_en AS variant_name_en,
    v.name_bn AS variant_name_bn,
    v.stock AS stock,
    p.is_active AS is_active,
    c.name_en AS category_name_en,
    c.name_bn AS category_name_bn,
    b.name_en AS brand_name_en,
    b.name_bn AS brand_name_bn
  FROM products p
  INNER JOIN product_color_variants v ON v.product_id = p.id
  INNER JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
  UNION ALL
  SELECT
    'product' AS kind,
    p.id AS product_id,
    NULL AS variant_id,
    p.slug,
    p.category_id,
    p.brand_id,
    p.name_en AS product_name_en,
    p.name_bn AS product_name_bn,
    NULL AS variant_name_en,
    NULL AS variant_name_bn,
    p.stock AS stock,
    p.is_active AS is_active,
    c.name_en AS category_name_en,
    c.name_bn AS category_name_bn,
    b.name_en AS brand_name_en,
    b.name_bn AS brand_name_bn
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE NOT EXISTS (SELECT 1 FROM product_color_variants v2 WHERE v2.product_id = p.id)
`;

const REASONS = new Set(["adjustment", "received", "return", "damage", "correction", "count"]);

/**
 * @param {{ categoryId?: unknown, brandId?: unknown }} opts
 * @returns {{ categoryId: number | null, brandMode: 'all'|'none'|'id', brandId: number | null }}
 */
function parseCategoryBrandFilters(opts) {
  let categoryId = null;
  if (opts.categoryId != null && opts.categoryId !== "") {
    const n = Number(opts.categoryId);
    if (Number.isFinite(n) && n > 0) categoryId = n;
  }
  let brandMode = "all";
  let brandId = null;
  if (opts.brandId != null && opts.brandId !== "") {
    const s = String(opts.brandId).trim().toLowerCase();
    if (s === "none" || s === "0") brandMode = "none";
    else {
      const n = Number(opts.brandId);
      if (Number.isFinite(n) && n > 0) {
        brandMode = "id";
        brandId = n;
      }
    }
  }
  return { categoryId, brandMode, brandId };
}

function categoryBrandFilterSql(fb) {
  let sql = "";
  const params = [];
  if (fb.categoryId != null) {
    sql += " AND inv.category_id = ?";
    params.push(fb.categoryId);
  }
  if (fb.brandMode === "none") {
    sql += " AND inv.brand_id IS NULL";
  } else if (fb.brandMode === "id" && fb.brandId != null) {
    sql += " AND inv.brand_id = ?";
    params.push(fb.brandId);
  }
  return { sql, params };
}

function orderByClause(sort) {
  const s = sort != null ? String(sort).trim().toLowerCase() : "stock_asc";
  switch (s) {
    case "stock_desc":
      return "inv.stock DESC, inv.product_id ASC, inv.variant_id ASC";
    case "name_asc":
      return "inv.product_name_en ASC, inv.product_id ASC, inv.variant_id ASC";
    case "name_desc":
      return "inv.product_name_en DESC, inv.product_id ASC, inv.variant_id ASC";
    case "category_asc":
      return "inv.category_name_en ASC, inv.stock ASC, inv.product_id ASC";
    case "brand_asc":
      return "IFNULL(inv.brand_name_en,'') ASC, inv.stock ASC, inv.product_id ASC";
    case "sku_asc":
      return "inv.kind DESC, inv.product_id ASC, inv.variant_id ASC";
    default:
      return "inv.stock ASC, inv.product_id ASC, inv.variant_id ASC";
  }
}

function stockStatus(stock, lowThreshold) {
  const s = Number(stock) || 0;
  if (s <= 0) return "out";
  if (s <= lowThreshold) return "low";
  return "ok";
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{ lowThreshold?: number, categoryId?: unknown, brandId?: unknown }} [opts]
 */
export async function getInventorySummary(db, opts = {}) {
  const low = Math.max(0, Math.min(999, Number(opts.lowThreshold) || DEFAULT_LOW_THRESHOLD));
  const fb = parseCategoryBrandFilters(opts);
  const { sql: filterSql, params: filterParams } = categoryBrandFilterSql(fb);

  const [[row]] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN inv.stock = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock,
       COALESCE(SUM(CASE WHEN inv.stock > 0 AND inv.stock <= ? THEN 1 ELSE 0 END), 0) AS low_stock,
       COALESCE(SUM(CASE WHEN inv.stock > ? THEN 1 ELSE 0 END), 0) AS in_stock,
       COUNT(*) AS total_skus
     FROM (${INVENTORY_SKU_UNION_SQL}) inv
     WHERE 1=1 ${filterSql}`,
    [low, low, ...filterParams]
  );
  return {
    totalSkus: Number(row?.total_skus) || 0,
    outOfStock: Number(row?.out_of_stock) || 0,
    lowStock: Number(row?.low_stock) || 0,
    inStock: Number(row?.in_stock) || 0,
    lowThreshold: low,
    filtersApplied: {
      categoryId: fb.categoryId,
      brandId: fb.brandMode === "id" ? fb.brandId : fb.brandMode === "none" ? "none" : null,
    },
  };
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{
 *   q?: string,
 *   status?: string,
 *   page?: number,
 *   pageSize?: number,
 *   lowThreshold?: number,
 *   categoryId?: unknown,
 *   brandId?: unknown,
 *   sort?: string,
 * }} [opts]
 */
export async function listInventorySkus(db, opts = {}) {
  const low = Math.max(0, Math.min(999, Number(opts.lowThreshold) || DEFAULT_LOW_THRESHOLD));
  const page = Math.max(1, Number(opts.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(opts.pageSize) || 50));
  const offset = (page - 1) * pageSize;
  const qRaw = opts.q != null ? String(opts.q).trim() : "";
  const statusFilter = opts.status != null ? String(opts.status).trim().toLowerCase() : "all";

  const searchPattern = qRaw ? `%${qRaw.replace(/[%_\\]/g, "\\$&")}%` : null;

  let havingSql = "";
  const havingParams = [];
  if (statusFilter === "out") {
    havingSql = " AND inv.stock = 0";
  } else if (statusFilter === "low") {
    havingSql = " AND inv.stock > 0 AND inv.stock <= ?";
    havingParams.push(low);
  } else if (statusFilter === "ok") {
    havingSql = " AND inv.stock > ?";
    havingParams.push(low);
  }

  const searchSql = searchPattern
    ? ` AND (
        inv.product_name_en LIKE ? OR inv.product_name_bn LIKE ? OR inv.slug LIKE ?
        OR IFNULL(inv.variant_name_en, '') LIKE ? OR IFNULL(inv.variant_name_bn, '') LIKE ?
        OR IFNULL(inv.brand_name_en, '') LIKE ? OR IFNULL(inv.brand_name_bn, '') LIKE ?
        OR IFNULL(inv.category_name_en, '') LIKE ? OR IFNULL(inv.category_name_bn, '') LIKE ?
      )`
    : "";
  const searchParams = searchPattern
    ? [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
      ]
    : [];

  const fb = parseCategoryBrandFilters(opts);
  const { sql: catBrandSql, params: catBrandParams } = categoryBrandFilterSql(fb);

  const invSubquery = `(${INVENTORY_SKU_UNION_SQL}) inv`;

  const whereTail = ` WHERE 1=1 ${searchSql} ${havingSql} ${catBrandSql}`;

  const listParams = [...searchParams, ...havingParams, ...catBrandParams];

  const [[{ cnt }]] = await db.query(`SELECT COUNT(*) AS cnt FROM ${invSubquery} ${whereTail}`, listParams);

  const total = Number(cnt) || 0;

  const ob = orderByClause(opts.sort);

  const [rows] = await db.query(
    `SELECT inv.* FROM ${invSubquery} ${whereTail}
     ORDER BY ${ob}
     LIMIT ? OFFSET ?`,
    [...listParams, pageSize, offset]
  );

  const items = (rows || []).map((r) => {
    const stock = Number(r.stock) || 0;
    return {
      kind: r.kind,
      productId: Number(r.product_id),
      variantId: r.variant_id != null ? Number(r.variant_id) : null,
      slug: r.slug,
      categoryId: Number(r.category_id),
      brandId: r.brand_id != null ? Number(r.brand_id) : null,
      productNameEn: r.product_name_en,
      productNameBn: r.product_name_bn,
      variantNameEn: r.variant_name_en,
      variantNameBn: r.variant_name_bn,
      skuCode:
        r.kind === "variant"
          ? `P${r.product_id}-V${r.variant_id}`
          : `P${r.product_id}`,
      stock,
      status: stockStatus(stock, low),
      isActive: Boolean(r.is_active),
      categoryNameEn: r.category_name_en,
      categoryNameBn: r.category_name_bn,
      brandNameEn: r.brand_name_en,
      brandNameBn: r.brand_name_bn,
    };
  });

  return {
    items,
    total,
    page,
    pageSize,
    lowThreshold: low,
    sort: opts.sort != null ? String(opts.sort).trim().toLowerCase() : "stock_asc",
  };
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{ limit?: number, offset?: number }} [opts]
 */
export async function listStockMovements(db, opts = {}) {
  if (!(await tableExists(db, "inventory_stock_movements"))) {
    return [];
  }
  const limit = Math.min(200, Math.max(1, Number(opts.limit) || 40));
  const offset = Math.max(0, Number(opts.offset) || 0);

  const [rows] = await db.query(
    `SELECT m.id, m.product_id, m.variant_id, m.qty_delta, m.qty_after, m.reason, m.note,
            m.created_by, m.created_at,
            p.name_en AS product_name_en, p.slug AS product_slug,
            u.email AS created_by_email
     FROM inventory_stock_movements m
     INNER JOIN products p ON p.id = m.product_id
     LEFT JOIN users u ON u.id = m.created_by
     ORDER BY m.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return (rows || []).map((r) => ({
    id: Number(r.id),
    productId: Number(r.product_id),
    variantId: r.variant_id != null ? Number(r.variant_id) : null,
    qtyDelta: Number(r.qty_delta),
    qtyAfter: Number(r.qty_after),
    reason: r.reason,
    note: r.note,
    createdBy: r.created_by != null ? Number(r.created_by) : null,
    createdByEmail: r.created_by_email || null,
    createdAt: r.created_at,
    productNameEn: r.product_name_en,
    productSlug: r.product_slug,
  }));
}

async function tableExists(db, name) {
  try {
    const [[r]] = await db.query(
      `SELECT 1 AS o FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
      [name]
    );
    return Boolean(r?.o);
  } catch {
    return false;
  }
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{
 *   productId: number,
 *   variantId?: number | null,
 *   qtyDelta: number,
 *   reason?: string,
 *   note?: string | null,
 *   userId?: number | null,
 * }} body
 */
export async function adjustInventoryStock(db, body) {
  const productId = Number(body.productId);
  if (!Number.isFinite(productId) || productId <= 0) {
    const e = new Error("invalid_product");
    e.code = "invalid_product";
    throw e;
  }
  const qtyDelta = Math.trunc(Number(body.qtyDelta));
  if (!Number.isFinite(qtyDelta) || qtyDelta === 0) {
    const e = new Error("invalid_qty");
    e.code = "invalid_qty";
    throw e;
  }
  const reason = body.reason != null ? String(body.reason).trim().slice(0, 32) : "adjustment";
  if (!REASONS.has(reason)) {
    const e = new Error("invalid_reason");
    e.code = "invalid_reason";
    throw e;
  }
  const note = body.note != null ? String(body.note).trim().slice(0, 512) : null;
  const variantId = body.variantId != null && body.variantId !== "" ? Number(body.variantId) : null;
  const userId = body.userId != null && Number.isFinite(Number(body.userId)) ? Number(body.userId) : null;

  const movementsOk = await tableExists(db, "inventory_stock_movements");

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let newStock;
    if (variantId != null && Number.isFinite(variantId)) {
      const [[v]] = await conn.query(
        `SELECT v.id, v.stock FROM product_color_variants v WHERE v.id = ? AND v.product_id = ? FOR UPDATE`,
        [variantId, productId]
      );
      if (!v) {
        await conn.rollback();
        const e = new Error("variant_not_found");
        e.code = "variant_not_found";
        throw e;
      }
      const cur = Number(v.stock) || 0;
      newStock = cur + qtyDelta;
      if (newStock < 0) {
        await conn.rollback();
        const e = new Error("insufficient_stock");
        e.code = "insufficient_stock";
        throw e;
      }
      await conn.query(`UPDATE product_color_variants SET stock = ? WHERE id = ? AND product_id = ?`, [
        newStock,
        variantId,
        productId,
      ]);
    } else {
      const [[p]] = await conn.query(`SELECT id, stock FROM products WHERE id = ? FOR UPDATE`, [productId]);
      if (!p) {
        await conn.rollback();
        const e = new Error("product_not_found");
        e.code = "product_not_found";
        throw e;
      }
      const [[{ c: variantCount }]] = await conn.query(
        `SELECT COUNT(*) AS c FROM product_color_variants WHERE product_id = ?`,
        [productId]
      );
      if (Number(variantCount) > 0) {
        await conn.rollback();
        const e = new Error("use_variant_stock");
        e.code = "use_variant_stock";
        throw e;
      }
      const cur = Number(p.stock) || 0;
      newStock = cur + qtyDelta;
      if (newStock < 0) {
        await conn.rollback();
        const e = new Error("insufficient_stock");
        e.code = "insufficient_stock";
        throw e;
      }
      await conn.query(`UPDATE products SET stock = ? WHERE id = ?`, [newStock, productId]);
    }

    if (movementsOk) {
      await conn.query(
        `INSERT INTO inventory_stock_movements (product_id, variant_id, qty_delta, qty_after, reason, note, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [productId, variantId, qtyDelta, newStock, reason, note, userId]
      );
    }

    await conn.commit();
    return { ok: true, newStock, auditLogged: movementsOk };
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    conn.release();
  }
}

export { DEFAULT_LOW_THRESHOLD, REASONS };
