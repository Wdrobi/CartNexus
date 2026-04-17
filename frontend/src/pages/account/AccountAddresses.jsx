import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";

const emptyForm = {
  label: "Home",
  recipient_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  area: "",
  postal_code: "",
  country: "Bangladesh",
  is_default: true,
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20";

export default function AccountAddresses() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    authFetch("/api/auth/addresses")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => setList(data.addresses || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      label: row.label || "Home",
      recipient_name: row.recipient_name || "",
      phone: row.phone || "",
      line1: row.line1 || "",
      line2: row.line2 || "",
      city: row.city || "",
      area: row.area || "",
      postal_code: row.postal_code || "",
      country: row.country || "Bangladesh",
      is_default: !!Number(row.is_default),
    });
    setShowAdd(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await authFetch("/api/auth/addresses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "save");
        return;
      }
      setForm(emptyForm);
      setShowAdd(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function submitUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const r = await authFetch(`/api/auth/addresses/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "save");
        return;
      }
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("account.address.confirmDelete"))) return;
    const r = await authFetch(`/api/auth/addresses/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setError(data.error || "delete");
      return;
    }
    load();
  }

  async function setDefault(id) {
    const r = await authFetch(`/api/auth/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_default: true }),
    });
    if (!r.ok) return;
    load();
  }

  const formFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.label")}
        </label>
        <input
          className={inputClass}
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.recipient")}
        </label>
        <input
          className={inputClass}
          value={form.recipient_name}
          onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.phone")}
        </label>
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          inputMode="tel"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.city")}
        </label>
        <input
          className={inputClass}
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.line1")}
        </label>
        <input
          className={inputClass}
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.line2")}
        </label>
        <input
          className={inputClass}
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.area")}
        </label>
        <input
          className={inputClass}
          value={form.area}
          onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.postal")}
        </label>
        <input
          className={inputClass}
          value={form.postal_code}
          onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("account.address.country")}
        </label>
        <input
          className={inputClass}
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
        />
        <span className="text-sm text-slate-600">{t("account.address.defaultHint")}</span>
      </label>
    </div>
  );

  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="border-b border-slate-200 pb-6"
      >
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600">{t("account.zoneLabel")}</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("account.address.pageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{t("account.address.pageIntro")}</p>
      </motion.header>

      {error && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("admin.crud.saveError")}: {t(`auth.errors.${error}`, { defaultValue: error })}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
            setForm({ ...emptyForm, is_default: list.length === 0 });
          }}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400 hover:shadow-brand-500/35"
        >
          {t("account.address.addNew")}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            key="add"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            onSubmit={submitCreate}
            className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8"
          >
            <h2 className="font-display text-lg font-semibold text-slate-900">{t("account.address.formNew")}</h2>
            <div className="mt-6">{formFields}</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
              >
                {saving ? t("account.profile.saving") : t("account.address.save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setForm(emptyForm);
                }}
                className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {t("admin.crud.cancel")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading && (
        <p className="mt-8 animate-pulse text-slate-500">{t("shop.loading")}</p>
      )}

      {!loading && (
        <ul className="mt-8 space-y-4">
          {list.map((row, idx) => (
            <motion.li
              key={row.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 30 }}
            >
              {editingId === row.id ? (
                <form
                  onSubmit={submitUpdate}
                  className="rounded-3xl border border-brand-200 bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-brand-100/80 sm:p-8"
                >
                  <h3 className="font-display text-lg font-semibold text-slate-900">{t("account.address.formEdit")}</h3>
                  <div className="mt-6">{formFields}</div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                    >
                      {saving ? t("account.profile.saving") : t("account.address.save")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      {t("admin.crud.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-200/40 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg font-semibold text-slate-900">{row.label}</span>
                        {!!Number(row.is_default) && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
                            {t("account.address.badgeDefault")}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-800">{row.recipient_name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {row.line1}
                        {row.line2 ? `, ${row.line2}` : ""}
                      </p>
                      <p className="text-sm text-slate-600">
                        {row.area ? `${row.area}, ` : ""}
                        {row.city}
                        {row.postal_code ? ` · ${row.postal_code}` : ""}
                      </p>
                      <p className="text-sm text-slate-500">
                        {row.country}
                        {row.phone ? ` · ${row.phone}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!Number(row.is_default) && (
                        <button
                          type="button"
                          onClick={() => setDefault(row.id)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {t("account.address.setDefault")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:bg-brand-100"
                      >
                        {t("admin.crud.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        {t("admin.crud.delete")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.li>
          ))}
        </ul>
      )}

      {!loading && list.length === 0 && !showAdd && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">{t("account.address.empty")}</p>
        </motion.div>
      )}
    </div>
  );
}
