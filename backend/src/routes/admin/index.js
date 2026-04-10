import { Router } from "express";
import { pool } from "../../db/pool.js";
import { slugify } from "../../utils/slug.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [[{ c: categories }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM categories`
    );
    const [[{ p: products }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products`
    );
    const [[{ a: activeProducts }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products WHERE is_active = 1`
    );
    const [[{ u: users }]] = await pool.query(`SELECT COUNT(*) AS c FROM users`);

    res.json({
      categories: Number(categories),
      products: Number(products),
      activeProducts: Number(activeProducts),
      users: Number(users),
    });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at
       FROM categories
       ORDER BY sort_order ASC, id ASC`
    );
    res.json({ categories: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/categories", async (req, res) => {
  const { name_bn, name_en, slug: rawSlug, sort_order } = req.body || {};
  if (!name_bn || !name_en) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const order = sort_order != null ? Number(sort_order) : 0;
  try {
    const [result] = await pool.query(
      `INSERT INTO categories (name_bn, name_en, slug, sort_order)
       VALUES (?, ?, ?, ?)`,
      [name_bn, name_en, slug, Number.isFinite(order) ? order : 0]
    );
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at FROM categories WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({ category: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const { name_bn, name_en, slug: rawSlug, sort_order } = req.body || {};
  const fields = [];
  const values = [];
  if (name_bn != null) {
    fields.push("name_bn = ?");
    values.push(name_bn);
  }
  if (name_en != null) {
    fields.push("name_en = ?");
    values.push(name_en);
  }
  if (rawSlug != null) {
    const s = slugify(rawSlug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (sort_order != null) {
    fields.push("sort_order = ?");
    values.push(Number(sort_order));
  }
  if (!fields.length) {
    return res.status(400).json({ error: "no_updates" });
  }
  values.push(id);
  try {
    const [result] = await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [rows] = await pool.query(
      `SELECT id, name_bn, name_en, slug, sort_order, created_at FROM categories WHERE id = ?`,
      [id]
    );
    res.json({ category: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [[{ c }]] = await pool.query(
      `SELECT COUNT(*) AS c FROM products WHERE category_id = ?`,
      [id]
    );
    if (Number(c) > 0) {
      return res.status(409).json({ error: "category_has_products" });
    }
    const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.get("/products", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.is_active, p.created_at,
              c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ORDER BY p.id DESC`
    );
    res.json({ products: rows });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.post("/products", async (req, res) => {
  const b = req.body || {};
  const {
    category_id,
    brand_id: brandIdRaw,
    name_bn,
    name_en,
    slug: rawSlug,
    description_bn,
    description_en,
    price,
    compare_at_price,
    image_url,
    stock,
    is_active,
  } = b;
  if (!category_id || !name_bn || !name_en || price == null) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const slug = rawSlug ? slugify(rawSlug) : slugify(name_en);
  if (!slug) {
    return res.status(400).json({ error: "invalid_slug" });
  }
  const catId = Number(category_id);
  if (!Number.isFinite(catId)) {
    return res.status(400).json({ error: "invalid_category" });
  }
  const pr = Number(price);
  if (!Number.isFinite(pr) || pr < 0) {
    return res.status(400).json({ error: "invalid_price" });
  }
  const st = stock != null ? Number(stock) : 0;
  const active = is_active === false || is_active === 0 ? 0 : 1;
  let brandId = null;
  if (brandIdRaw !== undefined && brandIdRaw !== null && brandIdRaw !== "") {
    const bid = Number(brandIdRaw);
    if (!Number.isFinite(bid) || bid < 1) {
      return res.status(400).json({ error: "invalid_brand" });
    }
    brandId = bid;
  }
  let compare = compare_at_price;
  if (compare != null && compare !== "") {
    compare = Number(compare);
    if (!Number.isFinite(compare)) {
      return res.status(400).json({ error: "invalid_compare_price" });
    }
  } else {
    compare = null;
  }

  try {
    const [[cat]] = await pool.query(`SELECT id FROM categories WHERE id = ?`, [
      catId,
    ]);
    if (!cat) {
      return res.status(400).json({ error: "category_not_found" });
    }
    if (brandId != null) {
      const [[br]] = await pool.query(`SELECT id FROM brands WHERE id = ?`, [brandId]);
      if (!br) {
        return res.status(400).json({ error: "brand_not_found" });
      }
    }
    const [result] = await pool.query(
      `INSERT INTO products (
        category_id, brand_id, name_bn, name_en, slug, description_bn, description_en,
        price, compare_at_price, image_url, stock, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catId,
        brandId,
        name_bn,
        name_en,
        slug,
        description_bn ?? null,
        description_en ?? null,
        pr,
        compare,
        image_url || null,
        Number.isFinite(st) && st >= 0 ? st : 0,
        active,
      ]
    );
    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.is_active, p.created_at,
              c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ product: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.patch("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const b = req.body || {};
  const fields = [];
  const values = [];

  if (b.category_id != null) {
    fields.push("category_id = ?");
    values.push(Number(b.category_id));
  }
  if (b.brand_id !== undefined) {
    if (b.brand_id === null || b.brand_id === "") {
      fields.push("brand_id = ?");
      values.push(null);
    } else {
      const bid = Number(b.brand_id);
      if (!Number.isFinite(bid) || bid < 1) {
        return res.status(400).json({ error: "invalid_brand" });
      }
      fields.push("brand_id = ?");
      values.push(bid);
    }
  }
  if (b.name_bn != null) {
    fields.push("name_bn = ?");
    values.push(b.name_bn);
  }
  if (b.name_en != null) {
    fields.push("name_en = ?");
    values.push(b.name_en);
  }
  if (b.slug != null) {
    const s = slugify(b.slug);
    if (!s) return res.status(400).json({ error: "invalid_slug" });
    fields.push("slug = ?");
    values.push(s);
  }
  if (b.description_bn !== undefined) {
    fields.push("description_bn = ?");
    values.push(b.description_bn);
  }
  if (b.description_en !== undefined) {
    fields.push("description_en = ?");
    values.push(b.description_en);
  }
  if (b.price != null) {
    const pr = Number(b.price);
    if (!Number.isFinite(pr) || pr < 0) {
      return res.status(400).json({ error: "invalid_price" });
    }
    fields.push("price = ?");
    values.push(pr);
  }
  if (b.compare_at_price !== undefined) {
    if (b.compare_at_price === null || b.compare_at_price === "") {
      fields.push("compare_at_price = ?");
      values.push(null);
    } else {
      const c = Number(b.compare_at_price);
      if (!Number.isFinite(c)) {
        return res.status(400).json({ error: "invalid_compare_price" });
      }
      fields.push("compare_at_price = ?");
      values.push(c);
    }
  }
  if (b.image_url !== undefined) {
    fields.push("image_url = ?");
    values.push(b.image_url || null);
  }
  if (b.stock != null) {
    const st = Number(b.stock);
    if (!Number.isFinite(st) || st < 0) {
      return res.status(400).json({ error: "invalid_stock" });
    }
    fields.push("stock = ?");
    values.push(st);
  }
  if (b.is_active !== undefined && b.is_active !== null) {
    fields.push("is_active = ?");
    values.push(b.is_active === false || b.is_active === 0 ? 0 : 1);
  }

  if (!fields.length) {
    return res.status(400).json({ error: "no_updates" });
  }
  values.push(id);

  try {
    if (b.category_id != null) {
      const [[cat]] = await pool.query(`SELECT id FROM categories WHERE id = ?`, [
        Number(b.category_id),
      ]);
      if (!cat) {
        return res.status(400).json({ error: "category_not_found" });
      }
    }
    if (b.brand_id !== undefined && b.brand_id !== null && b.brand_id !== "") {
      const [[br]] = await pool.query(`SELECT id FROM brands WHERE id = ?`, [
        Number(b.brand_id),
      ]);
      if (!br) {
        return res.status(400).json({ error: "brand_not_found" });
      }
    }
    const [result] = await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    const [rows] = await pool.query(
      `SELECT p.id, p.category_id, p.brand_id, p.name_bn, p.name_en, p.slug,
              p.description_bn, p.description_en, p.price, p.compare_at_price,
              p.image_url, p.stock, p.is_active, p.created_at,
              c.name_bn AS category_name_bn, c.name_en AS category_name_en,
              b.name_bn AS brand_name_bn, b.name_en AS brand_name_en, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.id = ?`,
      [id]
    );
    res.json({ product: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "duplicate_slug" });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
