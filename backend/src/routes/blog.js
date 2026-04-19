import { Router } from "express";
import { pool } from "../db/pool.js";
import { serializeBlogPostPublic, serializeBlogNavPost } from "../utils/blogPostSerialize.js";

const router = Router();

router.get("/", async (_req, res) => {
  const base = `SELECT * FROM blog_posts
       WHERE is_published = 1
         AND (date_published IS NULL OR date_published <= CURDATE())`;
  const orderWithFeatured = `ORDER BY is_featured DESC, COALESCE(date_published, DATE(created_at)) DESC, id DESC`;
  const orderDefault = `ORDER BY COALESCE(date_published, DATE(created_at)) DESC, id DESC`;
  try {
    const [rows] = await pool.query(`${base} ${orderWithFeatured}`);
    res.json({ posts: rows.map(serializeBlogPostPublic) });
  } catch (e) {
    const missingFeatured =
      e.code === "ER_BAD_FIELD_ERROR" || e.errno === 1054 || /is_featured/.test(String(e.sqlMessage ?? e.message ?? ""));
    if (missingFeatured) {
      try {
        const [rows] = await pool.query(`${base} ${orderDefault}`);
        return res.json({ posts: rows.map(serializeBlogPostPublic) });
      } catch (e2) {
        if (e2.code === "ER_NO_SUCH_TABLE") return res.json({ posts: [] });
        return res.status(500).json({ error: "database_error", message: e2.message });
      }
    }
    if (e.code === "ER_NO_SUCH_TABLE") return res.json({ posts: [] });
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/:slug", async (req, res) => {
  const slug = String(req.params.slug || "").trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  try {
    const [[row]] = await pool.query(
      `SELECT * FROM blog_posts
       WHERE slug = ? AND is_published = 1
         AND (date_published IS NULL OR date_published <= CURDATE())
       LIMIT 1`,
      [slug]
    );
    if (!row) {
      return res.status(404).json({ error: "not_found" });
    }
    const [relatedRows] = await pool.query(
      `SELECT * FROM blog_posts
       WHERE is_published = 1 AND slug <> ?
         AND (date_published IS NULL OR date_published <= CURDATE())
       ORDER BY COALESCE(date_published, DATE(created_at)) DESC
       LIMIT 3`,
      [slug]
    );
    const [navRows] = await pool.query(
      `SELECT slug, title_en, title_bn, category_en, category_bn, excerpt_en, excerpt_bn,
              image_url, gradient, date_published, read_time_min
       FROM blog_posts
       WHERE is_published = 1 AND (date_published IS NULL OR date_published <= CURDATE())
       ORDER BY COALESCE(date_published, DATE(created_at)) ASC, id ASC`
    );
    const ni = navRows.findIndex((r) => r.slug === slug);
    const prevRow = ni > 0 ? navRows[ni - 1] : null;
    const nextRow = ni >= 0 && ni < navRows.length - 1 ? navRows[ni + 1] : null;

    res.json({
      post: serializeBlogPostPublic(row),
      related: relatedRows.map(serializeBlogPostPublic),
      navPrevious: serializeBlogNavPost(prevRow),
      navNext: serializeBlogNavPost(nextRow),
    });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(404).json({ error: "not_found" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
