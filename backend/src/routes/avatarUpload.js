import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";
import { pool } from "../db/pool.js";
import { requireAuthUser } from "../middleware/authUser.js";
import { getUsersColumnNames } from "../db/schemaInfo.js";
import { selectUserById, toPublicUser } from "../db/userQueries.js";
import { getLocalAvatarPath } from "../utils/avatarFiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");

fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const uid = req.user?.id ?? "0";
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const safe = allowed.includes(ext) ? ext : ".jpg";
    cb(null, `user-${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error("INVALID_IMAGE_TYPE"), ok);
  },
});

const router = Router();

router.post("/profile/avatar", requireAuthUser, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "file_too_large" });
      }
      return res.status(400).json({ error: "invalid_file_type" });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "missing_file" });
  }
  const uid = Number(req.user.id);
  if (!Number.isFinite(uid)) {
    await fsPromises.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ error: "invalid_id" });
  }

  const cols = await getUsersColumnNames();
  if (!cols.has("avatar_url")) {
    await fsPromises.unlink(req.file.path).catch(() => {});
    return res.status(503).json({ error: "schema_upgrade_needed" });
  }

  const publicUrl = `/uploads/avatars/${req.file.filename}`;
  let previousUrl = null;
  try {
    const row = await selectUserById(uid);
    previousUrl = row?.avatar_url != null ? String(row.avatar_url) : null;

    await pool.query(`UPDATE users SET avatar_url = ? WHERE id = ?`, [publicUrl, uid]);
    const updated = await selectUserById(uid);
    const oldPath = getLocalAvatarPath(previousUrl);
    if (oldPath && oldPath !== req.file.path) {
      await fsPromises.unlink(oldPath).catch(() => {});
    }
    res.json({ user: toPublicUser(updated) });
  } catch (e) {
    await fsPromises.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
