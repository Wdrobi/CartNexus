import { Router } from "express";
import { pool } from "../db/pool.js";
import { serializeStoreSettingsRow } from "../utils/storeSettingsSerialize.js";

const router = Router();

router.get("/store-settings", async (_req, res) => {
  try {
    const [[row]] = await pool.query(`SELECT * FROM store_settings WHERE id = 1 LIMIT 1`);
    res.json({ settings: serializeStoreSettingsRow(row) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "store_settings_table_missing",
        message: "Run db/migration_store_settings.sql",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
