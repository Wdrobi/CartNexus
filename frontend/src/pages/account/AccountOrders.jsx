import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { formatPrice } from "../../utils/price.js";

function IconPackage({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 16V8l-9-4-9 4v8l9 4 9-4Z" strokeLinejoin="round" />
      <path d="M3.3 8L12 12l8.7-4M12 21V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function statusLabel(t, status) {
  const key = `account.orders.status_${String(status || "pending")}`;
  return t(key, { defaultValue: status || "—" });
}

export default function AccountOrders() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch("/api/orders")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(data.error || "load_failed");
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setOrders(data.orders || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message && e.message !== "Error" ? e.message : "load_failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasRows = orders.length > 0;

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="border-b border-slate-200 pb-6"
      >
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600">{t("account.zoneLabel")}</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("account.orders.pageTitle")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{t("account.orders.pageIntro")}</p>
      </motion.header>

      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {t(`auth.errors.${error}`, { defaultValue: error })}
        </p>
      )}

      {!loading && !hasRows && !error && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, type: "spring", stiffness: 380, damping: 30 }}
          className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg shadow-slate-200/40 sm:p-8"
        >
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:gap-10 lg:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
              <IconPackage className="h-10 w-10 text-brand-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-slate-900">{t("account.orders.emptyHeading")}</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">{t("account.orders.empty")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  to="/shop"
                  className="inline-flex rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
                >
                  {t("account.orders.browseShop")}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("account.orders.needHelp")}
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 380, damping: 30 }}
        aria-labelledby="orders-history-heading"
      >
        <h2 id="orders-history-heading" className="font-display text-lg font-semibold text-slate-900">
          {t("account.orders.historyTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("account.orders.historyHint")}</p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    {t("account.orders.colOrder")}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    {t("account.orders.colDate")}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    {t("account.orders.colStatus")}
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    {t("account.orders.colTotal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-sm text-slate-500 sm:px-5">
                      {t("shop.loading")}
                    </td>
                  </tr>
                ) : hasRows ? (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-mono text-xs text-slate-800 sm:px-5">{o.order_number}</td>
                      <td className="px-4 py-4 text-slate-600 sm:px-5">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-700 sm:px-5">{statusLabel(t, o.status)}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900 sm:px-5">
                        {formatPrice(o.total, lang)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-sm text-slate-500 sm:px-5">
                      {t("account.orders.emptyTable")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
