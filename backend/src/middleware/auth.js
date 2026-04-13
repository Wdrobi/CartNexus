import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwtSecret.js";

export function requireAdmin(req, res, next) {
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
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    const uid = Number(payload.sub);
    req.user = { id: Number.isFinite(uid) ? uid : payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
