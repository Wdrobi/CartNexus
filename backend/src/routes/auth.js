import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { getJwtSecret } from "../config/jwtSecret.js";
import { requireAuthUser } from "../middleware/authUser.js";
import { getUsersColumnNames } from "../db/schemaInfo.js";
import { selectUserByEmail, selectUserById, toPublicUser } from "../db/userQueries.js";
import { unlinkAvatarFileIfOwned } from "../utils/avatarFiles.js";

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
    const created = await selectUserById(id);
    res.status(201).json({
      token,
      user: toPublicUser(created),
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
    const user = await selectUserByEmail(normalized, { withPassword: true });
    if (!user) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
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
      user: toPublicUser(user),
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
    const row = await selectUserById(uid);
    if (!row) {
      return res.status(401).json({ error: "invalid_token" });
    }
    res.json({ user: toPublicUser(row) });
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
});

router.patch("/profile", requireAuthUser, async (req, res) => {
  const uid = Number(req.user.id);
  if (!Number.isFinite(uid)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const { name, email, phone, avatar_url, currentPassword, newPassword } =
    req.body || {};
  const hasName = name !== undefined;
  const hasEmail = email !== undefined;
  const hasPhone = phone !== undefined;
  const hasAvatar = avatar_url !== undefined;
  const wantsPassword =
    newPassword !== undefined && String(newPassword).length > 0;
  if (!hasName && !hasEmail && !hasPhone && !hasAvatar && !wantsPassword) {
    return res.status(400).json({ error: "no_updates" });
  }
  try {
    const row = await selectUserById(uid, { withPassword: true });
    if (!row) {
      return res.status(404).json({ error: "not_found" });
    }

    const cols = await getUsersColumnNames();
    const hasPhoneCol = cols.has("phone");
    const hasAvatarCol = cols.has("avatar_url");

    let nextName = row.name;
    let nextEmail = row.email;
    let nextPhone = row.phone;
    let nextAvatar = row.avatar_url;

    if (hasName) {
      const n = String(name).trim().slice(0, 255);
      if (!n) {
        return res.status(400).json({ error: "missing_fields" });
      }
      nextName = n;
    }
    if (hasEmail) {
      const em = String(email).trim().toLowerCase();
      if (!em) {
        return res.status(400).json({ error: "missing_fields" });
      }
      if (em !== row.email) {
        const [[dup]] = await pool.query(
          `SELECT id FROM users WHERE email = ? AND id != ?`,
          [em, uid]
        );
        if (dup) {
          return res.status(409).json({ error: "duplicate_email" });
        }
        nextEmail = em;
      }
    }
    if (hasPhone && hasPhoneCol) {
      nextPhone =
        phone === null || phone === ""
          ? null
          : String(phone).trim().slice(0, 32);
    }
    if (hasAvatar && hasAvatarCol) {
      nextAvatar =
        avatar_url === null || avatar_url === ""
          ? null
          : String(avatar_url).trim().slice(0, 512);
    }

    let nextHash = null;
    if (wantsPassword) {
      const np = String(newPassword);
      if (np.length < 8) {
        return res.status(400).json({ error: "weak_password" });
      }
      if (currentPassword == null || currentPassword === "") {
        return res.status(400).json({ error: "current_password_required" });
      }
      const ok = await bcrypt.compare(String(currentPassword), row.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "invalid_credentials" });
      }
      nextHash = await bcrypt.hash(np, 10);
    }

    const setParts = ["name = ?", "email = ?"];
    const setVals = [nextName, nextEmail];
    if (hasPhoneCol) {
      setParts.push("phone = ?");
      setVals.push(nextPhone);
    }
    if (hasAvatarCol) {
      setParts.push("avatar_url = ?");
      setVals.push(nextAvatar);
    }
    if (nextHash !== null) {
      setParts.push("password_hash = ?");
      setVals.push(nextHash);
    }
    setVals.push(uid);
    await pool.query(`UPDATE users SET ${setParts.join(", ")} WHERE id = ?`, setVals);

    if (hasAvatarCol && hasAvatar && nextAvatar === null && row.avatar_url) {
      await unlinkAvatarFileIfOwned(String(row.avatar_url));
    }

    const updated = await selectUserById(uid);
    res.json({ user: toPublicUser(updated) });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
