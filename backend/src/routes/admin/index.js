import { Router } from "express";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { pool } from "../../db/pool.js";
import { slugify } from "../../utils/slug.js";
import { normalizeCoverImageUrl } from "../../utils/coverImageUrl.js";
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
import blogPostsAdminRouter from "./blogPostsAdmin.js";
import cmsPagesAdminRouter from "./cmsPagesAdmin.js";
import storeSettingsAdminRouter from "./storeSettingsAdmin.js";
import contactMessagesAdminRouter from "./contactMessagesAdmin.js";
import newsletterSubscribersAdminRouter from "./newsletterSubscribersAdmin.js";
import notificationsFeedAdminRouter from "./notificationsFeedAdmin.js";

const router = Router();

const __adminFilename = fileURLToPath(import.meta.url);
const __adminDirname = path.dirname(__adminFilename);
const catalogCoverUploadDir = path.join(__adminDirname, "..", "..", "..", "uploads", "catalog");
fs.mkdirSync(catalogCoverUploadDir, { recursive: true });

const catalogCoverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, catalogCoverUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const safe = allowed.includes(ext) ? ext : ".jpg";
    cb(null, `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safe}`);
  },
});

const catalogCoverUpload = multer({
  storage: catalogCoverStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error("INVALID_IMAGE_TYPE"), ok);
  },
});

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

