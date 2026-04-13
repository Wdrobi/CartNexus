import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { translateAdminError } from "../../utils/adminApiError.js";
import { slugify } from "../../utils/slug.js";

const emptyForm = {
  name_bn: "",
  name_en: "",
  slug: "",
  sort_order: 0,
};

export default function AdminBrands() {
  const { t, i18n } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/admin/brands")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => setList(data.brands || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      name_bn: row.name_bn,
      name_en: row.name_en,
      slug: row.slug,
      sort_order: row.sort_order,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitCreate(e) {
    e.preventDefault();
    const body = {
      name_bn: form.name_bn,
      name_en: form.name_en,
      slug: form.slug || slugify(form.name_en),
      sort_order: Number(form.sort_order) || 0,
    };
    const r = await authFetch("/api/admin/brands", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "save");
      return;
    }
    setForm(emptyForm);
    load();
  }

  async function submitUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    const r = await authFetch(`/api/admin/brands/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name_bn: form.name_bn,
        name_en: form.name_en,
        slug: form.slug,
        sort_order: Number(form.sort_order) || 0,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "save");
      return;
    }
    cancelEdit();
    load();
  }

  async function remove(id) {
    if (!window.confirm(t("admin.crud.confirmDelete"))) return;
    const r = await authFetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "delete");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">
        {t("admin.nav.brands")}
      </h1>
      <p className="mt-2 text-slate-400">{t("admin.brandsHint")}</p>

      {error && (
        <p className="mt-4 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      <motion.form
        onSubmit={editingId ? submitUpdate : submitCreate}
        className="mt-8 grid gap-4 rounded-xl border border-white/10 bg-ink-900/60 p-6 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <label className="text-xs text-slate-500">{t("admin.crud.nameBn")}</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={form.name_bn}
            onChange={(e) => setForm((f) => ({ ...f, name_bn: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t("admin.crud.nameEn")}</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={form.name_en}
            onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t("admin.crud.slug")}</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="nike"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t("admin.crud.sortOrder")}</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
          />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400"
          >
            {editingId ? t("admin.crud.save") : t("admin.crud.add")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-white/15 px-6 py-2 text-slate-300 hover:bg-white/5"
            >
              {t("admin.crud.cancel")}
            </button>
          )}
        </div>
      </motion.form>

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t("admin.table.name")}</th>
                <th className="px-4 py-3">{t("admin.crud.slug")}</th>
                <th className="px-4 py-3">{t("admin.crud.sortOrder")}</th>
                <th className="px-4 py-3">{t("admin.crud.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-slate-500">{row.id}</td>
                  <td className="px-4 py-3 text-white">
                    {i18n.language?.startsWith("bn") ? row.name_bn : row.name_en}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.slug}</td>
                  <td className="px-4 py-3">{row.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="mr-2 text-brand-400 hover:underline"
                    >
                      {t("admin.crud.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      className="text-red-400/90 hover:underline"
                    >
                      {t("admin.crud.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && !error && (
            <p className="px-4 py-8 text-center text-slate-500">{t("shop.empty")}</p>
          )}
        </div>
      )}
    </div>
  );
}
