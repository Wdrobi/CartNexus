import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");

/** Absolute path for a stored avatar, or null if not under avatars/. */
export function getLocalAvatarPath(publicUrl) {
  if (!publicUrl || typeof publicUrl !== "string") return null;
  if (!publicUrl.startsWith("/uploads/avatars/")) return null;
  const base = path.basename(publicUrl);
  if (!base || base.includes("..")) return null;
  const full = path.join(avatarsDir, base);
  if (!full.startsWith(avatarsDir)) return null;
  return full;
}

export async function unlinkAvatarFileIfOwned(publicUrl) {
  const p = getLocalAvatarPath(publicUrl);
  if (p) await fs.unlink(p).catch(() => {});
}
