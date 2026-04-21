import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
  const b = req.body || {};
  const firstName = String(b.firstName || "").trim();
  const lastName = String(b.lastName || "").trim();
  const email = String(b.email || "").trim();
  const subject = String(b.subject || "").trim();
  const message = String(b.message || "").trim();

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (firstName.length > 120 || lastName.length > 120) {
    return res.status(400).json({ error: "name_too_long" });
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (subject.length > 200) {
    return res.status(400).json({ error: "subject_too_long" });
  }
  if (message.length > 8000) {
    return res.status(400).json({ error: "message_too_long" });
  }

  try {
    await pool.query(
      `INSERT INTO contact_messages (first_name, last_name, email, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, subject, message]
    );
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "contact_table_missing",
        message: "Run db/migration_contact_messages.sql on the server database.",
      });
    }
    console.error("[contact] insert failed", e);
    return res.status(500).json({ error: "server_error" });
  }

  const preview = message.length > 300 ? `${message.slice(0, 300)}…` : message;
  console.log(
    `[contact] ${new Date().toISOString()} | ${email} | ${subject} | ${firstName} ${lastName}\n${preview}`
  );

  res.json({ ok: true });
});

export default router;
