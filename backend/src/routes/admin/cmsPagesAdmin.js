import { Router } from "express";
import { pool } from "../../db/pool.js";

const router = Router();

const ALLOWED = new Set(["terms", "faqs", "privacy"]);

function serialize(row) {
  if (!row) return null;
  return {
    pageKey: row.page_key,
    bodyHtmlEn: row.body_html_en ?? "",
    bodyHtmlBn: row.body_html_bn ?? "",
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

router.get("/cms-pages", async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM cms_pages ORDER BY page_key ASC`);
    res.json({ pages: rows.map(serialize) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ error: "cms_table_missing", message: "Run db/migration_cms_pages.sql" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/cms-pages/:key", async (req, res) => {
  const key = String(req.params.key || "").trim().toLowerCase();
  if (!ALLOWED.has(key)) {
    return res.status(404).json({ error: "not_found" });
  }
  try {
    const [[row]] = await pool.query(`SELECT * FROM cms_pages WHERE page_key = ? LIMIT 1`, [key]);
    if (!row) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ page: serialize(row) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ error: "cms_table_missing", message: "Run db/migration_cms_pages.sql" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/cms-pages/:key", async (req, res) => {
  const key = String(req.params.key || "").trim().toLowerCase();
  if (!ALLOWED.has(key)) {
    return res.status(404).json({ error: "not_found" });
  }
  const body = req.body || {};
  const en =
    Object.prototype.hasOwnProperty.call(body, "body_html_en") || Object.prototype.hasOwnProperty.call(body, "bodyHtmlEn")
      ? String(body.body_html_en ?? body.bodyHtmlEn ?? "")
      : undefined;
  const bn =
    Object.prototype.hasOwnProperty.call(body, "body_html_bn") || Object.prototype.hasOwnProperty.call(body, "bodyHtmlBn")
      ? String(body.body_html_bn ?? body.bodyHtmlBn ?? "")
      : undefined;
  if (en === undefined && bn === undefined) {
    return res.status(400).json({ error: "no_updates" });
  }

  const maxLen = 800_000;
  if (en != null && en.length > maxLen) {
    return res.status(400).json({ error: "body_too_large" });
  }
  if (bn != null && bn.length > maxLen) {
    return res.status(400).json({ error: "body_too_large" });
  }

  try {
    const [[existing]] = await pool.query(
      `SELECT body_html_en, body_html_bn FROM cms_pages WHERE page_key = ? LIMIT 1`,
      [key]
    );
    const prevEn = existing?.body_html_en ?? null;
    const prevBn = existing?.body_html_bn ?? null;
    const nextEn = en !== undefined ? (en.trim() === "" ? null : en) : prevEn;
    const nextBn = bn !== undefined ? (bn.trim() === "" ? null : bn) : prevBn;

    await pool.query(
      `INSERT INTO cms_pages (page_key, body_html_en, body_html_bn) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE body_html_en = VALUES(body_html_en), body_html_bn = VALUES(body_html_bn)`,
      [key, nextEn, nextBn]
    );

    const [[row]] = await pool.query(`SELECT * FROM cms_pages WHERE page_key = ? LIMIT 1`, [key]);
    res.json({ page: serialize(row) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ error: "cms_table_missing", message: "Run db/migration_cms_pages.sql" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
