import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public: subscribe from footer or other forms */
router.post("/subscribe", async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || "").trim().toLowerCase();
  const source = String(b.source || "footer").trim().slice(0, 64) || "footer";

  if (!email) {
    return res.status(400).json({ error: "missing_email" });
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    return res.status(400).json({ error: "invalid_email" });
  }

  try {
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, source) VALUES (?, ?)`,
      [email, source]
    );
    return res.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.json({ ok: true, duplicate: true });
    }
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "newsletter_table_missing",
        message: "Run db/migration_newsletter_subscribers.sql",
      });
    }
    console.error("[newsletter] insert failed", e);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
