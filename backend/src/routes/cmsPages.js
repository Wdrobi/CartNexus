import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

const ALLOWED = new Set(["terms", "faqs", "privacy"]);

function serialize(row) {
  if (!row) return null;
  return {
    pageKey: row.page_key,
    bodyHtmlEn: row.body_html_en,
    bodyHtmlBn: row.body_html_bn,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

/** Public: single page (may be empty — storefront falls back to static copy). */
router.get("/pages/:key", async (req, res) => {
  const key = String(req.params.key || "").trim().toLowerCase();
  if (!ALLOWED.has(key)) {
    return res.status(404).json({ error: "not_found" });
  }
  try {
    const [[row]] = await pool.query(`SELECT * FROM cms_pages WHERE page_key = ? LIMIT 1`, [key]);
    if (!row) {
      return res.json({ page: { pageKey: key, bodyHtmlEn: null, bodyHtmlBn: null, updatedAt: null } });
    }
    res.json({ page: serialize(row) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ error: "cms_table_missing", message: "Run db/migration_cms_pages.sql" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
