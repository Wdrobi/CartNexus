import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { broadcastDashboardRefresh } from "../realtime/adminWs.js";
import { getJwtSecret } from "../config/jwtSecret.js";
import { requireAuthUser } from "../middleware/authUser.js";

const router = Router();

export const DELIVERY_FEES = {
  inside_dhaka: 60,
  dhaka_subcity: 100,
  outside_dhaka: 120,
};

/** Fee for zone keys not in {@link DELIVERY_FEES} (dynamic / future regions). */
const DEFAULT_CUSTOM_ZONE_FEE = DELIVERY_FEES.outside_dhaka;

/** Lowercase slug: letters, digits, underscores; max 64 chars to match DB column. */
const DELIVERY_ZONE_KEY_RE = /^[a-z0-9_]{1,64}$/;

function normalizeDeliveryZoneKey(raw) {
  const s = String(raw ?? "inside_dhaka")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return s || "inside_dhaka";
}

function resolveDeliveryFee(zoneKey) {
  if (Object.prototype.hasOwnProperty.call(DELIVERY_FEES, zoneKey)) {
    return DELIVERY_FEES[zoneKey];
  }
  return DEFAULT_CUSTOM_ZONE_FEE;
}

function optionalCustomerId(req, res, next) {
  req.customerUserId = null;
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return next();
  try {
    const secret = getJwtSecret();
    if (!secret) return next();
    const payload = jwt.verify(h.slice(7), secret);
    if (payload.role === "customer") {
      const id = Number(payload.sub);
      if (Number.isFinite(id)) req.customerUserId = id;
    }
  } catch {
    /* invalid token — guest checkout */
  }
  next();
}

function generateOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `CN-${t}-${r}`;
}

router.post("/", optionalCustomerId, async (req, res) => {
  const body = req.body || {};
  const {
    items: rawItems,
    customer_name,
    phone,
    delivery_address,
    delivery_zone,
    payment_method,
  } = body;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: "empty_cart" });
  }
  const name = String(customer_name || "").trim();
  const addr = String(delivery_address || "").trim();
  const phoneStr = String(phone || "").replace(/\s/g, "").trim();
  if (!name || !addr || !phoneStr) {
    return res.status(400).json({ error: "missing_shipping" });
  }
  if (phoneStr.length < 10 || phoneStr.length > 15) {
    return res.status(400).json({ error: "invalid_phone" });
  }
  const zone = normalizeDeliveryZoneKey(delivery_zone);
  if (!DELIVERY_ZONE_KEY_RE.test(zone)) {
    return res.status(400).json({ error: "invalid_delivery_zone" });
  }
  const pay = String(payment_method || "cod").toLowerCase();
  if (pay !== "cod") {
    return res.status(400).json({ error: "invalid_payment" });
  }

  const deliveryFee = resolveDeliveryFee(zone);
  const userId = req.customerUserId;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let subtotal = 0;
    /** @type {Array<{ product: object; qty: number; size: string; variantId: number | null; variantNameEn: string; variantNameBn: string; imageUrl: string | null; unitPrice: number }>} */
    const resolvedLines = [];

    for (const raw of rawItems) {
      const productId = Number(raw.productId);
      const qty = Math.max(1, Math.min(999, Math.floor(Number(raw.qty) || 1)));
      const size = String(raw.size || "ONE").trim() || "ONE";
      let variantId = raw.variantId != null && raw.variantId !== "" ? Number(raw.variantId) : null;
      if (!Number.isFinite(productId)) {
        await conn.rollback();
        return res.status(400).json({ error: "invalid_item" });
      }

      const [[p]] = await conn.query(
        `SELECT id, name_en, name_bn, slug, image_url, price, stock, is_active FROM products WHERE id = ? FOR UPDATE`,
        [productId]
      );
      if (!p || !p.is_active) {
        await conn.rollback();
        return res.status(400).json({ error: "product_unavailable", product_id: productId });
      }

      const unitPrice = Number(p.price);
      let imageUrl = p.image_url;
      let vEn = "";
      let vBn = "";

      if (variantId != null && Number.isFinite(variantId)) {
        const [[v]] = await conn.query(
          `SELECT id, product_id, name_en, name_bn, image_url, stock FROM product_color_variants WHERE id = ? FOR UPDATE`,
          [variantId]
        );
        if (!v || Number(v.product_id) !== productId) {
          await conn.rollback();
          return res.status(400).json({ error: "invalid_variant" });
        }
        if (Number(v.stock) < qty) {
          await conn.rollback();
          return res.status(409).json({ error: "insufficient_stock", product_id: productId });
        }
        imageUrl = v.image_url;
        vEn = v.name_en;
        vBn = v.name_bn;
      } else {
        variantId = null;
        if (Number(p.stock) < qty) {
          await conn.rollback();
          return res.status(409).json({ error: "insufficient_stock", product_id: productId });
        }
      }

      subtotal += unitPrice * qty;
      resolvedLines.push({
        product: p,
        qty,
        size,
        variantId,
        variantNameEn: vEn,
        variantNameBn: vBn,
        imageUrl,
        unitPrice,
      });
    }

    const total = subtotal + deliveryFee;
    let orderNumber = generateOrderNumber();
    let orderId;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [ins] = await conn.query(
          `INSERT INTO orders (user_id, order_number, customer_name, phone, delivery_address, delivery_zone, delivery_fee, subtotal, total, payment_method, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [userId, orderNumber, name, phoneStr, addr, zone, deliveryFee, subtotal, total, pay]
        );
        orderId = ins.insertId;
        break;
      } catch (e) {
        if (e.code === "ER_DUP_ENTRY" && attempt < 2) {
          orderNumber = generateOrderNumber();
          continue;
        }
        throw e;
      }
    }

    for (const line of resolvedLines) {
      const p = line.product;
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name_en, product_name_bn, slug, image_url, unit_price, qty, size, variant_id, variant_name_en, variant_name_bn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          p.id,
          p.name_en,
          p.name_bn,
          p.slug,
          line.imageUrl,
          line.unitPrice,
          line.qty,
          line.size,
          line.variantId,
          line.variantNameEn || null,
          line.variantNameBn || null,
        ]
      );

      if (line.variantId != null) {
        await conn.query(
          `UPDATE product_color_variants SET stock = stock - ? WHERE id = ? AND product_id = ?`,
          [line.qty, line.variantId, p.id]
        );
      } else {
        await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [line.qty, p.id]);
      }
    }

    await conn.commit();
    try {
      broadcastDashboardRefresh("new_order");
    } catch {
      /* non-fatal */
    }
    res.status(201).json({
      order: {
        id: orderId,
        order_number: orderNumber,
        total,
        subtotal,
        delivery_fee: deliveryFee,
      },
    });
  } catch (e) {
    await conn.rollback();
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "orders_table_missing",
        message: "Run db/migration_orders.sql on MySQL.",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  } finally {
    conn.release();
  }
});

router.get("/", requireAuthUser, async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "forbidden" });
  }
  const uid = Number(req.user.id);
  if (!Number.isFinite(uid)) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at, o.subtotal, o.delivery_fee,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC
       LIMIT 100`,
      [uid]
    );
    res.json({ orders: rows });
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "orders_table_missing",
        message: "Run db/migration_orders.sql on MySQL.",
      });
    }
    res.status(500).json({ error: "database_error", message: e.message });
  }
});

export default router;
