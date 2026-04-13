import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/apiBase.js";
import { authFetch } from "../../api/authFetch.js";
import { productName } from "../../utils/productText.js";
import { formatPrice } from "../../utils/price.js";
import { slugify } from "../../utils/slug.js";
import { translateAdminError } from "../../utils/adminApiError.js";

function emptyForm(categories) {
  return {
    category_id: categories[0]?.id ?? "",
    brand_id: "",
    name_bn: "",
    name_en: "",
    slug: "",
    description_bn: "",
    description_en: "",
    price: "",
    compare_at_price: "",
    image_url: "",
    stock: 0,
    is_active: true,
  };
}

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm([]));
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(() => {
    setError(null);
    return authFetch("/api/admin/products")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => setProducts(data.products || []));
  }, []);

  const loadCategories = useCallback(() => {
    return apiFetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const loadBrands = useCallback(() => {
    return apiFetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadProducts(), loadCategories(), loadBrands()])
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadProducts, loadCategories, loadBrands]);

  useEffect(() => {
    if (!modalOpen) return;
    setForm((f) => ({
      ...f,
      category_id: f.category_id || categories[0]?.id || "",
    }));
  }, [modalOpen, categories]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm(categories));
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      category_id: p.category_id,
      brand_id: p.brand_id != null ? String(p.brand_id) : "",
      name_bn: p.name_bn || "",
      name_en: p.name_en || "",
      slug: p.slug || "",
      description_bn: p.description_bn || "",
      description_en: p.description_en || "",
      price: String(p.price ?? ""),
      compare_at_price:
        p.compare_at_price != null && p.compare_at_price !== ""
          ? String(p.compare_at_price)
          : "",
      image_url: p.image_url || "",
      stock: p.stock ?? 0,
      is_active: !!p.is_active,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if (!categories.length) {
      setError("no_categories");
      setSaving(false);
      return;
    }
    const catNum = Number(form.category_id);
    if (!Number.isFinite(catNum) || catNum < 1) {
      setError("invalid_category");
      setSaving(false);
      return;
    }
    const slug =
      form.slug.trim() || slugify(form.name_en) || slugify(form.name_bn);
    const body = {
      category_id: catNum,
      brand_id: form.brand_id === "" ? null : Number(form.brand_id),
      name_bn: form.name_bn,
      name_en: form.name_en,
      slug: slug || undefined,
      description_bn: form.description_bn || null,
      description_en: form.description_en || null,
      price: Number(form.price),
      compare_at_price:
        form.compare_at_price === "" ? null : Number(form.compare_at_price),
      image_url: form.image_url || null,
      stock: Number(form.stock) || 0,
      is_active: form.is_active,
    };

    try {
      const r = editingId
        ? await authFetch(`/api/admin/products/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await authFetch("/api/admin/products", {
            method: "POST",
            body: JSON.stringify(body),
          });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "save");
        return;
      }
      closeModal();
      await loadProducts();
    } catch {
      setError("network");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("admin.crud.confirmDelete"))) return;
    const r = await authFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setError(data.error || "delete");
      return;
    }
    loadProducts();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {t("admin.nav.products")}
          </h1>
          <p className="mt-2 text-slate-400">{t("admin.productsCrudHint")}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!categories.length}
          title={
            !categories.length ? t("auth.errors.no_categories") : undefined
          }
          className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t("admin.crud.newProduct")}
        </button>
      </div>

      {error && (
        <p className="mt-6 text-amber-200">
          {t("admin.crud.saveError")}: <span className="font-mono">{translateAdminError(t, error)}</span>
        </p>
      )}

      {loading && <p className="mt-8 text-slate-500">{t("shop.loading")}</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t("admin.table.name")}</th>
                <th className="px-4 py-3">{t("admin.table.category")}</th>
                <th className="px-4 py-3">{t("admin.table.brand")}</th>
                <th className="px-4 py-3">{t("admin.table.price")}</th>
                <th className="px-4 py-3">{t("admin.table.stock")}</th>
                <th className="px-4 py-3">{t("admin.table.active")}</th>
                <th className="px-4 py-3">{t("admin.crud.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-500">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {productName(p, i18n.language)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {i18n.language?.startsWith("bn") ? p.category_name_bn : p.category_name_en}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.brand_id
                      ? i18n.language?.startsWith("bn")
                        ? p.brand_name_bn
                        : p.brand_name_en
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-200">
                    {formatPrice(p.price, i18n.language)}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.is_active ? "✓" : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="mr-2 text-brand-400 hover:underline"
                    >
                      {t("admin.crud.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="text-red-400/90 hover:underline"
                    >
                      {t("admin.crud.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && !error && (
            <p className="px-4 py-8 text-center text-slate-500">{t("shop.empty")}</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
            role="dialog"
            aria-modal
          >
            <h2 className="font-display text-xl font-semibold text-white">
              {editingId ? t("admin.crud.editProduct") : t("admin.crud.newProduct")}
            </h2>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.category")}</label>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category_id: Number(e.target.value) }))
                  }
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.brand")}</label>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.brand_id}
                  onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                >
                  <option value="">{t("shop.filterAllBrands")}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {i18n.language?.startsWith("bn") ? b.name_bn : b.name_en}
                    </option>
                  ))}
                </select>
              </div>
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
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.slug")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="unique-url-slug"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.descBn")}</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.description_bn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description_bn: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">{t("admin.crud.descEn")}</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.description_en}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description_en: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t("admin.crud.price")}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t("admin.crud.comparePrice")}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.compare_at_price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, compare_at_price: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t("admin.table.stock")}</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t("admin.crud.imageUrl")}</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="rounded border-white/20"
                />
                <label htmlFor="active" className="text-sm text-slate-300">
                  {t("admin.crud.activeProduct")}
                </label>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-brand-500 px-6 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {saving ? t("auth.submitting") : t("admin.crud.save")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/15 px-6 py-2 text-slate-300"
                >
                  {t("admin.crud.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
