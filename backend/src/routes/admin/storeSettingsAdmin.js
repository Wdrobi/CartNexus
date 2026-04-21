import { Router } from "express";
import { pool } from "../../db/pool.js";
import { serializeStoreSettingsRow } from "../../utils/storeSettingsSerialize.js";

const router = Router();

function trimOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** @param {unknown} v @param {{ max?: number }} [opts] */
function trimString(v, opts = {}) {
  const max = opts.max ?? 4096;
  if (v == null) return null;
  const s = String(v).trim().slice(0, max);
  return s === "" ? null : s;
}

/** @param {unknown} v */
function normalizeUrl(v) {
  const s = trimOrNull(v);
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s.slice(0, 512);
  if (s.startsWith("//")) return `https:${s}`.slice(0, 512);
  return `https://${s}`.slice(0, 512);
}

/** @param {unknown} v */
function normalizeMessengerUrl(v) {
  const s = trimOrNull(v);
  if (!s) return null;
  const withProto = /^https?:\/\//i.test(s) ? s : s.startsWith("//") ? `https:${s}` : `https://${s}`;
  return withProto.slice(0, 512);
}

/** @param {unknown} v */
function normalizeDigits(v) {
  if (v == null || v === "") return null;
  const d = String(v).replace(/\D/g, "");
  return d.length >= 8 && d.length <= 20 ? d : null;
}

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

router.patch("/store-settings", async (req, res) => {
  const b = req.body || {};

  const next = {
    contact_address_en: trimString(b.contact_address_en ?? b.contactAddressEn, { max: 8000 }),
    contact_address_bn: trimString(b.contact_address_bn ?? b.contactAddressBn, { max: 8000 }),
    contact_phone: trimString(b.contact_phone ?? b.contactPhone, { max: 64 }),
    contact_email: trimString(b.contact_email ?? b.contactEmail, { max: 255 }),
    business_hours_en: trimString(b.business_hours_en ?? b.businessHoursEn, { max: 8000 }),
    business_hours_bn: trimString(b.business_hours_bn ?? b.businessHoursBn, { max: 8000 }),
    social_facebook_url: normalizeUrl(b.social_facebook_url ?? b.socialFacebookUrl),
    social_instagram_url: normalizeUrl(b.social_instagram_url ?? b.socialInstagramUrl),
    social_youtube_url: normalizeUrl(b.social_youtube_url ?? b.socialYoutubeUrl),
    social_other_url: normalizeUrl(b.social_other_url ?? b.socialOtherUrl),
    map_embed_url: trimString(b.map_embed_url ?? b.mapEmbedUrl, { max: 1024 }),
    map_external_url: normalizeUrl(b.map_external_url ?? b.mapExternalUrl),
    whatsapp_digits: normalizeDigits(b.whatsapp_digits ?? b.whatsappDigits),
    whatsapp_prefill: trimString(b.whatsapp_prefill ?? b.whatsappPrefill, { max: 600 }),
    messenger_url: normalizeMessengerUrl(b.messenger_url ?? b.messengerUrl),
  };

  const cols = Object.keys(next);
  if (!cols.length) {
    return res.status(400).json({ error: "no_updates" });
  }
  const vals = Object.values(next);
  const setSql = cols.map((c) => `${c} = ?`).join(", ");

  try {
    const [[existing]] = await pool.query(`SELECT id FROM store_settings WHERE id = 1 LIMIT 1`);
    if (existing) {
      await pool.query(`UPDATE store_settings SET ${setSql} WHERE id = 1`, vals);
    } else {
      await pool.query(
        `INSERT INTO store_settings (id, ${cols.join(", ")}) VALUES (1, ${cols.map(() => "?").join(", ")})`,
        vals
      );
    }
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
