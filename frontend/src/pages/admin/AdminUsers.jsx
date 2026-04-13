import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { translateAdminError } from "../../utils/adminApiError.js";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
  } catch {
    return String(iso);
  }
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const myId = me?.id != null ? Number(me.id) : null;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => setList(data.users || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(row, newRole) {
    if (String(row.role) === String(newRole)) return;
    const label = t(`admin.users.role_${newRole}`);
    if (!window.confirm(t("admin.users.confirmRoleChange", { email: row.email, role: label }))) {
      return;
    }
    setPendingId(row.id);
    setError(null);
    try {
      const r = await authFetch(`/api/admin/users/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "save");
        return;
      }
      load();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">
        {t("admin.nav.users")}
      </h1>
      <p className="mt-2 text-slate-400">{t("admin.usersHint")}</p>

      {error && (
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}:{" "}
          <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && (
        <motion.div
          className="mt-8 overflow-x-auto rounded-xl border border-white/10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t("admin.table.name")}</th>
                <th className="px-4 py-3">{t("admin.table.email")}</th>
                <th className="px-4 py-3">{t("admin.table.role")}</th>
                <th className="px-4 py-3">{t("admin.users.joined")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const isSelf = myId != null && Number(row.id) === myId;
                const isAdminRow = String(row.role) === "admin";
                const cannotDemoteSelf = isSelf && isAdminRow;
                return (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 text-white">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
                        value={row.role}
                        disabled={pendingId === row.id}
                        title={cannotDemoteSelf ? t("admin.users.cannotDemoteSelfHint") : undefined}
                        onChange={(e) => changeRole(row, e.target.value)}
                      >
                        <option value="customer" disabled={cannotDemoteSelf}>
                          {t("admin.users.role_customer")}
                        </option>
                        <option value="admin">{t("admin.users.role_admin")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(row.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && !error && (
            <p className="px-4 py-8 text-center text-slate-500">{t("shop.empty")}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
