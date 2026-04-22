import { Router } from "express";
import { pool } from "../../db/pool.js";

const router = Router();

function iso(d) {
  return d ? new Date(d).toISOString() : null;
}

/** Recent activity for admin notification dropdown */
router.get("/notifications-feed", async (_req, res) => {
  const items = [];

  try {
    const [orders] = await pool.query(
      `SELECT id, order_number, customer_name, total, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );
    for (const o of orders || []) {
      items.push({
        type: "order",
        id: `order-${o.id}`,
        titleKey: "admin.notifications.orderTitle",
        titleParams: { num: String(o.order_number || o.id) },
        subtitle: `${o.customer_name ?? "—"} · ${o.status} · ${Number(o.total ?? 0)}`,
        href: "/admin/orders",
        createdAt: iso(o.created_at),
      });
    }
  } catch {
    /* orders table optional */
  }

  try {
    const [msgs] = await pool.query(
      `SELECT id, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 8`
    );
    for (const m of msgs || []) {
      items.push({
        type: "contact",
        id: `contact-${m.id}`,
        titleKey: "admin.notifications.contactTitle",
        titleParams: { email: String(m.email || "") },
        subtitle: String(m.subject || "").slice(0, 120),
        href: "/admin/contact-messages",
        createdAt: iso(m.created_at),
      });
    }
  } catch {
    /* missing table */
  }

  try {
    const [subs] = await pool.query(
      `SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 8`
    );
    for (const s of subs || []) {
      items.push({
        type: "newsletter",
        id: `newsletter-${s.id}`,
        titleKey: "admin.notifications.newsletterTitle",
        titleParams: { email: String(s.email || "") },
        subtitle: "",
        href: "/admin/newsletter-subscribers",
        createdAt: iso(s.created_at),
      });
    }
  } catch {
    /* missing table */
  }

  items.sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });

  res.json({ items: items.slice(0, 25) });
});

export default router;
