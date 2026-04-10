import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { getJwtSecret } from "../config/jwtSecret.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const displayName = String(name).trim().slice(0, 255);
  const normalized = String(email).trim().toLowerCase();
  const pw = String(password);
  if (!displayName || !normalized) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (pw.length < 8) {
    return res.status(400).json({ error: "weak_password" });
  }
  try {
    const hash = await bcrypt.hash(pw, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, 'customer', ?)`,
      [normalized, hash, displayName]
    );
    const id = Number(result.insertId);
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(500).json({ error: "server_misconfigured" });
    }
    const token = jwt.sign({ sub: id, role: "customer" }, secret, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: {
        id,
        email: normalized,
        role: "customer",
        name: displayName,
      },
    });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_email" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  let normalized = String(email).trim().toLowerCase();
  if (normalized === "admin") {
    normalized = "admin@cartnexus.local";
  }
  try {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash, role, name FROM users WHERE email = ?`,
      [normalized]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(500).json({ error: "server_misconfigured" });
    }
    const token = jwt.sign(
      { sub: Number(user.id), role: user.role },
      secret,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/me", async (req, res) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(500).json({ error: "server_misconfigured" });
    }
    const payload = jwt.verify(h.slice(7), secret);
    const uid = Number(payload.sub);
    if (!Number.isFinite(uid)) {
      return res.status(401).json({ error: "invalid_token" });
    }
    const [rows] = await pool.query(
      `SELECT id, email, role, name FROM users WHERE id = ?`,
      [uid]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "invalid_token" });
    }
    res.json({ user: rows[0] });
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
});

export default router;
