import { Router } from "express";
import { pool } from "../../db/pool.js";

const router = Router();

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

router.get("/newsletter-subscribers", async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
  const offset = (page - 1) * pageSize;
  const qRaw = String(req.query.q ?? "").trim();

  let where = "WHERE 1=1";
  const params = [];
  if (qRaw.length > 0) {
    const like = `%${qRaw}%`;
    where += " AND (email LIKE ? OR source LIKE ?)";
    params.push(like, like);
  }

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT id, email, source, created_at
       FROM newsletter_subscribers
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({
      subscribers: rows.map(serialize),
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "newsletter_subscribers_table_missing",
        message: "Run db/migration_newsletter_subscribers.sql",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
