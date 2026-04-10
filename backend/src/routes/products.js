import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (req, res) => {
  const {
    category: categorySlug,
    brand: brandSlug,
    q: searchQ,
    sort: sortRaw,
    in_stock: inStockRaw,
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

    const q = String(searchQ || "").trim();
    if (q) {
      const term = `%${q}%`;
      whereExtra += ` AND (p.name_bn LIKE ? OR p.name_en LIKE ? OR p.slug LIKE ?)`;
      whereParams.push(term, term, term);
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
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.created_at,
              c.slug AS category_slug, c.name_bn AS category_name_bn, c.name_en AS category_name_en,
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
    res.json({ product: rows[0] });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
