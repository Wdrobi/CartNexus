/**
 * Paginated admin order list with search, status, date range, and sort.
 */

const MAX_PAGE = 100;
const DEFAULT_PAGE_SIZE = 25;

const STATUS_SET = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);

async function tableExists(db, name) {
  try {
    const [[r]] = await db.query(
      `SELECT 1 AS o FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
      [name]
    );
    return Boolean(r?.o);
  } catch {
    return false;
  }
}

function parseYMD(s) {
  const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  return { y, mo, d };
}

function orderByClause(sort) {
  const s = sort != null ? String(sort).trim().toLowerCase() : "created_desc";
  switch (s) {
    case "created_asc":
      return "o.created_at ASC, o.id ASC";
    case "total_desc":
      return "o.total DESC, o.id DESC";
    case "total_asc":
      return "o.total ASC, o.id ASC";
    case "customer_asc":
      return "o.customer_name ASC, o.id DESC";
    case "order_number_asc":
      return "o.order_number ASC";
    case "status_asc":
      return "o.status ASC, o.id DESC";
    case "created_desc":
    default:
      return "o.created_at DESC, o.id DESC";
  }
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {{
 *   page?: number|string,
 *   pageSize?: number|string,
 *   q?: string,
 *   status?: string,
 *   sort?: string,
 *   dateFrom?: string,
 *   dateTo?: string,
 * }} [opts]
 */
export async function getAdminOrdersList(db, opts = {}) {
  if (!(await tableExists(db, "orders"))) {
    return { orders: [], total: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE };
  }

  const pageSize = Math.min(MAX_PAGE, Math.max(1, Number(opts.pageSize) || DEFAULT_PAGE_SIZE));
  const page = Math.max(1, Number(opts.page) || 1);
  const offset = (page - 1) * pageSize;

  const qRaw = opts.q != null ? String(opts.q).trim() : "";
  const searchPattern = qRaw ? `%${qRaw.replace(/[%_\\]/g, "\\$&")}%` : null;

  let statusFilter = opts.status != null ? String(opts.status).trim().toLowerCase() : "all";
  if (statusFilter !== "all" && !STATUS_SET.has(statusFilter)) {
    statusFilter = "all";
  }

  const df = opts.dateFrom != null && String(opts.dateFrom).trim() !== "" ? parseYMD(opts.dateFrom) : null;
  const dt = opts.dateTo != null && String(opts.dateTo).trim() !== "" ? parseYMD(opts.dateTo) : null;
  const dateFromSql = df ? `${df.y}-${String(df.mo).padStart(2, "0")}-${String(df.d).padStart(2, "0")}` : null;
  const dateToSql = dt ? `${dt.y}-${String(dt.mo).padStart(2, "0")}-${String(dt.d).padStart(2, "0")}` : null;

  const ob = orderByClause(opts.sort);

  let where = " WHERE 1=1";
  const params = [];

  if (searchPattern) {
    where += " AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.phone LIKE ?)";
    params.push(searchPattern, searchPattern, searchPattern);
  }
  if (statusFilter !== "all") {
    where += " AND o.status = ?";
    params.push(statusFilter);
  }
  if (dateFromSql) {
    where += " AND DATE(o.created_at) >= ?";
    params.push(dateFromSql);
  }
  if (dateToSql) {
    where += " AND DATE(o.created_at) <= ?";
    params.push(dateToSql);
  }

  const fromSql = `FROM orders o${where}`;

  const [[{ cnt }]] = await db.query(`SELECT COUNT(*) AS cnt ${fromSql}`, params);
  const total = Number(cnt) || 0;

  const [rows] = await db.query(
    `SELECT o.id, o.order_number, o.user_id, o.customer_name, o.phone,
            o.subtotal, o.delivery_fee, o.total, o.status, o.payment_method,
            o.delivery_zone, o.delivery_address, o.created_at
     ${fromSql}
     ORDER BY ${ob}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    orders: rows || [],
    total,
    page,
    pageSize,
    sort: opts.sort != null ? String(opts.sort).trim().toLowerCase() : "created_desc",
  };
}