router.get("/categories", async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? "").trim();
    const layoutFilter = String(req.query.layout ?? "all").toLowerCase();
    const hasProducts = String(req.query.hasProducts ?? "all").toLowerCase();
    const stockFilter = String(req.query.stock ?? "all").toLowerCase();
    const soldFilter = String(req.query.sold ?? "all").toLowerCase();
    const sort = String(req.query.sort ?? "sort_asc").toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
    const offset = (page - 1) * pageSize;

    /** Total on-hand units in category (variants + base-only products). */
    const sqlStockSum = `(
      COALESCE((
        SELECT SUM(v.stock)
        FROM products p2
        INNER JOIN product_color_variants v ON v.product_id = p2.id
        WHERE p2.category_id = c.id
      ), 0)
      + COALESCE((
        SELECT SUM(p3.stock)
        FROM products p3
        WHERE p3.category_id = c.id
          AND NOT EXISTS (SELECT 1 FROM product_color_variants v2 WHERE v2.product_id = p3.id)
      ), 0)
    )`;

    /** Lifetime units sold (non-cancelled orders). */
    const sqlUnitsSold = `(
      SELECT COALESCE(SUM(oi.qty), 0)
      FROM order_items oi
      INNER JOIN products p2 ON p2.id = oi.product_id
      INNER JOIN orders ord ON ord.id = oi.order_id
      WHERE p2.category_id = c.id AND ord.status <> 'cancelled'
    )`;

    const layoutValues = new Set(["clothing", "footwear", "accessories", "grooming"]);

    let where = "WHERE 1=1";
    const params = [];

    if (qRaw.length > 0) {
      const like = `%${qRaw}%`;
      where += " AND (c.name_en LIKE ? OR c.name_bn LIKE ? OR c.slug LIKE ?)";
      params.push(like, like, like);
    }

    if (layoutFilter !== "all" && layoutValues.has(layoutFilter)) {
      where += " AND c.page_layout = ?";
      params.push(layoutFilter);
    }

    if (hasProducts === "yes") {
      where += " AND EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id)";
    } else if (hasProducts === "no") {
      where += " AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id)";
    }

    if (stockFilter === "in_stock") {
      where += ` AND ${sqlStockSum} > 0`;
    } else if (stockFilter === "zero_stock") {
      where += ` AND ${sqlStockSum} = 0`;
    }

    if (soldFilter === "has_sales") {
      where += ` AND ${sqlUnitsSold} > 0`;
    } else if (soldFilter === "no_sales") {
      where += ` AND ${sqlUnitsSold} = 0`;
    }

    let orderSql = "ORDER BY c.sort_order ASC, c.id ASC";
    if (sort === "sort_desc") orderSql = "ORDER BY c.sort_order DESC, c.id DESC";
    else if (sort === "id_desc") orderSql = "ORDER BY c.id DESC";
    else if (sort === "id_asc") orderSql = "ORDER BY c.id ASC";
    else if (sort === "name_en_asc") orderSql = "ORDER BY c.name_en ASC";
    else if (sort === "name_en_desc") orderSql = "ORDER BY c.name_en DESC";
    else if (sort === "slug_asc") orderSql = "ORDER BY c.slug ASC";
    else if (sort === "created_desc") orderSql = "ORDER BY c.created_at DESC";
    else if (sort === "created_asc") orderSql = "ORDER BY c.created_at ASC";
    else if (sort === "stock_desc") orderSql = `ORDER BY ${sqlStockSum} DESC, c.id DESC`;
    else if (sort === "stock_asc") orderSql = `ORDER BY ${sqlStockSum} ASC, c.id ASC`;
    else if (sort === "sold_desc") orderSql = `ORDER BY ${sqlUnitsSold} DESC, c.id DESC`;
    else if (sort === "sold_asc") orderSql = `ORDER BY ${sqlUnitsSold} ASC, c.id ASC`;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM categories c ${where}`, params);

    const [rows] = await pool.query(
      `SELECT c.id, c.name_bn, c.name_en, c.slug, c.sort_order, c.page_layout, c.cover_image, c.created_at,
              ${sqlStockSum} AS stock_units,
              ${sqlUnitsSold} AS units_sold
       FROM categories c
       ${where}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      categories: rows,
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/categories", async (req, res) => {
  const { name_bn, name_en, slug: rawSlug, page_layout: layoutRaw, cover_image: rawCover } = req.body || {};
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
  const cover_image = normalizeCoverImageUrl(rawCover);
  try {
    const [[nextOrderRow]] = await pool.query(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM categories`
    );
    const order = Number(nextOrderRow?.next_sort) || 0;
    const [result] = await pool.query(
      `INSERT INTO categories (name_bn, name_en, slug, sort_order, page_layout, cover_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name_bn, name_en, slug, order, page_layout, cover_image]
    );
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, page_layout, cover_image, created_at FROM categories WHERE id = ?`,
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
  const { name_bn, name_en, slug: rawSlug, page_layout: layoutRaw, cover_image: rawCover } = req.body || {};
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
  if (layoutRaw !== undefined) {
    const page_layout = normalizePageLayout(layoutRaw);
    if (page_layout === null) {
      return res.status(400).json({ error: "invalid_page_layout" });
    }
    fields.push("page_layout = ?");
    values.push(page_layout);
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "cover_image")) {
    fields.push("cover_image = ?");
    values.push(normalizeCoverImageUrl(rawCover));
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
      `SELECT id, name_bn, name_en, slug, sort_order, page_layout, cover_image, created_at FROM categories WHERE id = ?`,
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

router.get("/brands", async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? "").trim();
    const sort = String(req.query.sort ?? "sort_asc").toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
    const offset = (page - 1) * pageSize;

    let where = "WHERE 1=1";
    const params = [];
    if (qRaw.length > 0) {
      const like = `%${qRaw}%`;
      where += " AND (name_en LIKE ? OR name_bn LIKE ? OR slug LIKE ?)";
      params.push(like, like, like);
    }

    let orderSql = "ORDER BY sort_order ASC, id ASC";
    if (sort === "sort_desc") orderSql = "ORDER BY sort_order DESC, id DESC";
    else if (sort === "id_desc") orderSql = "ORDER BY id DESC";
    else if (sort === "id_asc") orderSql = "ORDER BY id ASC";
    else if (sort === "name_en_asc") orderSql = "ORDER BY name_en ASC";
    else if (sort === "name_en_desc") orderSql = "ORDER BY name_en DESC";
    else if (sort === "slug_asc") orderSql = "ORDER BY slug ASC";
    else if (sort === "created_desc") orderSql = "ORDER BY created_at DESC";
    else if (sort === "created_asc") orderSql = "ORDER BY created_at ASC";

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM brands ${where}`, params);
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, cover_image, created_at
       FROM brands
       ${where}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({
      brands: rows,
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/brands", async (req, res) => {
  const { name_bn, name_en, slug: rawSlug, cover_image: rawCover } = req.body || {};
  if (!name_bn || !name_en) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const cover_image = normalizeCoverImageUrl(rawCover);
  try {
    const [[nextOrderRow]] = await pool.query(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM brands`
    );
    const order = Number(nextOrderRow?.next_sort) || 0;
    const [result] = await pool.query(
      `INSERT INTO brands (name_bn, name_en, slug, sort_order, cover_image)
       VALUES (?, ?, ?, ?, ?)`,
      [name_bn, name_en, slug, order, cover_image]
    );
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, cover_image, created_at FROM brands WHERE id = ?`,
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
  const { name_bn, name_en, slug: rawSlug, cover_image: rawCover } = req.body || {};
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
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "cover_image")) {
    fields.push("cover_image = ?");
    values.push(normalizeCoverImageUrl(rawCover));
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
      `SELECT id, name_bn, name_en, slug, sort_order, cover_image, created_at FROM brands WHERE id = ?`,
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

router.get("/products", async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? "").trim();
    const categoryRaw = req.query.categoryId;
    const brandRaw = req.query.brandId;
    const activeFilter = String(req.query.active ?? "all").toLowerCase();
    const stockFilter = String(req.query.stock ?? "all").toLowerCase();
    const sort = String(req.query.sort ?? "id_desc").toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
    const offset = (page - 1) * pageSize;

    const priceMinRaw = req.query.priceMin;
    const priceMaxRaw = req.query.priceMax;
    const priceMin =
      priceMinRaw != null && String(priceMinRaw).trim() !== ""
        ? Number(priceMinRaw)
        : null;
    const priceMax =
      priceMaxRaw != null && String(priceMaxRaw).trim() !== ""
        ? Number(priceMaxRaw)
        : null;

    let where = "WHERE 1=1";
    const params = [];

    if (qRaw.length > 0) {
      const like = `%${qRaw}%`;
      where += " AND (p.name_en LIKE ? OR p.name_bn LIKE ? OR p.slug LIKE ?)";
      params.push(like, like, like);
    }

    const catNum =
      categoryRaw != null && String(categoryRaw).trim() !== ""
        ? Number(categoryRaw)
        : null;
    if (catNum != null && Number.isFinite(catNum)) {
      where += " AND p.category_id = ?";
      params.push(catNum);
    }

    if (brandRaw === "none") {
      where += " AND p.brand_id IS NULL";
    } else if (brandRaw != null && String(brandRaw).trim() !== "" && brandRaw !== "all") {
      const bid = Number(brandRaw);
      if (Number.isFinite(bid)) {
        where += " AND p.brand_id = ?";
        params.push(bid);
      }
    }

    if (activeFilter === "active") {
      where += " AND p.is_active = 1";
    } else if (activeFilter === "inactive") {
      where += " AND p.is_active = 0";
    }

    if (stockFilter === "out") {
      where += " AND p.stock = 0";
    } else if (stockFilter === "low") {
      where += " AND p.stock > 0 AND p.stock <= 5";
    } else if (stockFilter === "ok") {
      where += " AND p.stock > 5";
    }

    if (priceMin != null && Number.isFinite(priceMin)) {
      where += " AND p.price >= ?";
      params.push(priceMin);
    }
    if (priceMax != null && Number.isFinite(priceMax)) {
      where += " AND p.price <= ?";
      params.push(priceMax);
    }

    let orderSql = "ORDER BY p.id DESC";
    if (sort === "id_asc") orderSql = "ORDER BY p.id ASC";
    else if (sort === "price_desc") orderSql = "ORDER BY p.price DESC";
    else if (sort === "price_asc") orderSql = "ORDER BY p.price ASC";
    else if (sort === "name_en_asc") orderSql = "ORDER BY p.name_en ASC";
    else if (sort === "name_en_desc") orderSql = "ORDER BY p.name_en DESC";
    else if (sort === "stock_desc") orderSql = "ORDER BY p.stock DESC";
    else if (sort === "stock_asc") orderSql = "ORDER BY p.stock ASC";
    else if (sort === "created_desc") orderSql = "ORDER BY p.created_at DESC";
    else if (sort === "created_asc") orderSql = "ORDER BY p.created_at ASC";

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM products p ${where}`, params);

    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.is_active, p.created_at,
              c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ${where}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      products: rows,
      total: Number(total) || 0,
      page,
      pageSize,
    });
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

router.get("/users", async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? "").trim();
    const roleFilter = String(req.query.role ?? "all").toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
    const offset = (page - 1) * pageSize;
    const sort = String(req.query.sort ?? "id_desc").toLowerCase();

    let orderSql = "ORDER BY u.id DESC";
    if (sort === "id_asc") orderSql = "ORDER BY u.id ASC";
    else if (sort === "joined_desc") orderSql = "ORDER BY u.created_at DESC";
    else if (sort === "joined_asc") orderSql = "ORDER BY u.created_at ASC";
    else if (sort === "email_asc") orderSql = "ORDER BY u.email ASC";
    else if (sort === "name_asc") orderSql = "ORDER BY u.name ASC";

    let where = "WHERE 1=1";
    const params = [];
    if (qRaw.length > 0) {
      const like = `%${qRaw}%`;
      where += " AND (u.email LIKE ? OR u.name LIKE ?)";
      params.push(like, like);
    }
    if (roleFilter === "admin" || roleFilter === "customer") {
      where += " AND u.role = ?";
      params.push(roleFilter);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users u ${where}`, params);
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at FROM users u ${where} ${orderSql} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({
      users: rows,
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/users", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (role !== "admin" && role !== "customer") {
    return res.status(400).json({ error: "invalid_role" });
  }
  const displayName = String(name).trim().slice(0, 255);
  const normalized = String(email).trim().toLowerCase();
  const pw = String(password);
  if (!displayName || !normalized) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (pw.length < 8) {
    return res.status(400).json({ error: "weak_password" });
  }
  try {
    const hash = await bcrypt.hash(pw, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)`,
      [normalized, hash, role, displayName]
    );
    const id = Number(result.insertId);
    const [[row]] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = ?`,
      [id]
    );
    try {
      broadcastDashboardRefresh("users");
    } catch {
      /* non-fatal */
    }
    res.status(201).json({ user: row });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_email" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const adminId = Number(req.user?.id);
  if (!Number.isFinite(adminId)) {
    return res.status(500).json({ error: "server_error" });
  }
  if (id === adminId) {
    return res.status(403).json({ error: "cannot_delete_self" });
  }
  try {
    const [[target]] = await pool.query(`SELECT id, role FROM users WHERE id = ?`, [id]);
    if (!target) {
      return res.status(404).json({ error: "not_found" });
    }
    if (target.role === "admin") {
      const [[{ c }]] = await pool.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'admin'`);
      if (Number(c) <= 1) {
        return res.status(403).json({ error: "last_admin" });
      }
    }
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    try {
      broadcastDashboardRefresh("users");
    } catch {
      /* non-fatal */
    }
    res.json({ ok: true });
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

router.use(blogPostsAdminRouter);
router.use(cmsPagesAdminRouter);
router.use(storeSettingsAdminRouter);
router.use(contactMessagesAdminRouter);
router.use(newsletterSubscribersAdminRouter);
router.use(notificationsFeedAdminRouter);

router.post("/catalog-cover", (req, res, next) => {
  catalogCoverUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "file_too_large" });
      }
      return res.status(400).json({ error: "invalid_file_type" });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "missing_file" });
  }
  res.json({ url: `/uploads/catalog/${req.file.filename}` });
});

export default router;
