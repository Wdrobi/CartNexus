import { Router } from "express";
import { pool } from "../db/pool.js";
import {
  defaultHomeHero,
  serializeHomeHeroRow,
  withPublicHeroImages,
} from "../utils/homeHeroDefaults.js";

const router = Router();

router.get("/hero", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, headline_en, headline_bn, subtext_en, subtext_bn,
              cta_label_en, cta_label_bn, cta_url, image_1_url, image_2_url,
              gradient_from, gradient_to, updated_at
       FROM home_hero WHERE id = 1 LIMIT 1`
    );
    if (!rows.length) {
      return res.json({ hero: withPublicHeroImages(defaultHomeHero()) });
    }
    res.json({ hero: withPublicHeroImages(serializeHomeHeroRow(rows[0])) });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.json({ hero: withPublicHeroImages(defaultHomeHero()) });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
