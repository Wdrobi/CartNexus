import { Router } from "express";
import { pool } from "../../db/pool.js";

const router = Router();

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

router.get("/contact-messages", async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
  const offset = (page - 1) * pageSize;
  const qRaw = String(req.query.q ?? "").trim();

  let where = "WHERE 1=1";
  const params = [];
  if (qRaw.length > 0) {
    const like = `%${qRaw}%`;
    where +=
      " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)";
    params.push(like, like, like, like, like);
  }

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM contact_messages ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, subject, message, created_at
       FROM contact_messages
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({
      messages: rows.map(serialize),
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "contact_messages_table_missing",
        message: "Run db/migration_contact_messages.sql",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/contact-messages/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [[row]] = await pool.query(
      `SELECT id, first_name, last_name, email, subject, message, created_at
       FROM contact_messages WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!row) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ message: serialize(row) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "contact_messages_table_missing",
        message: "Run db/migration_contact_messages.sql",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
