import { Router } from "express";
import { pool } from "../../db/pool.js";
import { slugify } from "../../utils/slug.js";
import {
  defaultHomeHero,
  normalizeHexColor,
  serializeHomeHeroRow,
} from "../../utils/homeHeroDefaults.js";
import {
  parseJsonColumn,
  normalizePageLayout,
  normalizeDescriptionSections,
  normalizeColorVariants,
  replaceProductColorVariants,
} from "../../utils/adminProductHelpers.js";
import {
  getAdminDashboardPayload,
  upsertAdminTaskCompletion,
} from "../../utils/adminDashboard.js";
import { getAdminOrdersList } from "../../utils/adminOrdersList.js";
import {
  getInventorySummary,
  listInventorySkus,
  listStockMovements,
  adjustInventoryStock,
} from "../../utils/adminInventory.js";
import { broadcastDashboardRefresh } from "../../realtime/adminWs.js";

const router = Router();

async function fetchAdminProductDetail(id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
            p.description_bn, p.description_en, p.description_sections_en, p.description_sections_bn,
            p.price, p.compare_at_price, p.image_url, p.stock, p.is_active, p.created_at,
            c.name_bn AS category_name_bn, c.name_en AS category_name_en,
            b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  if (!rows.length) return null;
  const row = rows[0];
  const rawEn = row.description_sections_en;
  const rawBn = row.description_sections_bn;
  let colorVariants = [];
  try {
    const [vrows] = await pool.query(
      `SELECT id, sort_order, name_en, name_bn, image_url, stock
       FROM product_color_variants
       WHERE product_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [id]
    );
    colorVariants = vrows || [];
  } catch {
    colorVariants = [];
  }
  return {
    ...row,
    description_sections_en: parseJsonColumn(rawEn),
    description_sections_bn: parseJsonColumn(rawBn),
    color_variants: colorVariants,
  };
}

router.get("/stats", async (_req, res) => {
  try {
    const [[{ c: categories }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM categories`
    );
    const [[{ c: products }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products`
    );
    const [[{ c: activeProducts }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products WHERE is_active = 1`
    );
    const [[{ c: users }]] = await pool.query(`SELECT COUNT(*) AS c FROM users`);
    const [[{ c: brandCount }]] = await pool.query(`SELECT COUNT(*) AS c FROM brands`);

    res.json({
      categories: Number(categories),
      products: Number(products),
      activeProducts: Number(activeProducts),
      brands: Number(brandCount),
      users: Number(users),
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const revenueFrom =
      req.query.revenueFrom != null && String(req.query.revenueFrom).trim() !== ""
        ? String(req.query.revenueFrom).trim().slice(0, 10)
        : undefined;
    const revenueTo =
      req.query.revenueTo != null && String(req.query.revenueTo).trim() !== ""
        ? String(req.query.revenueTo).trim().slice(0, 10)
        : undefined;
    const salesRange = req.query.salesRange != null && req.query.salesRange !== "" ? String(req.query.salesRange) : "7d";
    const payload = await getAdminDashboardPayload(pool, {
      revenueFrom,
      revenueTo,
      salesRange,
      userId: req.user?.id,
    });
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/dashboard/tasks", async (req, res) => {
  try {
    const taskKey = String(req.body?.taskKey ?? "").trim().slice(0, 190);
    if (!taskKey) {
      return res.status(400).json({ error: "task_key_required" });
    }
    const done = Boolean(req.body?.done);
    await upsertAdminTaskCompletion(pool, req.user.id, taskKey, done);
    res.json({ ok: true });
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg === "task_table_missing") {
      return res.status(503).json({ error: "task_table_missing", message: "Run db/migration_admin_dashboard_tasks.sql" });
    }
    if (msg === "invalid_task_payload") {
      return res.status(400).json({ error: "invalid_task_payload" });
    }
    res.status(500).json({ error: "database_error", message: msg });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const data = await getAdminOrdersList(pool, {
      page: req.query.page,
      pageSize: req.query.pageSize,
      q: req.query.q,
      status: req.query.status,
      sort: req.query.sort,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

const ADMIN_ORDER_STATUSES = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);

router.patch("/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const status = String(req.body?.status ?? "").trim().toLowerCase();
  if (!ADMIN_ORDER_STATUSES.has(status)) {
    return res.status(400).json({ error: "invalid_order_status" });
  }
  try {
    const [result] = await pool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [[row]] = await pool.query(
      `SELECT id, order_number, user_id, customer_name, phone, subtotal, delivery_fee, total, status,
              payment_method, delivery_zone, delivery_address, created_at
       FROM orders WHERE id = ? LIMIT 1`,
      [id]
    );
    try {
      broadcastDashboardRefresh("order_status");
    } catch {
      /* non-fatal */
    }
    res.json({ order: row });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ error: "orders_table_missing", message: "Run db/migration_orders.sql on MySQL." });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/inventory/summary", async (req, res) => {
  try {
    const low = req.query.lowThreshold != null ? Number(req.query.lowThreshold) : undefined;
    const summary = await getInventorySummary(pool, {
      lowThreshold: low,
      categoryId: req.query.categoryId,
      brandId: req.query.brandId,
    });
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/inventory", async (req, res) => {
  try {
    const data = await listInventorySkus(pool, {
      q: req.query.q,
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
      lowThreshold: req.query.lowThreshold != null ? Number(req.query.lowThreshold) : undefined,
      categoryId: req.query.categoryId,
      brandId: req.query.brandId,
      sort: req.query.sort,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/inventory/movements", async (req, res) => {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const movements = await listStockMovements(pool, { limit, offset });
    res.json({ movements });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/inventory/adjust", async (req, res) => {
  try {
    const adminId = req.user?.id != null ? Number(req.user.id) : null;
    const result = await adjustInventoryStock(pool, {
      productId: req.body?.productId,
      variantId: req.body?.variantId,
      qtyDelta: req.body?.qtyDelta,
      reason: req.body?.reason,
      note: req.body?.note,
      userId: adminId,
    });
    try {
      broadcastDashboardRefresh("inventory_adjust");
    } catch {
      /* non-fatal */
    }
    res.json(result);
  } catch (e) {
    const code = e?.code ?? e?.message;
    if (code === "invalid_product" || code === "invalid_qty" || code === "invalid_reason") {
      return res.status(400).json({ error: code });
    }
    if (code === "variant_not_found" || code === "product_not_found") {
      return res.status(404).json({ error: code });
    }
    if (code === "insufficient_stock") {
      return res.status(400).json({ error: code });
    }
    if (code === "use_variant_stock") {
      return res.status(400).json({ error: code });
    }
    res.status(500).json({ error: "database_error", message: String(e?.message || e) });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, page_layout, created_at
       FROM categories
       ORDER BY sort_order ASC, id ASC`
    );
    res.json({ categories: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/categories", async (req, res) => {
  const { name_bn, name_en, slug: rawSlug, sort_order, page_layout: layoutRaw } = req.body || {};
  if (!name_bn || !name_en) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const page_layout = normalizePageLayout(layoutRaw);
  if (page_layout === null) {
    return res.status(400).json({ error: "invalid_page_layout" });
  }
  const order = sort_order != null ? Number(sort_order) : 0;
  try {
    const [result] = await pool.query(
      `INSERT INTO categories (name_bn, name_en, slug, sort_order, page_layout)
       VALUES (?, ?, ?, ?, ?)`,
      [name_bn, name_en, slug, Number.isFinite(order) ? order : 0, page_layout]
    );
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, page_layout, created_at FROM categories WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({ category: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const { name_bn, name_en, slug: rawSlug, sort_order, page_layout: layoutRaw } = req.body || {};
  const fields = [];
  const values = [];
  if (name_bn != null) {
    fields.push("name_bn = ?");
    values.push(name_bn);
  }
  if (name_en != null) {
    fields.push("name_en = ?");
    values.push(name_en);
  }
  if (rawSlug != null) {
    const s = slugify(rawSlug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (sort_order != null) {
    fields.push("sort_order = ?");
    values.push(Number(sort_order));
  }
  if (layoutRaw !== undefined) {
    const page_layout = normalizePageLayout(layoutRaw);
    if (page_layout === null) {
      return res.status(400).json({ error: "invalid_page_layout" });
    }
    fields.push("page_layout = ?");
    values.push(page_layout);
  }
  if (!fields.length) {
    return res.status(400).json({ error: "no_updates" });
  }
  values.push(id);
  try {
    const [result] = await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, page_layout, created_at FROM categories WHERE id = ?`,
      [id]
    );
    res.json({ category: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [[{ c }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products WHERE category_id = ?`,
      [id]
    );
    if (Number(c) > 0) {
      return res.status(409).json({ error: "category_has_products" });
    }
    const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/brands", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at
       FROM brands
       ORDER BY sort_order ASC, id ASC`
    );
    res.json({ brands: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/brands", async (req, res) => {
  const { name_bn, name_en, slug: rawSlug, sort_order } = req.body || {};
  if (!name_bn || !name_en) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const order = sort_order != null ? Number(sort_order) : 0;
  try {
    const [result] = await pool.query(
      `INSERT INTO brands (name_bn, name_en, slug, sort_order)
       VALUES (?, ?, ?, ?)`,
      [name_bn, name_en, slug, Number.isFinite(order) ? order : 0]
    );
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at FROM brands WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({ brand: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const { name_bn, name_en, slug: rawSlug, sort_order } = req.body || {};
  const fields = [];
  const values = [];
  if (name_bn != null) {
    fields.push("name_bn = ?");
    values.push(name_bn);
  }
  if (name_en != null) {
    fields.push("name_en = ?");
    values.push(name_en);
  }
  if (rawSlug != null) {
    const s = slugify(rawSlug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (sort_order != null) {
    fields.push("sort_order = ?");
    values.push(Number(sort_order));
  }
  if (!fields.length) {
    return res.status(400).json({ error: "no_updates" });
  }
  values.push(id);
  try {
    const [result] = await pool.query(
      `UPDATE brands SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at FROM brands WHERE id = ?`,
      [id]
    );
    res.json({ brand: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [[{ c }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products WHERE brand_id = ?`,
      [id]
    );
    if (Number(c) > 0) {
      return res.status(409).json({ error: "brand_has_products" });
    }
    const [result] = await pool.query(`DELETE FROM brands WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/products", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.is_active, p.created_at,
              c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ORDER BY p.id DESC`
    );
    res.json({ products: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const product = await fetchAdminProductDetail(id);
    if (!product) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/products", async (req, res) => {
  const b = req.body || {};
  const {
    category_id,
    brand_id: brandIdRaw,
    name_bn,
    name_en,
    slug: rawSlug,
    description_bn,
    description_en,
    description_sections_en: secEnRaw,
    description_sections_bn: secBnRaw,
    color_variants: variantsRaw,
    price,
    compare_at_price,
    image_url,
    stock,
    is_active,
  } = b;
  if (!category_id || !name_bn || !name_en || price == null) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const catId = Number(category_id);
  if (!Number.isFinite(catId)) {
    return res.status(400).json({ error: "invalid_category" });
  }
  const pr = Number(price);
  if (!Number.isFinite(pr) || pr < 0) {
    return res.status(400).json({ error: "invalid_price" });
  }
  const st = stock != null ? Number(stock) : 0;
  const active = is_active === false || is_active === 0 ? 0 : 1;
  let brandId = null;
  if (brandIdRaw !== undefined && brandIdRaw !== null && brandIdRaw !== "") {
    const bid = Number(brandIdRaw);
    if (!Number.isFinite(bid) || bid < 1) {
      return res.status(400).json({ error: "invalid_brand" });
    }
    brandId = bid;
  }
  let compare = compare_at_price;
  if (compare != null && compare !== "") {
    compare = Number(compare);
    if (!Number.isFinite(compare)) {
      return res.status(400).json({ error: "invalid_compare_price" });
    }
  } else {
    compare = null;
  }

  const secEn = normalizeDescriptionSections(secEnRaw);
  if (!secEn.ok) {
    return res.status(400).json({ error: secEn.error });
  }
  const secBn = normalizeDescriptionSections(secBnRaw);
  if (!secBn.ok) {
    return res.status(400).json({ error: secBn.error });
  }
  const variants = normalizeColorVariants(variantsRaw);
  if (!variants.ok) {
    return res.status(400).json({ error: variants.error });
  }

  const conn = await pool.getConnection();
  try {
    const [[cat]] = await conn.query(`SELECT id FROM categories WHERE id = ?`, [catId]);
    if (!cat) {
      return res.status(400).json({ error: "category_not_found" });
    }
    if (brandId != null) {
      const [[br]] = await conn.query(`SELECT id FROM brands WHERE id = ?`, [brandId]);
      if (!br) {
        return res.status(400).json({ error: "brand_not_found" });
      }
    }
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO products (
        category_id, brand_id, name_bn, name_en, slug, description_bn, description_en,
        description_sections_en, description_sections_bn,
        price, compare_at_price, image_url, stock, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catId,
        brandId,
        name_bn,
        name_en,
        slug,
        description_bn ?? null,
        description_en ?? null,
        secEn.value,
        secBn.value,
        pr,
        compare,
        image_url || null,
        Number.isFinite(st) && st >= 0 ? st : 0,
        active,
      ]
    );
    const insertId = result.insertId;
    await replaceProductColorVariants(conn, insertId, variants.value);
    await conn.commit();
    const product = await fetchAdminProductDetail(insertId);
    res.status(201).json({ product });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  } finally {
    conn.release();
  }
});

router.patch("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const b = req.body || {};
  const fields = [];
  const values = [];

  if (b.category_id != null) {
    fields.push("category_id = ?");
    values.push(Number(b.category_id));
  }
  if (b.brand_id !== undefined) {
    if (b.brand_id === null || b.brand_id === "") {
      fields.push("brand_id = ?");
      values.push(null);
    } else {
      const bid = Number(b.brand_id);
      if (!Number.isFinite(bid) || bid < 1) {
        return res.status(400).json({ error: "invalid_brand" });
      }
      fields.push("brand_id = ?");
      values.push(bid);
    }
  }
  if (b.name_bn != null) {
    fields.push("name_bn = ?");
    values.push(b.name_bn);
  }
  if (b.name_en != null) {
    fields.push("name_en = ?");
    values.push(b.name_en);
  }
  if (b.slug != null) {
    const s = slugify(b.slug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (b.description_bn !== undefined) {
    fields.push("description_bn = ?");
    values.push(b.description_bn);
  }
  if (b.description_en !== undefined) {
    fields.push("description_en = ?");
    values.push(b.description_en);
  }
  if (b.description_sections_en !== undefined) {
    const sec = normalizeDescriptionSections(b.description_sections_en);
    if (!sec.ok) {
      return res.status(400).json({ error: sec.error });
    }
    fields.push("description_sections_en = ?");
    values.push(sec.value);
  }
  if (b.description_sections_bn !== undefined) {
    const sec = normalizeDescriptionSections(b.description_sections_bn);
    if (!sec.ok) {
      return res.status(400).json({ error: sec.error });
    }
    fields.push("description_sections_bn = ?");
    values.push(sec.value);
  }
  if (b.price != null) {
    const pr = Number(b.price);
    if (!Number.isFinite(pr) || pr < 0) {
      return res.status(400).json({ error: "invalid_price" });
    }
    fields.push("price = ?");
    values.push(pr);
  }
  if (b.compare_at_price !== undefined) {
    if (b.compare_at_price === null || b.compare_at_price === "") {
      fields.push("compare_at_price = ?");
      values.push(null);
    } else {
      const c = Number(b.compare_at_price);
      if (!Number.isFinite(c)) {
        return res.status(400).json({ error: "invalid_compare_price" });
      }
      fields.push("compare_at_price = ?");
      values.push(c);
    }
  }
  if (b.image_url !== undefined) {
    fields.push("image_url = ?");
    values.push(b.image_url || null);
  }
  if (b.stock != null) {
    const st = Number(b.stock);
    if (!Number.isFinite(st) || st < 0) {
      return res.status(400).json({ error: "invalid_stock" });
    }
    fields.push("stock = ?");
    values.push(st);
  }
  if (b.is_active !== undefined && b.is_active !== null) {
    fields.push("is_active = ?");
    values.push(b.is_active === false || b.is_active === 0 ? 0 : 1);
  }

  let variantsNorm = null;
  if (b.color_variants !== undefined) {
    const nv = normalizeColorVariants(b.color_variants);
    if (!nv.ok) {
      return res.status(400).json({ error: nv.error });
    }
    variantsNorm = nv.value;
  }

  if (!fields.length && variantsNorm === null) {
    return res.status(400).json({ error: "no_updates" });
  }

  const conn = await pool.getConnection();
  try {
    const [[exists]] = await conn.query(`SELECT id FROM products WHERE id = ?`, [id]);
    if (!exists) {
      return res.status(404).json({ error: "not_found" });
    }
    if (b.category_id != null) {
      const [[cat]] = await conn.query(`SELECT id FROM categories WHERE id = ?`, [
        Number(b.category_id),
      ]);
      if (!cat) {
        return res.status(400).json({ error: "category_not_found" });
      }
    }
    if (b.brand_id !== undefined && b.brand_id !== null && b.brand_id !== "") {
      const [[br]] = await conn.query(`SELECT id FROM brands WHERE id = ?`, [
        Number(b.brand_id),
      ]);
      if (!br) {
        return res.status(400).json({ error: "brand_not_found" });
      }
    }
    await conn.beginTransaction();
    if (fields.length) {
      values.push(id);
      await conn.query(
        `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }
    if (variantsNorm !== null) {
      await replaceProductColorVariants(conn, id, variantsNorm);
    }
    await conn.commit();
    const product = await fetchAdminProductDetail(id);
    res.json({ product });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  } finally {
    conn.release();
  }
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/home-hero", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, headline_en, headline_bn, subtext_en, subtext_bn,
              cta_label_en, cta_label_bn, cta_url, image_1_url, image_2_url,
              gradient_from, gradient_to, updated_at
       FROM home_hero WHERE id = 1 LIMIT 1`
    );
    if (!rows.length) {
      return res.json({ hero: defaultHomeHero() });
    }
    res.json({ hero: serializeHomeHeroRow(rows[0]) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "home_hero_table_missing",
        message: "Run db/migration_home_hero.sql (or full phpmyadmin-setup.sql).",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/home-hero", async (req, res) => {
  const b = req.body || {};
  const d = defaultHomeHero();
  const headline_en = String(b.headline_en ?? d.headline_en).trim().slice(0, 280) || d.headline_en;
  const headline_bn = String(b.headline_bn ?? "").trim().slice(0, 280);
  const subtext_en = String(b.subtext_en ?? d.subtext_en).trim().slice(0, 4000);
  const subtext_bn = String(b.subtext_bn ?? "").trim().slice(0, 4000);
  const cta_label_en = String(b.cta_label_en ?? d.cta_label_en).trim().slice(0, 160) || d.cta_label_en;
  const cta_label_bn = String(b.cta_label_bn ?? "").trim().slice(0, 160);
  let cta_url = String(b.cta_url ?? d.cta_url).trim().slice(0, 512);
  if (!cta_url.startsWith("/") && !/^https?:\/\//i.test(cta_url)) {
    cta_url = d.cta_url;
  }
  const image_1_url = String(b.image_1_url ?? "").trim().slice(0, 512) || null;
  const image_2_url = String(b.image_2_url ?? "").trim().slice(0, 512) || null;
  const gradient_from = normalizeHexColor(b.gradient_from, d.gradient_from);
  const gradient_to = normalizeHexColor(b.gradient_to, d.gradient_to);

  try {
    await pool.query(
      `INSERT INTO home_hero (
        id, headline_en, headline_bn, subtext_en, subtext_bn,
        cta_label_en, cta_label_bn, cta_url, image_1_url, image_2_url,
        gradient_from, gradient_to
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        headline_en = VALUES(headline_en),
        headline_bn = VALUES(headline_bn),
        subtext_en = VALUES(subtext_en),
        subtext_bn = VALUES(subtext_bn),
        cta_label_en = VALUES(cta_label_en),
        cta_label_bn = VALUES(cta_label_bn),
        cta_url = VALUES(cta_url),
        image_1_url = VALUES(image_1_url),
        image_2_url = VALUES(image_2_url),
        gradient_from = VALUES(gradient_from),
        gradient_to = VALUES(gradient_to)`,
      [
        headline_en,
        headline_bn,
        subtext_en || null,
        subtext_bn || null,
        cta_label_en,
        cta_label_bn,
        cta_url,
        image_1_url,
        image_2_url,
        gradient_from,
        gradient_to,
      ]
    );
    const [rows] = await pool.query(
      `SELECT id, headline_en, headline_bn, subtext_en, subtext_bn,
              cta_label_en, cta_label_bn, cta_url, image_1_url, image_2_url,
              gradient_from, gradient_to, updated_at
       FROM home_hero WHERE id = 1 LIMIT 1`
    );
    res.json({ hero: serializeHomeHeroRow(rows[0]) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "home_hero_table_missing",
        message: "Run db/migration_home_hero.sql (or full phpmyadmin-setup.sql).",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users ORDER BY id DESC`
    );
    res.json({ users: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const { role } = req.body || {};
  if (role !== "admin" && role !== "customer") {
    return res.status(400).json({ error: "invalid_role" });
  }
  const adminId = Number(req.user?.id);
  if (!Number.isFinite(adminId)) {
    return res.status(500).json({ error: "server_error" });
  }
  if (id === adminId && role === "customer") {
    return res.status(403).json({ error: "cannot_demote_self" });
  }
  try {
    const [[target]] = await pool.query(`SELECT id, role FROM users WHERE id = ?`, [
      id,
    ]);
    if (!target) {
      return res.status(404).json({ error: "not_found" });
    }
    if (target.role === "admin" && role === "customer") {
      const [[{ c }]] = await pool.query(
        `SELECT COUNT(*) AS c FROM users WHERE role = 'admin'`
      );
      if (Number(c) <= 1) {
        return res.status(403).json({ error: "last_admin" });
      }
    }
    await pool.query(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
    const [[updated]] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = ?`,
      [id]
    );
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
