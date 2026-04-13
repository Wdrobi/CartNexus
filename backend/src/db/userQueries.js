import { pool } from "./pool.js";
import { getUsersColumnNames } from "./schemaInfo.js";

async function selectFields(includePassword) {
  const cols = await getUsersColumnNames();
  const parts = ["id", "email", "role", "name"];
  if (includePassword) parts.splice(2, 0, "password_hash");
  if (cols.has("phone")) parts.push("phone");
  if (cols.has("avatar_url")) parts.push("avatar_url");
  if (cols.has("created_at")) parts.push("created_at");
  return parts;
}

export async function selectUserById(id, { withPassword = false } = {}) {
  const fields = await selectFields(withPassword);
  const [rows] = await pool.query(`SELECT ${fields.join(", ")} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function selectUserByEmail(email, { withPassword = false } = {}) {
  const fields = await selectFields(withPassword);
  const [rows] = await pool.query(`SELECT ${fields.join(", ")} FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0] || null;
}

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    phone: row.phone != null ? row.phone : null,
    avatar_url: row.avatar_url != null ? row.avatar_url : null,
    created_at: row.created_at != null ? row.created_at : null,
  };
}
