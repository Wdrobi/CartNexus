import { pool } from "../db/pool.js";

/**
 * @param {import("mysql2/promise").Pool} db
 */
async function tableExists(db, tableName) {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    return Number(rows[0]?.c) > 0;
  } catch {
    return false;
  }
}

/**
 * @param {number} n
 * @param {Array<{ d?: Date | string; total?: unknown }>} rows
 * @param {string} valueKey
 * @param {Date | string} serverCurDate — from MySQL CURDATE()
 */
function fillLastNDaysFromServer(n, rows, valueKey, serverCurDate) {
  const map = new Map();
  for (const r of rows || []) {
    let d = r.d;
    if (d instanceof Date) {
      d = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      d = String(d).slice(0, 10);
    }
    map.set(d, Number(r[valueKey]) || 0);
  }
  const anchor =
    serverCurDate instanceof Date
      ? serverCurDate
      : new Date(String(serverCurDate).slice(0, 10) + "T12:00:00");
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(anchor);
    dt.setDate(dt.getDate() - i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    out.push({ date: key, total: map.get(key) ?? 0 });
  }
  return out;
}

/**
 * Every calendar day from `fromIso` to `toIso` inclusive (YYYY-MM-DD).
 * @param {string} fromIso
 * @param {string} toIso
 * @param {Array<{ d?: Date | string; total?: unknown }>} rows
 * @param {string} valueKey
 */
function fillDateRangeInclusive(fromIso, toIso, rows, valueKey) {
  const map = new Map();
  for (const r of rows || []) {
    let d = r.d;
    if (d instanceof Date) {
      d = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      d = String(d).slice(0, 10);
    }
    map.set(d, Number(r[valueKey]) || 0);
  }
  const a = parseYMD(fromIso);
  const b = parseYMD(toIso);
  if (!a || !b) return [];
  let x = new Date(a.y, a.m - 1, a.d);
  const end = new Date(b.y, b.m - 1, b.d);
  if (x > end) return [];
  const out = [];
  const maxDays = 400;
  let count = 0;
  while (x <= end && count < maxDays) {
    const key = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    out.push({ date: key, total: map.get(key) ?? 0 });
    x.setDate(x.getDate() + 1);
    count += 1;
  }
  return out;
}

function parseYMD(s) {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  return { y, m: mo, d };
}

/**
 * @param {{ revenueFrom?: string, revenueTo?: string }} opts
 * @param {Date | string} serverCurDate
 * @returns {{ revenueFrom: string, revenueTo: string }}
 */
