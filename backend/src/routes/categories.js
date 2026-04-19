import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name_bn, c.name_en, c.slug, c.sort_order, c.page_layout,
        (SELECT COUNT(*) FROM products p
         WHERE p.category_id = c.id AND p.is_active = 1) AS product_count,
        COALESCE(
          NULLIF(TRIM(c.cover_image), ''),
          (SELECT p.image_url FROM products p
           WHERE p.category_id = c.id AND p.is_active = 1
             AND p.image_url IS NOT NULL AND TRIM(p.image_url) <> ''
           ORDER BY p.id ASC LIMIT 1)
        ) AS cover_image
       FROM categories c
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    res.json({ categories: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
