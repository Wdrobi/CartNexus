import { pool } from "./pool.js";

let usersColumnsPromise = null;

/** Cached column names for `users` in the current database (fixes old DBs missing phone/avatar_url). */
export async function getUsersColumnNames() {
  if (!usersColumnsPromise) {
    usersColumnsPromise = pool
      .query(
        `SELECT COLUMN_NAME AS c FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
      )
      .then(([rows]) => new Set(rows.map((r) => r.c)))
      .catch(() => new Set(["id", "email", "password_hash", "role", "name", "created_at"]));
  }
  return usersColumnsPromise;
}

/** Call after migrations if you need fresh column detection in the same process. */
export function clearUsersColumnCache() {
  usersColumnsPromise = null;
}
