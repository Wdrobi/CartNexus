import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuthUser } from "../middleware/authUser.js";

const router = Router();

async function clearDefaultExcept(uid, exceptId) {
  await pool.query(
    `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id != ?`,
    [uid, exceptId]
  );
}

router.get("/addresses", requireAuthUser, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, label, recipient_name, phone, line1, line2, city, area, postal_code, country, is_default, created_at
       FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`,
      [uid]
    );
    res.json({ addresses: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/addresses", requireAuthUser, async (req, res) => {
  const uid = Number(req.user.id);
  const b = req.body || {};
  const label = String(b.label || "Home").trim().slice(0, 64) || "Home";
  const recipient_name = String(b.recipient_name || "").trim().slice(0, 255);
  const line1 = String(b.line1 || "").trim().slice(0, 255);
  const city = String(b.city || "").trim().slice(0, 128);
  if (!recipient_name || !line1 || !city) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const phone =
    b.phone === null || b.phone === ""
      ? null
      : String(b.phone).trim().slice(0, 32);
  const line2 =
    b.line2 === null || b.line2 === ""
      ? null
      : String(b.line2).trim().slice(0, 255);
  const area =
    b.area === null || b.area === ""
      ? null
      : String(b.area).trim().slice(0, 128);
  const postal_code =
    b.postal_code === null || b.postal_code === ""
      ? null
      : String(b.postal_code).trim().slice(0, 32);
  const country = String(b.country || "Bangladesh").trim().slice(0, 64) || "Bangladesh";
  const setDefault = b.is_default === true || b.is_default === 1;

  try {
    if (setDefault) {
      await pool.query(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [uid]);
    }
    const [result] = await pool.query(
      `INSERT INTO user_addresses (
        user_id, label, recipient_name, phone, line1, line2, city, area, postal_code, country, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        label,
        recipient_name,
        phone,
        line1,
        line2,
        city,
        area,
        postal_code,
        country,
        setDefault ? 1 : 0,
      ]
    );
    const newId = Number(result.insertId);
    if (!setDefault) {
      const [[{ c }]] = await pool.query(
        `SELECT COUNT(*) AS c FROM user_addresses WHERE user_id = ?`,
        [uid]
      );
      if (Number(c) === 1) {
        await pool.query(`UPDATE user_addresses SET is_default = 1 WHERE id = ?`, [newId]);
      }
    }
    const [[row]] = await pool.query(`SELECT * FROM user_addresses WHERE id = ?`, [newId]);
    res.status(201).json({ address: row });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/addresses/:id", requireAuthUser, async (req, res) => {
  const uid = Number(req.user.id);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const [[existing]] = await pool.query(
    `SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`,
    [id, uid]
  );
  if (!existing) {
    return res.status(404).json({ error: "not_found" });
  }
  const b = req.body || {};
  const fields = [];
  const values = [];

  if (b.label !== undefined) {
    const label = String(b.label).trim().slice(0, 64);
    if (!label) return res.status(400).json({ error: "missing_fields" });
    fields.push("label = ?");
    values.push(label);
  }
  if (b.recipient_name !== undefined) {
    const v = String(b.recipient_name).trim().slice(0, 255);
    if (!v) return res.status(400).json({ error: "missing_fields" });
    fields.push("recipient_name = ?");
    values.push(v);
  }
  if (b.phone !== undefined) {
    fields.push("phone = ?");
    values.push(
      b.phone === null || b.phone === ""
        ? null
        : String(b.phone).trim().slice(0, 32)
    );
  }
  if (b.line1 !== undefined) {
    const v = String(b.line1).trim().slice(0, 255);
    if (!v) return res.status(400).json({ error: "missing_fields" });
    fields.push("line1 = ?");
    values.push(v);
  }
  if (b.line2 !== undefined) {
    fields.push("line2 = ?");
    values.push(
      b.line2 === null || b.line2 === ""
        ? null
        : String(b.line2).trim().slice(0, 255)
    );
  }
  if (b.city !== undefined) {
    const v = String(b.city).trim().slice(0, 128);
    if (!v) return res.status(400).json({ error: "missing_fields" });
    fields.push("city = ?");
    values.push(v);
  }
  if (b.area !== undefined) {
    fields.push("area = ?");
    values.push(
      b.area === null || b.area === ""
        ? null
        : String(b.area).trim().slice(0, 128)
    );
  }
  if (b.postal_code !== undefined) {
    fields.push("postal_code = ?");
    values.push(
      b.postal_code === null || b.postal_code === ""
        ? null
        : String(b.postal_code).trim().slice(0, 32)
    );
  }
  if (b.country !== undefined) {
    const v = String(b.country).trim().slice(0, 64);
    if (!v) return res.status(400).json({ error: "missing_fields" });
    fields.push("country = ?");
    values.push(v);
  }
  if (b.is_default !== undefined) {
    const def = b.is_default === true || b.is_default === 1;
    if (def) {
      await pool.query(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [uid]);
    }
    fields.push("is_default = ?");
    values.push(def ? 1 : 0);
  }

  if (!fields.length) {
    return res.status(400).json({ error: "no_updates" });
  }

  values.push(id);
  values.push(uid);

  try {
    await pool.query(
      `UPDATE user_addresses SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );
    const [[row]] = await pool.query(`SELECT * FROM user_addresses WHERE id = ?`, [id]);
    res.json({ address: row });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/addresses/:id", requireAuthUser, async (req, res) => {
  const uid = Number(req.user.id);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [[row]] = await pool.query(
      `SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ?`,
      [id, uid]
    );
    if (!row) {
      return res.status(404).json({ error: "not_found" });
    }
    const wasDefault = Number(row.is_default) === 1;
    await pool.query(`DELETE FROM user_addresses WHERE id = ? AND user_id = ?`, [id, uid]);
    if (wasDefault) {
      const [[next]] = await pool.query(
        `SELECT id FROM user_addresses WHERE user_id = ? ORDER BY id ASC LIMIT 1`,
        [uid]
      );
      if (next) {
        await pool.query(`UPDATE user_addresses SET is_default = 1 WHERE id = ?`, [next.id]);
      }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
