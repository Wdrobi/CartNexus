import { Router } from "express";
import { pool } from "../../db/pool.js";
import { slugify } from "../../utils/slug.js";
import { normalizeCoverImageUrl } from "../../utils/coverImageUrl.js";
import {
  dateOnly,
  estimateReadMinutes,
} from "../../utils/blogPostSerialize.js";

const router = Router();

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

/** @param {unknown} v */
function parseYmd(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  if (Number.isNaN(Date.parse(`${s}T12:00:00`))) return null;
  return s;
}

/**
 * draft | publish_now | scheduled — from explicit schedule_mode or legacy is_published + dates.
 */
function normalizeScheduleMode(b) {
  const raw = b.schedule_mode ?? b.scheduleMode;
  if (raw != null && String(raw).trim() !== "") {
    const m = String(raw).trim().toLowerCase();
    if (m === "draft" || m === "publish_now" || m === "scheduled") return m;
  }
  if (b.is_published === false || b.is_published === 0) return "draft";
  if (b.is_published === true || b.is_published === 1) {
    const sd = parseYmd(b.scheduled_date ?? b.scheduledDate);
    const t = todayYmd();
    if (sd && sd > t) return "scheduled";
    return "publish_now";
  }
  return "draft";
}

function rowToAdmin(row) {
  return {
    id: row.id,
    slug: row.slug,
    category_en: row.category_en ?? "",
    category_bn: row.category_bn ?? "",
    title_en: row.title_en,
    title_bn: row.title_bn,
    excerpt_en: row.excerpt_en ?? "",
    excerpt_bn: row.excerpt_bn ?? "",
    keywords_en: row.keywords_en ?? "",
    keywords_bn: row.keywords_bn ?? "",
    body_en: row.body_en,
    body_bn: row.body_bn,
    author: row.author,
    read_time_min: Number(row.read_time_min) || 5,
    gradient: row.gradient,
    image_url: row.image_url,
    is_published: !!row.is_published,
    is_featured: !!row.is_featured,
    date_published: dateOnly(row.date_published),
    date_modified: dateOnly(row.date_modified),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

router.get("/blog-posts", async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? "").trim();
    const sort = String(req.query.sort ?? "date_desc").toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
    const offset = (page - 1) * pageSize;

    let where = "WHERE 1=1";
    const params = [];
    if (qRaw.length > 0) {
      const like = `%${qRaw}%`;
      where +=
        " AND (title_en LIKE ? OR title_bn LIKE ? OR slug LIKE ? OR category_en LIKE ? OR category_bn LIKE ?)";
      params.push(like, like, like, like, like);
    }

    let orderSql = "ORDER BY COALESCE(date_published, DATE(created_at)) DESC, id DESC";
    if (sort === "date_asc") {
      orderSql = "ORDER BY COALESCE(date_published, DATE(created_at)) ASC, id ASC";
    } else if (sort === "title_en_asc") orderSql = "ORDER BY title_en ASC";
    else if (sort === "title_en_desc") orderSql = "ORDER BY title_en DESC";
    else if (sort === "id_desc") orderSql = "ORDER BY id DESC";
    else if (sort === "id_asc") orderSql = "ORDER BY id ASC";

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM blog_posts ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM blog_posts ${where} ${orderSql} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({
      posts: rows.map(rowToAdmin),
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.json({ posts: [], total: 0, page: 1, pageSize: 25 });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/blog-posts", async (req, res) => {
  const b = req.body || {};
  const title_en = String(b.title_en ?? "").trim();
  const title_bn = String(b.title_bn ?? "").trim();
  const body_en = String(b.body_en ?? "");
  const body_bn = String(b.body_bn ?? "");
  if (!title_en || !title_bn) {
    return res.status(400).json({ error: "missing_fields" });
  }
  let slug = b.slug ? slugify(b.slug) : slugify(title_en);
  if (!slug) slug = `post-${Date.now()}`;

  const category_en = String(b.category_en ?? "").trim();
  const category_bn = String(b.category_bn ?? "").trim();
  const excerpt_en = String(b.excerpt_en ?? "").trim();
  const excerpt_bn = String(b.excerpt_bn ?? "").trim();
  const keywords_en = String(b.keywords_en ?? "").trim().slice(0, 512);
  const keywords_bn = String(b.keywords_bn ?? "").trim().slice(0, 512);
  const author =
    String(b.author ?? "CartNexus Editorial").trim().slice(0, 160) || "CartNexus Editorial";
  let read_time_min = Number(b.read_time_min);
  if (!Number.isFinite(read_time_min) || read_time_min < 1) {
    read_time_min = estimateReadMinutes(body_en, body_bn);
  }
  read_time_min = Math.min(65535, Math.max(1, Math.floor(read_time_min)));
  const gradient = String(b.gradient ?? "from-slate-700 via-slate-800 to-ink-950")
    .trim()
    .slice(0, 160);
  const image_url = normalizeCoverImageUrl(b.image_url);
  const scheduleMode = normalizeScheduleMode(b);
  const scheduledYmd = parseYmd(b.scheduled_date ?? b.scheduledDate);
  const today = todayYmd();

  let is_published = false;
  let date_published = null;
  let is_featured = !!b.is_featured;
  if (scheduleMode === "draft") {
    is_published = false;
    date_published = null;
    is_featured = false;
  } else if (scheduleMode === "scheduled") {
    if (!scheduledYmd) {
      return res.status(400).json({ error: "invalid_scheduled_date" });
    }
    is_published = true;
    date_published = scheduledYmd;
  } else {
    is_published = true;
    date_published = today;
  }

  const date_modified = today;

  try {
    if (is_featured) {
      await pool.query(`UPDATE blog_posts SET is_featured = 0`);
    }
    const [result] = await pool.query(
      `INSERT INTO blog_posts (
        slug, category_en, category_bn, title_en, title_bn, excerpt_en, excerpt_bn,
        keywords_en, keywords_bn, body_en, body_bn, author, read_time_min, gradient,
        image_url, is_published, is_featured, date_published, date_modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        category_en,
        category_bn,
        title_en,
        title_bn,
        excerpt_en,
        excerpt_bn,
        keywords_en,
        keywords_bn,
        body_en,
        body_bn,
        author,
        read_time_min,
        gradient,
        image_url,
        is_published ? 1 : 0,
        is_featured ? 1 : 0,
        date_published,
        date_modified,
      ]
    );
    const [[row]] = await pool.query(`SELECT * FROM blog_posts WHERE id = ?`, [result.insertId]);
    res.status(201).json({ post: rowToAdmin(row) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/blog-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const b = req.body || {};
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(b, "slug")) {
    const s = slugify(b.slug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (b.category_en != null) {
    fields.push("category_en = ?");
    values.push(String(b.category_en).trim());
  }
  if (b.category_bn != null) {
    fields.push("category_bn = ?");
    values.push(String(b.category_bn).trim());
  }
  if (b.title_en != null) {
    fields.push("title_en = ?");
    values.push(String(b.title_en).trim());
  }
  if (b.title_bn != null) {
    fields.push("title_bn = ?");
    values.push(String(b.title_bn).trim());
  }
  if (b.excerpt_en != null) {
    fields.push("excerpt_en = ?");
    values.push(String(b.excerpt_en).trim());
  }
  if (b.excerpt_bn != null) {
    fields.push("excerpt_bn = ?");
    values.push(String(b.excerpt_bn).trim());
  }
  if (b.keywords_en != null) {
    fields.push("keywords_en = ?");
    values.push(String(b.keywords_en).trim().slice(0, 512));
  }
  if (b.keywords_bn != null) {
    fields.push("keywords_bn = ?");
    values.push(String(b.keywords_bn).trim().slice(0, 512));
  }
  if (b.body_en != null) {
    fields.push("body_en = ?");
    values.push(String(b.body_en));
  }
  if (b.body_bn != null) {
    fields.push("body_bn = ?");
    values.push(String(b.body_bn));
  }
  if (b.author != null) {
    fields.push("author = ?");
    values.push(String(b.author).trim().slice(0, 160) || "CartNexus Editorial");
  }
  if (b.read_time_min != null) {
    const n = Number(b.read_time_min);
    if (Number.isFinite(n) && n >= 1) {
      fields.push("read_time_min = ?");
      values.push(Math.min(65535, Math.floor(n)));
    }
  }
  if (b.gradient != null) {
    fields.push("gradient = ?");
    values.push(String(b.gradient).trim().slice(0, 160));
  }
  if (Object.prototype.hasOwnProperty.call(b, "image_url")) {
    fields.push("image_url = ?");
    values.push(normalizeCoverImageUrl(b.image_url));
  }
  if (Object.prototype.hasOwnProperty.call(b, "is_featured")) {
    const want = !!b.is_featured;
    if (want) {
      await pool.query(`UPDATE blog_posts SET is_featured = 0 WHERE id <> ?`, [id]);
    }
    fields.push("is_featured = ?");
    values.push(want ? 1 : 0);
  }

  const hasSchedulePayload =
    Object.prototype.hasOwnProperty.call(b, "schedule_mode") ||
    Object.prototype.hasOwnProperty.call(b, "scheduleMode") ||
    Object.prototype.hasOwnProperty.call(b, "scheduled_date") ||
    Object.prototype.hasOwnProperty.call(b, "scheduledDate");

  if (hasSchedulePayload) {
    const mode = normalizeScheduleMode(b);
    const scheduledYmd = parseYmd(b.scheduled_date ?? b.scheduledDate);
    const today = todayYmd();
    if (mode === "draft") {
      fields.push("is_published = ?");
      values.push(0);
      fields.push("date_published = ?");
      values.push(null);
      fields.push("is_featured = ?");
      values.push(0);
    } else if (mode === "scheduled") {
      if (!scheduledYmd) {
        return res.status(400).json({ error: "invalid_scheduled_date" });
      }
      fields.push("is_published = ?");
      values.push(1);
      fields.push("date_published = ?");
      values.push(scheduledYmd);
    } else {
      fields.push("is_published = ?");
      values.push(1);
      fields.push("date_published = ?");
      values.push(today);
    }
  } else if (b.is_published != null) {
    fields.push("is_published = ?");
    values.push(b.is_published ? 1 : 0);
    if (!b.is_published) {
      fields.push("date_published = ?");
      values.push(null);
      fields.push("is_featured = ?");
      values.push(0);
    } else {
      fields.push("date_published = ?");
      values.push(todayYmd());
    }
  }

  fields.push("date_modified = ?");
  values.push(todayYmd());

  values.push(id);
  try {
    const [result] = await pool.query(
      `UPDATE blog_posts SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [[row]] = await pool.query(`SELECT * FROM blog_posts WHERE id = ?`, [id]);
    res.json({ post: rowToAdmin(row) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/blog-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [result] = await pool.query(`DELETE FROM blog_posts WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
