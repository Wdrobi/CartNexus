import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authFetch } from "../../api/authFetch.js";
import { getAdminNavSearchItems, matchesQuery } from "../../admin/adminSearchRoutes.js";

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
  );
}

const DEBOUNCE_MS = 320;

/**
 * @param {object} p
 * @param {Record<string, string>} p.chrome
 * @param {boolean} p.isLight
 */
export default function AdminNavbarSearch({ chrome, isLight }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResults, setApiResults] = useState([]);
  const debRef = useRef(null);
  const rootRef = useRef(null);

  const navItems = useMemo(() => getAdminNavSearchItems(t), [t, i18n.language]);

  const qLower = q.trim().toLowerCase();
  const staticMatches = useMemo(() => {
    if (!qLower) return navItems;
    return navItems.filter((it) => matchesQuery({ title: it.title, path: it.path, extra: it.group }, qLower));
  }, [navItems, qLower]);

  const runApiSearch = useCallback(
    async (query) => {
      const s = query.trim();
      if (s.length < 2) {
        setApiResults([]);
        return;
      }
      setLoading(true);
      const enc = encodeURIComponent(s);
      const paths = [
        authFetch(`/api/admin/products?pageSize=8&q=${enc}`).then((r) => (r.ok ? r.json() : {})),
        authFetch(`/api/admin/orders?pageSize=8&q=${enc}`).then((r) => (r.ok ? r.json() : {})),
        authFetch(`/api/admin/users?pageSize=8&q=${enc}`).then((r) => (r.ok ? r.json() : {})),
        authFetch(`/api/admin/categories?pageSize=8&q=${enc}`).then((r) => (r.ok ? r.json() : {})),
        authFetch(`/api/admin/brands?pageSize=8&q=${enc}`).then((r) => (r.ok ? r.json() : {})),
      ];
      try {
        const [prod, ord, usr, cat, brand] = await Promise.all(paths);
        const lang = i18n.language?.startsWith("bn") ? "bn" : "en";
        const rows = [];

        for (const p of prod.products || []) {
          const title = lang === "bn" ? p.name_bn || p.name_en : p.name_en || p.name_bn;
          rows.push({
            kind: "product",
            title: title || `#${p.id}`,
            subtitle: `${t("admin.search.typeProduct")} · ${p.slug || ""}`,
            path: "/admin/products",
          });
        }
        for (const o of ord.orders || []) {
          rows.push({
            kind: "order",
            title: `${t("admin.search.orderLabel")} ${o.order_number || o.id}`,
            subtitle: `${o.customer_name || ""} · ${o.status}`,
            path: "/admin/orders",
          });
        }
        for (const u of usr.users || []) {
          rows.push({
            kind: "user",
            title: u.email || u.name,
            subtitle: `${t("admin.search.typeUser")} · ${u.role || ""}`,
            path: "/admin/users",
          });
        }
        for (const c of cat.categories || []) {
          const title = lang === "bn" ? c.name_bn || c.name_en : c.name_en || c.name_bn;
          rows.push({
            kind: "category",
            title,
            subtitle: t("admin.search.typeCategory"),
            path: "/admin/categories",
          });
        }
        for (const b of brand.brands || []) {
          const title = lang === "bn" ? b.name_bn || b.name_en : b.name_en || b.name_bn;
          rows.push({
            kind: "brand",
            title,
            subtitle: t("admin.search.typeBrand"),
            path: "/admin/brands",
          });
        }

        setApiResults(rows.slice(0, 24));
      } catch {
        setApiResults([]);
      } finally {
        setLoading(false);
      }
    },
    [i18n.language, t]
  );

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    if (q.trim().length < 2) {
      setApiResults([]);
      setLoading(false);
      return;
    }
    debRef.current = window.setTimeout(() => runApiSearch(q), DEBOUNCE_MS);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [q, runApiSearch]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function go(path) {
    navigate(path);
    setOpen(false);
    setQ("");
  }

  const panelSurface = isLight
    ? "border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-300/40"
    : "border border-white/10 bg-[#161f2f] text-slate-100 shadow-2xl shadow-black/60";

  const rowHover = isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.06]";
  const muted = isLight ? "text-slate-500" : "text-slate-400";

  const showDropdown = open && (q.trim().length > 0 || staticMatches.length > 0);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:max-w-md lg:max-w-lg">
      <div className={`flex items-center gap-2 px-3 py-2 ${chrome.topNavbarSearchWrap}`}>
        <IconSearch className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("admin.topBar.searchPlaceholder")}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent text-sm outline-none ring-0 ${chrome.topNavbarSearchInput}`}
          aria-label={t("admin.topBar.searchPlaceholder")}
          aria-expanded={showDropdown}
          aria-controls="admin-global-search-results"
        />
      </div>

      {showDropdown ? (
        <div
          id="admin-global-search-results"
          role="listbox"
          className={`absolute left-0 right-0 top-full z-[80] mt-1 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl ${panelSurface}`}
        >
          {loading && q.trim().length >= 2 ? (
            <p className={`px-3 py-2 text-xs ${muted}`}>{t("admin.search.loading")}</p>
          ) : null}

          <div className="border-b border-slate-200/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] dark:border-white/10 dark:text-slate-500">
            {t("admin.search.sectionPages")}
          </div>
          {(q.trim() ? staticMatches : navItems).slice(0, 12).map((it) => (
            <button
              key={it.id}
              type="button"
              role="option"
              className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm transition ${rowHover}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(it.path)}
            >
              <span className="font-medium">{it.title}</span>
              <span className={`text-xs ${muted}`}>{it.path}</span>
            </button>
          ))}

          {q.trim().length >= 2 && apiResults.length > 0 ? (
            <>
              <div className="border-b border-slate-200/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] dark:border-white/10 dark:text-slate-500">
                {t("admin.search.sectionDirectory")}
              </div>
              {apiResults.map((it, idx) => (
                <button
                  key={`${it.kind}-${idx}`}
                  type="button"
                  role="option"
                  className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm transition ${rowHover}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(it.path)}
                >
                  <span className="font-medium">{it.title}</span>
                  {it.subtitle ? <span className={`text-xs ${muted}`}>{it.subtitle}</span> : null}
                </button>
              ))}
            </>
          ) : null}

          {q.trim().length >= 2 && !loading && apiResults.length === 0 && staticMatches.length === 0 ? (
            <p className={`px-3 py-4 text-center text-sm ${muted}`}>{t("admin.search.noResults")}</p>
          ) : null}

          <p className={`border-t border-slate-200/80 px-3 py-2 text-[11px] dark:border-white/10 ${muted}`}>
            {t("admin.search.footerHint")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
