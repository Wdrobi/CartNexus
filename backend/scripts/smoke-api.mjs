/**
 * Quick API smoke test — run with backend up: npm run test:smoke
 * Uses JWT from login (admin@cartnexus.local / admin123) to verify admin CRUD routes respond.
 */
const BASE = process.env.SMOKE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

async function j(path, init) {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await r.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { _raw: text };
  }
  return { ok: r.ok, status: r.status, data };
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

async function main() {
  const health = await j("/api/health");
  if (!health.ok) fail(`/api/health → ${health.status}`);

  const chat = await j("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: "hi", locale: "en" }),
  });
  if (!chat.ok || typeof chat.data?.reply !== "string") {
    fail(`POST /api/chat → ${chat.status}`);
  }

  const cats = await j("/api/categories");
  if (!cats.ok || !Array.isArray(cats.data?.categories)) fail("GET /api/categories");

  const login = await j("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@cartnexus.local",
      password: "admin123",
    }),
  });
  if (!login.ok || !login.data?.token) {
    fail(
      `POST /api/auth/login (admin) → ${login.status} — ensure seed/admin user exists`
    );
  }
  const token = login.data.token;
  const auth = { Authorization: `Bearer ${token}` };

  const stats = await j("/api/admin/stats", { headers: auth });
  if (!stats.ok || stats.data?.categories == null) fail("GET /api/admin/stats");

  const adminCats = await j("/api/admin/categories", { headers: auth });
  if (!adminCats.ok || !Array.isArray(adminCats.data?.categories)) {
    fail("GET /api/admin/categories");
  }

  const brands = await j("/api/admin/brands", { headers: auth });
  if (!brands.ok || !Array.isArray(brands.data?.brands)) fail("GET /api/admin/brands");

  const products = await j("/api/admin/products", { headers: auth });
  if (!products.ok || !Array.isArray(products.data?.products)) fail("GET /api/admin/products");

  const users = await j("/api/admin/users", { headers: auth });
  if (!users.ok || !Array.isArray(users.data?.users)) fail("GET /api/admin/users");

  console.log(
    "OK: health, chat, public categories, admin login, stats, categories, brands, products, users"
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
