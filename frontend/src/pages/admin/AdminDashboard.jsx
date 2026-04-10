import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
        { label: t("admin.stats.categories"), value: stats.categories },
        { label: t("admin.stats.products"), value: stats.products },
        { label: t("admin.stats.activeProducts"), value: stats.activeProducts },
        { label: t("admin.stats.users"), value: stats.users },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">
        {t("admin.nav.dashboard")}
      </h1>
      <p className="mt-2 text-slate-400">{t("admin.dashboardHint")}</p>

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.statsError")} <code>{error}</code>
        </p>
      )}

      {!stats && !error && (
        <p className="mt-8 text-slate-500">{t("shop.loading")}</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-2xl border border-white/10 bg-ink-900/80 px-5 py-6"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">
              {c.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
