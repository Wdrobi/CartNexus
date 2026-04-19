import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { translateAdminError } from "../../utils/adminApiError.js";
import { PortalSelect } from "../../components/admin/PortalSelect.jsx";

const PAGE_SIZE = 25;

function formatDate(iso, lang) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user: me } = useAuth();
  const myId = me?.id != null ? Number(me.id) : null;

  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("id_desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [deletePendingId, setDeletePendingId] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("customer");
  const [addSaving, setAddSaving] = useState(false);
  const [addErr, setAddErr] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (roleFilter !== "all") params.set("role", roleFilter);
    authFetch(`/api/admin/users?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        const users = data.users || [];
        const tot = Number(data.total) || 0;
        const maxPage = Math.max(1, Math.ceil(tot / PAGE_SIZE));
        setList(users);
        setTotal(tot);
        setPage((p) => Math.min(p, maxPage));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, q, roleFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearFilters() {
    setQDraft("");
    setQ("");
    setRoleFilter("all");
    setSort("id_desc");
    setPage(1);
  }

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

  function openAddUser() {
    setAddErr(null);
    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("customer");
    setAddOpen(true);
  }

  async function submitAddUser(e) {
    e.preventDefault();
    setAddSaving(true);
    setAddErr(null);
    try {
      const r = await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          password: addPassword,
          role: addRole,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setAddErr(data.error || String(r.status));
        return;
      }
      setAddOpen(false);
      load();
    } finally {
      setAddSaving(false);
    }
  }

  async function deleteUser(row) {
    if (!window.confirm(t("admin.users.confirmDelete", { email: row.email }))) return;
    setDeletePendingId(row.id);
    setError(null);
    try {
      const r = await authFetch(`/api/admin/users/${row.id}`, { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || String(r.status));
        return;
      }
      load();
    } finally {
      setDeletePendingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t("admin.nav.users")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("admin.usersHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAddUser}
            className="rounded-full border border-brand-500/40 bg-brand-600/35 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/50"
          >
            {t("admin.users.addUser")}
          </button>
          <Link
            to="/admin"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            ← {t("admin.nav.dashboard")}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-slate-500">{t("admin.users.search")}</span>
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setQ(qDraft), setPage(1))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/40"
            placeholder={t("admin.users.searchPh")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.users.filterRole")}</span>
          <PortalSelect
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(String(v));
              setPage(1);
            }}
            options={[
              { value: "all", label: t("admin.users.roleAll") },
              { value: "customer", label: t("admin.users.role_customer") },
              { value: "admin", label: t("admin.users.role_admin") },
            ]}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">{t("admin.users.sortBy")}</span>
          <PortalSelect
            value={sort}
            onChange={(v) => {
              setSort(String(v));
              setPage(1);
            }}
            options={[
              { value: "id_desc", label: t("admin.users.sortIdDesc") },
              { value: "id_asc", label: t("admin.users.sortIdAsc") },
              { value: "joined_desc", label: t("admin.users.sortJoinedDesc") },
              { value: "joined_asc", label: t("admin.users.sortJoinedAsc") },
              { value: "email_asc", label: t("admin.users.sortEmailAsc") },
              { value: "name_asc", label: t("admin.users.sortNameAsc") },
            ]}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setQ(qDraft);
            setPage(1);
          }}
          className="rounded-xl border border-brand-500/30 bg-brand-600/30 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/45"
        >
          {t("admin.users.applySearch")}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {t("admin.users.clearFilters")}
        </button>
      </div>

      {!loading && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {t("admin.users.results", { count: total, page, pages: totalPages })}
        </p>
      )}

      {error && (
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && (
        <motion.div
          className="mt-6 overflow-x-auto rounded-xl border border-white/10"
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
                <th className="px-4 py-3">{t("admin.crud.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const isSelf = myId != null && Number(row.id) === myId;
                const isAdminRow = String(row.role) === "admin";
                const cannotDemoteSelf = isSelf && isAdminRow;
                const busy = pendingId === row.id || deletePendingId === row.id;
                const canDelete = !isSelf;
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 text-white">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.email}</td>
                    <td
                      className="max-w-[200px] px-4 py-3"
                      title={cannotDemoteSelf ? t("admin.users.cannotDemoteSelfHint") : undefined}
                    >
                      <PortalSelect
                        value={row.role}
                        disabled={busy}
                        options={[
                          {
                            value: "customer",
                            label: t("admin.users.role_customer"),
                            disabled: cannotDemoteSelf,
                          },
                          { value: "admin", label: t("admin.users.role_admin") },
                        ]}
                        onChange={(newRole) => changeRole(row, newRole)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(row.created_at, lang)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!canDelete || busy}
                        title={isSelf ? t("admin.users.deleteBlockedSelf") : undefined}
                        onClick={() => deleteUser(row)}
                        className="rounded-lg border border-rose-500/35 bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-600/35 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("admin.crud.delete")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && !error && (
            <p className="px-4 py-8 text-center text-slate-500">{t("admin.users.empty")}</p>
          )}
        </motion.div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("admin.ordersPrev")}
          </button>
          <span className="text-sm text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("admin.ordersNext")}
          </button>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="admin-add-user-title"
          >
            <h2 id="admin-add-user-title" className="font-display text-lg font-semibold text-white">
              {t("admin.users.addTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{t("admin.users.addHint")}</p>

            <form onSubmit={submitAddUser} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs text-slate-500">{t("admin.users.addName")}</span>
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">{t("admin.table.email")}</span>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">{t("admin.users.password")}</span>
                <input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-brand-500/40"
                  required
                />
                <span className="mt-1 block text-[11px] text-slate-500">{t("admin.users.passwordHint")}</span>
              </label>
              <div>
                <span className="text-xs text-slate-500">{t("admin.table.role")}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole("customer")}
                    className={`flex-1 min-w-[120px] rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      addRole === "customer"
                        ? "border-brand-500/50 bg-brand-600/35 text-white"
                        : "border-white/10 bg-black/30 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {t("admin.users.role_customer")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRole("admin")}
                    className={`flex-1 min-w-[120px] rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      addRole === "admin"
                        ? "border-brand-500/50 bg-brand-600/35 text-white"
                        : "border-white/10 bg-black/30 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {t("admin.users.role_admin")}
                  </button>
                </div>
              </div>

              {addErr && (
                <p className="text-sm text-amber-200">{translateAdminError(t, addErr)}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  {t("admin.crud.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  {addSaving ? t("shop.loading") : t("admin.users.saveAdd")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
