import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.name_bn, b.name_en, b.slug, b.sort_order,
              COUNT(p.id) AS product_count,
              (SELECT p2.image_url FROM products p2
               WHERE p2.brand_id = b.id AND p2.is_active = 1 AND p2.image_url IS NOT NULL AND p2.image_url != ''
               ORDER BY p2.id ASC LIMIT 1) AS cover_image
       FROM brands b
       LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = 1
       GROUP BY b.id
       ORDER BY b.sort_order ASC, b.name_en ASC`
    );
    res.json({ brands: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