function resolveRevenueDayRange(opts, serverCurDate) {
  const anchor =
    serverCurDate instanceof Date
      ? serverCurDate
      : new Date(String(serverCurDate).slice(0, 10) + "T12:00:00");
  const y = anchor.getFullYear();
  const mo = anchor.getMonth() + 1;
  const dd = anchor.getDate();
  const defaultTo = `${y}-${String(mo).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const defaultFrom = `${y}-${String(mo).padStart(2, "0")}-01`;

  let fromStr =
    opts.revenueFrom != null && String(opts.revenueFrom).trim() !== ""
      ? String(opts.revenueFrom).trim().slice(0, 10)
      : defaultFrom;
  let toStr =
    opts.revenueTo != null && String(opts.revenueTo).trim() !== "" ? String(opts.revenueTo).trim().slice(0, 10) : defaultTo;

  if (!parseYMD(fromStr)) fromStr = defaultFrom;
  if (!parseYMD(toStr)) toStr = defaultTo;

  let a = parseYMD(fromStr);
  let b = parseYMD(toStr);
  if (!a || !b) {
    return { revenueFrom: defaultFrom, revenueTo: defaultTo };
  }
  const tA = new Date(a.y, a.m - 1, a.d);
  const tB = new Date(b.y, b.m - 1, b.d);
  if (tA > tB) {
    const tmp = fromStr;
    fromStr = toStr;
    toStr = tmp;
    a = parseYMD(fromStr);
    b = parseYMD(toStr);
  }

  const startD = new Date(a.y, a.m - 1, a.d);
  const endD = new Date(b.y, b.m - 1, b.d);
  const days = Math.floor((endD - startD) / 86400000) + 1;
  if (days > 400) {
    const ns = new Date(endD);
    ns.setDate(ns.getDate() - 399);
    fromStr = `${ns.getFullYear()}-${String(ns.getMonth() + 1).padStart(2, "0")}-${String(ns.getDate()).padStart(2, "0")}`;
  }

  return { revenueFrom: fromStr, revenueTo: toStr };
}

/**
 * Last N calendar months (including current), keyed YYYY-MM.
 * @param {number} n
 * @param {Array<{ ym?: Date | string; total?: unknown }>} rows
 * @param {string} valueKey
 * @param {Date | string} serverCurDate — from MySQL CURDATE()
 */
function fillLastNMonthsFromServer(n, rows, valueKey, serverCurDate) {
  const map = new Map();
  for (const r of rows || []) {
    let k = r.ym;
    if (k instanceof Date) {
      k = `${k.getFullYear()}-${String(k.getMonth() + 1).padStart(2, "0")}`;
    } else {
      k = String(k).slice(0, 7);
    }
    map.set(k, Number(r[valueKey]) || 0);
  }
  const anchor =
    serverCurDate instanceof Date
      ? new Date(serverCurDate)
      : new Date(String(serverCurDate).slice(0, 10) + "T12:00:00");
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ month: key, total: map.get(key) ?? 0 });
  }
  return out;
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {number|string|undefined} userId
 * @returns {Promise<Record<string, boolean>>}
 */
export async function getAdminTaskCompletions(db, userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return {};
  if (!(await tableExists(db, "admin_task_completions"))) return {};
  const [rows] = await db.query(`SELECT task_key, done FROM admin_task_completions WHERE user_id = ?`, [uid]);
  const out = {};
  for (const r of rows || []) {
    out[String(r.task_key)] = Boolean(r.done);
  }
  return out;
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {number|string} userId
 * @param {string} taskKey
 * @param {boolean} done
 */
export async function upsertAdminTaskCompletion(db, userId, taskKey, done) {
  const uid = Number(userId);
  const key = String(taskKey || "").slice(0, 190);
  if (!Number.isFinite(uid) || uid <= 0 || !key) {
    throw new Error("invalid_task_payload");
  }
  if (!(await tableExists(db, "admin_task_completions"))) {
    throw new Error("task_table_missing");
  }
  await db.query(
    `INSERT INTO admin_task_completions (user_id, task_key, done) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE done = VALUES(done)`,
    [uid, key, done ? 1 : 0]
  );
}

function normalizeDailySalesSpan(raw) {
  const s = String(raw ?? "7d")
    .toLowerCase()
    .trim();
  if (s === "30d" || s === "30") return 30;
  if (s === "90d" || s === "90") return 90;
  return 7;
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{ salesRange?: string, userId?: number, revenueFrom?: string, revenueTo?: string }} [opts]
 */
export async function getAdminDashboardPayload(db, opts = {}) {
  const dailySalesSpan = normalizeDailySalesSpan(opts.salesRange);
  const dailyBack = dailySalesSpan - 1;
  const [[{ c: categories }]] = await db.query(`SELECT COUNT(*) AS c FROM categories`);
  const [[{ c: products }]] = await db.query(`SELECT COUNT(*) AS c FROM products`);
  const [[{ c: activeProducts }]] = await db.query(`SELECT COUNT(*) AS c FROM products WHERE is_active = 1`);
  const [[{ c: users }]] = await db.query(`SELECT COUNT(*) AS c FROM users`);
  const [[{ c: brandCount }]] = await db.query(`SELECT COUNT(*) AS c FROM brands`);

  const catalog = {
    categories: Number(categories),
    products: Number(products),
    activeProducts: Number(activeProducts),
    brands: Number(brandCount),
    users: Number(users),
  };

  const taskCompletions = await getAdminTaskCompletions(db, opts.userId);

  const hasOrders = await tableExists(db, "orders");
  const emptyRange = resolveRevenueDayRange(opts, new Date());
  if (!hasOrders) {
    return {
      catalog,
      ordersAvailable: false,
      revenue: { total: 0, today: 0, month: 0 },
      orders: { total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 },
      dailySales: [],
      dailySalesSpan: dailySalesSpan,
      salesRangeApplied: dailySalesSpan === 30 ? "30d" : dailySalesSpan === 90 ? "90d" : "7d",
      revenueByDay: [],
      revenueRangeFrom: emptyRange.revenueFrom,
      revenueRangeTo: emptyRange.revenueTo,
      salesByZone: [],
      retention90d: { buyers: 0, repeatBuyers: 0, repeatRate: 0 },
      activityFeed: [],
      suggestedTasks: [],
      forecast: null,
      topProducts: [],
      stockOut: [],
      lowStock: [],
      variantStockOut: [],
      variantLowStock: [],
      recentOrders: [],
      categoryRevenue: [],
      newCustomers7d: 0,
      taskCompletions,
    };
  }

  const [[revTotal]] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE status <> 'cancelled'`
  );
  const [[revToday]] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS s FROM orders
     WHERE status <> 'cancelled' AND DATE(created_at) = CURDATE()`
  );
  const [[revMonth]] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS s FROM orders
     WHERE status <> 'cancelled'
       AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`
  );

  const [[oc]] = await db.query(
    `SELECT
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status IN ('confirmed', 'shipped') THEN 1 ELSE 0 END) AS processing,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       COUNT(*) AS total
     FROM orders`
  );

  const [[{ cur: serverDate }]] = await db.query(`SELECT CURDATE() AS cur`);
  const { revenueFrom, revenueTo } = resolveRevenueDayRange(opts, serverDate);

  const [dayRows] = await db.query(
    `SELECT DATE(created_at) AS d, COALESCE(SUM(total), 0) AS total
     FROM orders
     WHERE status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY d ASC`,
    [dailyBack]
  );

  const [revenueDayRows] = await db.query(
    `SELECT DATE(created_at) AS d, COALESCE(SUM(total), 0) AS total
     FROM orders
     WHERE status <> 'cancelled' AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY d ASC`,
    [revenueFrom, revenueTo]
  );
  const revenueByDay = fillDateRangeInclusive(revenueFrom, revenueTo, revenueDayRows, "total");

  const [forecastMonthRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COALESCE(SUM(total), 0) AS total
     FROM orders
     WHERE status <> 'cancelled'
       AND created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 2 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY ym ASC`
  );

  const [topProducts] = await db.query(
    `SELECT oi.product_id,
            SUM(oi.qty) AS units_sold,
            SUM(oi.unit_price * oi.qty) AS revenue,
            p.name_en, p.name_bn, p.slug
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
     INNER JOIN products p ON p.id = oi.product_id
     GROUP BY oi.product_id, p.name_en, p.name_bn, p.slug
     ORDER BY units_sold DESC
     LIMIT 6`
  );

  const [stockOut] = await db.query(
    `SELECT id, name_en, name_bn, slug, stock
     FROM products WHERE is_active = 1 AND stock = 0
     ORDER BY id DESC LIMIT 8`
  );

  const [lowStock] = await db.query(
    `SELECT id, name_en, name_bn, slug, stock
     FROM products WHERE is_active = 1 AND stock > 0 AND stock <= 5
     ORDER BY stock ASC, id DESC LIMIT 8`
  );

  let variantStockOut = [];
  let variantLowStock = [];
  if (await tableExists(db, "product_color_variants")) {
    const [vOut] = await db.query(
      `SELECT v.id, v.product_id, v.name_en, v.name_bn, v.stock, p.name_en AS product_name_en, p.slug
       FROM product_color_variants v
       INNER JOIN products p ON p.id = v.product_id
       WHERE p.is_active = 1 AND v.stock = 0
       ORDER BY v.id DESC LIMIT 8`
    );
    variantStockOut = vOut;
    const [vLow] = await db.query(
      `SELECT v.id, v.product_id, v.name_en, v.name_bn, v.stock, p.name_en AS product_name_en, p.slug
       FROM product_color_variants v
       INNER JOIN products p ON p.id = v.product_id
       WHERE p.is_active = 1 AND v.stock > 0 AND v.stock <= 5
       ORDER BY v.stock ASC, v.id DESC LIMIT 8`
    );
    variantLowStock = vLow;
  }

  const [recentOrders] = await db.query(
    `SELECT id, order_number, customer_name, phone, total, status, created_at
     FROM orders ORDER BY id DESC LIMIT 10`
  );

  const [zoneRows] = await db.query(
    `SELECT delivery_zone AS zone,
            COUNT(*) AS order_count,
            COALESCE(SUM(total), 0) AS revenue
     FROM orders
     WHERE status <> 'cancelled'
     GROUP BY delivery_zone
     ORDER BY revenue DESC`
  );

  const [retentionRows] = await db.query(
    `SELECT user_id, COUNT(*) AS cnt
     FROM orders
     WHERE user_id IS NOT NULL
       AND status <> 'cancelled'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
     GROUP BY user_id`
  );

  const [categoryRevenue] = await db.query(
    `SELECT c.id, c.name_en, c.name_bn,
            COALESCE(SUM(oi.unit_price * oi.qty), 0) AS revenue
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
     GROUP BY c.id, c.name_en, c.name_bn
     ORDER BY revenue DESC
     LIMIT 8`
  );

  let newCustomers7d = 0;
  try {
    const [[u]] = await db.query(
      `SELECT COUNT(*) AS c FROM users
       WHERE role = 'customer' AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)`
    );
    newCustomers7d = Number(u?.c ?? 0);
  } catch {
    newCustomers7d = 0;
  }

  const monthlyForForecast = fillLastNMonthsFromServer(3, forecastMonthRows, "total", serverDate);
  const dailySales = fillLastNDaysFromServer(dailySalesSpan, dayRows, "total", serverDate);

  const salesByZone = (zoneRows || []).map((r) => ({
    zone: String(r.zone),
    order_count: Number(r.order_count) || 0,
    revenue: Number(r.revenue) || 0,
  }));

  const buyerCount = retentionRows.length;
  const repeatBuyerCount = retentionRows.filter((r) => Number(r.cnt) >= 2).length;
  const repeatRate = buyerCount > 0 ? Math.round((repeatBuyerCount / buyerCount) * 1000) / 10 : 0;
  const retention90d = {
    buyers: buyerCount,
    repeatBuyers: repeatBuyerCount,
    repeatRate,
  };

  const last3Totals = monthlyForForecast.slice(-3).map((x) => Number(x.total) || 0);
  const avg3 = last3Totals.length ? last3Totals.reduce((a, b) => a + b, 0) / last3Totals.length : 0;
  const forecast =
    avg3 > 0
      ? {
          estimateLow: Math.round(avg3 * 0.88 * 100) / 100,
          estimateMid: Math.round(avg3 * 1.05 * 100) / 100,
          estimateHigh: Math.round(avg3 * 1.18 * 100) / 100,
        }
      : null;

  /** @type {Array<{ id: string | number, type: string, [k: string]: unknown }>} */
  let activityFeed = (recentOrders || []).slice(0, 12).map((o) => ({
    id: o.id,
    type: "order",
    order_number: o.order_number,
    customer_name: o.customer_name,
    total: Number(o.total),
    status: o.status,
    created_at: o.created_at,
  }));
  for (const p of stockOut.slice(0, 2)) {
    activityFeed.unshift({
      id: `stock-${p.id}`,
      type: "stock_out",
      product_id: p.id,
      name_en: p.name_en,
      name_bn: p.name_bn,
      created_at: null,
    });
  }
  activityFeed = activityFeed.slice(0, 14);

  /** @type {Array<{ id: string, priority: string, [k: string]: unknown }>} */
  const suggestedTasks = [];
  if (Number(oc?.pending) > 0) {
    suggestedTasks.push({ id: "review_pending", priority: "high", count: Number(oc.pending) });
  }
  for (const p of stockOut.slice(0, 3)) {
    suggestedTasks.push({
      id: `restock-${p.id}`,
      priority: "high",
      productId: p.id,
      name_en: p.name_en,
      name_bn: p.name_bn,
    });
  }
  if (lowStock.length > 0) {
    suggestedTasks.push({ id: "review_low_stock", priority: "normal", count: lowStock.length });
  }
  if (Number(oc?.processing) > 8) {
    suggestedTasks.push({ id: "fulfillment_queue", priority: "normal", count: Number(oc.processing) });
  }
  if (newCustomers7d >= 3) {
    suggestedTasks.push({ id: "welcome_new_customers", priority: "low", count: newCustomers7d });
  }

  return {
    catalog,
    ordersAvailable: true,
    revenue: {
      total: Number(revTotal?.s ?? 0),
      today: Number(revToday?.s ?? 0),
      month: Number(revMonth?.s ?? 0),
    },
    orders: {
      total: Number(oc?.total ?? 0),
      pending: Number(oc?.pending ?? 0),
      processing: Number(oc?.processing ?? 0),
      delivered: Number(oc?.delivered ?? 0),
      cancelled: Number(oc?.cancelled ?? 0),
    },
    dailySales,
    dailySalesSpan,
    salesRangeApplied: dailySalesSpan === 30 ? "30d" : dailySalesSpan === 90 ? "90d" : "7d",
    revenueByDay,
    revenueRangeFrom: revenueFrom,
    revenueRangeTo: revenueTo,
    salesByZone,
    retention90d,
    activityFeed,
    suggestedTasks,
    forecast,
    topProducts,
    stockOut,
    lowStock,
    variantStockOut,
    variantLowStock,
    recentOrders,
    categoryRevenue,
    newCustomers7d,
    taskCompletions,
  };
}
