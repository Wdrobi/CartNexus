import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

function parseJsonColumn(value) {
  if (value == null) return null;
  if (typeof value === "object" && !Buffer.isBuffer(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

router.get("/", async (req, res) => {
  const {
    category: categorySlug,
    brand: brandSlug,
    q: searchQ,
    sort: sortRaw,
    in_stock: inStockRaw,
    sale: saleRaw,
    has_image: hasImageRaw,
    min_price: minPriceRaw,
    max_price: maxPriceRaw,
    limit = "24",
    offset = "0",
  } = req.query;
  const lim = Math.min(Math.max(parseInt(String(limit), 10) || 24, 1), 200);
  const off = Math.max(parseInt(String(offset), 10) || 0, 0);

  try {
    let whereExtra = "";
    const whereParams = [];

    if (categorySlug) {
      whereExtra += ` AND c.slug = ?`;
      whereParams.push(categorySlug);
    }

    if (brandSlug) {
      whereExtra += ` AND b.slug = ?`;
      whereParams.push(String(brandSlug).trim());
    }

    const inStockOnly =
      inStockRaw === "1" || String(inStockRaw).toLowerCase() === "true";
    if (inStockOnly) {
      whereExtra += ` AND p.stock > 0`;
    }

    const saleOnly = saleRaw === "1" || String(saleRaw).toLowerCase() === "true";
    if (saleOnly) {
      whereExtra += ` AND p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price`;
    }

    const requireImage =
      hasImageRaw === "1" ||
      hasImageRaw === "true" ||
      String(hasImageRaw || "").toLowerCase() === "true";
    if (requireImage) {
      whereExtra += ` AND p.image_url IS NOT NULL AND TRIM(p.image_url) <> ''`;
    }

    const q = String(searchQ || "").trim();
    if (q) {
      const term = `%${q}%`;
      whereExtra += ` AND (p.name_bn LIKE ? OR p.name_en LIKE ? OR p.slug LIKE ?)`;
      whereParams.push(term, term, term);
    }

    const minP = minPriceRaw != null && String(minPriceRaw).trim() !== "" ? Number(minPriceRaw) : NaN;
    if (!Number.isNaN(minP) && minP >= 0) {
      whereExtra += ` AND p.price >= ?`;
      whereParams.push(minP);
    }
    const maxP = maxPriceRaw != null && String(maxPriceRaw).trim() !== "" ? Number(maxPriceRaw) : NaN;
    if (!Number.isNaN(maxP) && maxP >= 0) {
      whereExtra += ` AND p.price <= ?`;
      whereParams.push(maxP);
    }

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS c
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.is_active = 1${whereExtra}`,
      whereParams
    );
    const total = Number(countRow?.c ?? 0);

    const sort = String(sortRaw || "latest").toLowerCase();
    let orderClause = "ORDER BY p.created_at DESC, p.id DESC";
    switch (sort) {
      case "price_asc":
        orderClause = "ORDER BY p.price ASC, p.id ASC";
        break;
      case "price_desc":
        orderClause = "ORDER BY p.price DESC, p.id DESC";
        break;
      case "name_asc":
        orderClause = "ORDER BY p.name_en ASC, p.id ASC";
        break;
      case "hot":
        orderClause =
          "ORDER BY (CASE WHEN p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price THEN 1 ELSE 0 END) DESC, p.stock DESC, p.created_at DESC, p.id DESC";
        break;
      case "latest":
      default:
        orderClause = "ORDER BY p.created_at DESC, p.id DESC";
        break;
    }

    const sql = `
      SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
             p.description_bn, p.description_en, p.price, p.compare_at_price,
             p.image_url, p.stock, p.created_at,
             c.slug AS category_slug, c.name_bn AS category_name_bn, c.name_en AS category_name_en,
             b.slug AS brand_slug, b.name_bn AS brand_name_bn, b.name_en AS brand_name_en
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.is_active = 1${whereExtra}
      ${orderClause} LIMIT ? OFFSET ?`;
    const listParams = [...whereParams, lim, off];

    const [rows] = await pool.query(sql, listParams);
    res.json({ products: rows, total, limit: lim, offset: off });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.description_sections_en, p.description_sections_bn,
              p.price, p.compare_at_price, p.image_url, p.stock, p.created_at,
              c.slug AS category_slug, c.page_layout, c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.slug AS brand_slug, b.name_bn AS brand_name_bn, b.name_en AS brand_name_en
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.slug = ? AND p.is_active = 1
       LIMIT 1`,
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "not_found" });
    }
    const row = rows[0];
    let colorVariants = [];
    try {
      const [vrows] = await pool.query(
        `SELECT id, sort_order, name_en, name_bn, image_url, stock
         FROM product_color_variants
         WHERE product_id = ?
         ORDER BY sort_order ASC, id ASC`,
        [row.id]
      );
      colorVariants = vrows || [];
    } catch {
      colorVariants = [];
    }
    const {
      description_sections_en: rawEn,
      description_sections_bn: rawBn,
      ...base
    } = row;
    const product = {
      ...base,
      description_sections_en: parseJsonColumn(rawEn),
      description_sections_bn: parseJsonColumn(rawBn),
      color_variants: colorVariants,
    };
    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
