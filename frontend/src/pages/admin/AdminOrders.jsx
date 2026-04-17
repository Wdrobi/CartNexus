import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authFetch } from "../../api/authFetch.js";
import { formatPrice } from "../../utils/price.js";
import { translateAdminError } from "../../utils/adminApiError.js";

function statusClass(status) {
  const s = String(status || "");
  if (s === "pending") return "bg-amber-500/15 text-amber-200";
  if (s === "delivered") return "bg-emerald-500/15 text-emerald-200";
  if (s === "cancelled") return "bg-slate-500/20 text-slate-400";
  return "bg-sky-500/15 text-sky-200";
}

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/admin/orders?limit=100")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.nav.orders")}</h1>
          <p className="mt-2 text-slate-400">{t("admin.ordersHint")}</p>
        </div>
        <Link
          to="/admin"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          ← {t("admin.nav.dashboard")}
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.statsError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{t("admin.ordersColNumber")}</th>
                <th className="px-4 py-3">{t("admin.ordersColCustomer")}</th>
                <th className="px-4 py-3">{t("admin.ordersColPhone")}</th>
                <th className="px-4 py-3">{t("admin.ordersColTotal")}</th>
                <th className="px-4 py-3">{t("admin.ordersColStatus")}</th>
                <th className="px-4 py-3">{t("admin.ordersColDate")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-500">{o.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-200">{o.order_number}</td>
                  <td className="px-4 py-3 text-white">{o.customer_name}</td>
                  <td className="px-4 py-3 text-slate-400">{o.phone}</td>
                  <td className="px-4 py-3 tabular-nums text-brand-200">{formatPrice(o.total, i18n.language)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(o.status)}`}>
                      {t(`admin.orderStatus.${o.status}`, { defaultValue: o.status })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString(i18n.language?.startsWith("bn") ? "bn-BD" : "en-BD", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !error && (
            <p className="px-4 py-10 text-center text-slate-500">{t("admin.ordersEmpty")}</p>
          )}
        </div>
      )}
    </div>
  );
}
