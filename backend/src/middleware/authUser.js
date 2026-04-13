import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwtSecret.js";

/** Any valid JWT (admin or customer). Sets `req.user = { id, role }`. */
export function requireAuthUser(req, res, next) {
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
    const id = Number(payload.sub);
    if (!Number.isFinite(id)) {
      return res.status(401).json({ error: "invalid_token" });
    }
    req.user = { id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
