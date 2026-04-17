import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiBase.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { userInitials } from "../utils/userDisplay.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M12.5 12.5L17 17" strokeLinecap="round" />
    </svg>
  );
}

function IconCart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L4.5 4H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function IconMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function IconClose({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown({ className }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDash({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-9h7V4h-7v7Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconOrdersMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L4.5 4H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function IconPinMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconCogMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}

export default function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, ready, logout } = useAuth();
  const { totalQty } = useCart();
  const loggedIn = Boolean(ready && token && user);

  function handleLogout() {
    setUserMenuOpen(false);
    logout();
    navigate("/", { replace: true });
  }

  const userDisplayName = user?.name?.trim() || user?.email || "";
  const userMenuInitials = user ? userInitials(user.name, user.email) : "";
  const userFirstShort = userDisplayName.split(/\s+/)[0] || userDisplayName || "—";
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSheetCatOpen, setMobileSheetCatOpen] = useState(false);
  const [mobileSheetBrandOpen, setMobileSheetBrandOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(152);
  const [headerVisible, setHeaderVisible] = useState(true);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobileOpen, i18n.language, mobileSheetCatOpen, mobileSheetBrandOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
  }, [pathname]);

  useEffect(() => {
    const topThreshold = 48;
    const deltaThreshold = 5;
    let rafId = 0;
    const latestY = { current: 0 };
    const onScroll = () => {
      latestY.current = window.scrollY ?? document.documentElement.scrollTop;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const y = latestY.current;
        if (mobileOpen || catOpen || brandOpen || userMenuOpen) {
          setHeaderVisible(true);
          lastScrollY.current = y;
          return;
        }
        if (y <= topThreshold) {
          setHeaderVisible(true);
        } else {
          const delta = y - lastScrollY.current;
          if (delta > deltaThreshold) setHeaderVisible(false);
          else if (delta < -deltaThreshold) setHeaderVisible(true);
        }
        lastScrollY.current = y;
      });
    };
    lastScrollY.current = window.scrollY ?? document.documentElement.scrollTop;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mobileOpen, catOpen, brandOpen, userMenuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    apiFetch("/api/brands")
      .then((r) => (r.ok ? r.json() : { brands: [] }))
      .then((d) => setBrands(d.brands || []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setBrandOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      setMobileSheetCatOpen(false);
      setMobileSheetBrandOpen(false);
    }
  }, [mobileOpen]);

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/shop");
    }
  }

  const isShop = pathname === "/shop";
  useEffect(() => {
    if (isShop) {
      setQuery(searchParams.get("q") || "");
    }
  }, [isShop, searchParams]);

  /** Horizontal padding: never narrower than 1rem; expands for notches / home indicator */
  const headerPadX =
    "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))]";

  const mobileSheetLink = (active) =>
    `block rounded-lg px-3 py-2.5 text-sm transition ${
      active ? "bg-white/5 font-medium text-brand-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  const mobileSheetSubLink = (active) =>
    `block rounded-r-lg py-2 pl-4 pr-3 text-sm transition sm:pl-5 ${
      active ? "border-l-2 border-brand-400 bg-white/5 font-medium text-brand-300" : "border-l-2 border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  const bottomLinkClassDark = (active) =>
    `shrink-0 whitespace-nowrap py-2.5 text-xs font-medium transition sm:text-sm md:py-3 ${
      active ? "text-brand-300" : "text-slate-400 hover:text-white"
    }`;

  const headerMotion = {
    duration: 0.28,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none shrink-0 w-full bg-ink-950"
        style={{ height: Math.max(headerHeight, 1) }}
      />
      <motion.header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-50 box-border w-full max-w-[100vw] min-w-0 overflow-x-clip border-b border-white/10 bg-ink-950/95 shadow-lg shadow-black/10 backdrop-blur-xl"
        initial={false}
        animate={{ y: headerVisible ? 0 : "-100%" }}
        transition={headerMotion}
      >
      {/* Top tier — mobile: logo | search | cart | menu; md+: logo | search | lang · cart · auth */}
      <div className={`w-full min-w-0 py-3 sm:py-4 ${headerPadX}`}>
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:gap-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:contents">
            <div className="min-w-0 shrink md:order-1">
              <Link
                to="/"
                className="block truncate font-display text-lg font-semibold tracking-tight text-white min-[400px]:text-xl"
              >
                Cart<span className="text-brand-400">Nexus</span>
              </Link>
              <p className="mt-0.5 hidden max-w-[11rem] text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-slate-500 sm:max-w-none md:block">
                {t("nav.mensTagline")}
              </p>
            </div>

            <form
              onSubmit={onSearchSubmit}
              className="min-w-0 flex-1 md:order-2 md:max-w-2xl md:flex-1"
            >
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 md:left-4 md:h-5 md:w-5" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("nav.searchPlaceholder")}
                  className="h-10 w-full min-w-0 rounded-full border border-white/10 bg-ink-900/80 py-2 pl-10 pr-2 text-xs text-white placeholder:text-slate-500 outline-none ring-brand-500/0 transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20 md:h-12 md:pl-12 md:pr-3 md:text-sm sm:pr-20"
                  autoComplete="off"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-slate-500 sm:flex">
                  {typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                    ? "⌘"
                    : "Ctrl+"}
                  K
                </kbd>
              </div>
            </form>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:hidden">
              <Link
                to="/cart"
                className="relative rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t("nav.cart")}
              >
                <IconCart className="h-6 w-6" />
                {totalQty > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {totalQty > 99 ? "99+" : totalQty}
                  </span>
                ) : null}
              </Link>
              {loggedIn && String(user.role) !== "admin" ? (
                <Link
                  to="/account"
                  className="rounded-full p-1 text-slate-300 transition hover:bg-white/10"
                  aria-label={t("nav.myAccount")}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-[11px] font-bold text-white shadow-inner">
                    {userMenuInitials}
                  </span>
                </Link>
              ) : null}
              <button
                type="button"
                className="rounded-full p-2 text-slate-300"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label="Menu"
              >
                {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <div className="hidden min-w-0 max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3 md:order-3 md:ml-auto md:flex md:gap-2 lg:gap-3 xl:gap-4">
            <LanguageSwitcher />
            <Link
              to="/cart"
              className="relative rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={t("nav.cart")}
            >
              <IconCart className="h-6 w-6" />
              {totalQty > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {totalQty > 99 ? "99+" : totalQty}
                </span>
              ) : null}
            </Link>
            {loggedIn ? (
              <>
                {String(user.role) === "admin" ? (
                  <Link
                    to="/admin"
                    className="text-sm font-semibold text-brand-400 transition hover:text-brand-300"
                  >
                    {t("admin.panel")}
                  </Link>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="menu"
                      aria-controls="site-user-menu"
                      aria-label={t("nav.userMenuAria")}
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex max-w-[13rem] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1 pr-2.5 text-left transition hover:bg-white/10 sm:pr-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-[11px] font-bold text-white shadow-inner">
                        {userMenuInitials}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{userFirstShort}</span>
                      <ChevronDown
                        className={`h-3 w-3 shrink-0 text-slate-400 transition ${userMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          id="site-user-menu"
                          role="menu"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 top-full z-[60] mt-2 min-w-[240px] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-2 text-slate-800 shadow-2xl shadow-black/20"
                        >
                          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {t("nav.signedInAs")}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={userDisplayName}>
                              {userDisplayName}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              role="menuitem"
                              to="/account"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconDash className="h-4 w-4 shrink-0 text-slate-500" />
                              {t("nav.userMenuDashboard")}
                            </Link>
                            <Link
                              role="menuitem"
                              to="/account/orders"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconOrdersMenu className="h-4 w-4 shrink-0 text-slate-500" />
                              {t("nav.userMenuOrders")}
                            </Link>
                            <Link
                              role="menuitem"
                              to="/account/addresses"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconPinMenu className="h-4 w-4 shrink-0 text-slate-500" />
                              {t("nav.userMenuAddresses")}
                            </Link>
                            <Link
                              role="menuitem"
                              to="/account/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconCogMenu className="h-4 w-4 shrink-0 text-slate-500" />
                              {t("nav.userMenuSettings")}
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 pt-1">
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                              onClick={handleLogout}
                            >
                              {t("auth.logout")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-400 sm:px-5 sm:py-2.5"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom tier — nav strip (tablet+ only; mobile uses hamburger menu) */}
      <div className="hidden min-w-0 max-w-full border-t border-white/5 bg-gradient-to-b from-brand-900/20 to-ink-900/95 md:block">
        {/* md+: full strip + dropdowns; phones use scroll row below */}
        <nav
          className={`hidden w-full min-w-0 flex-wrap items-center justify-start gap-x-1 gap-y-1.5 md:flex md:gap-x-2 md:gap-y-2 lg:gap-x-3 xl:gap-x-4 ${headerPadX}`}
        >
          <Link
            to="/"
            className={bottomLinkClassDark(pathname === "/")}
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/shop"
            className={bottomLinkClassDark(pathname === "/shop" || pathname.startsWith("/shop/"))}
          >
            {t("nav.products")}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-0.5 ${bottomLinkClassDark(false)}`}
              aria-expanded={catOpen}
            >
              {t("nav.categories")}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 max-w-[min(calc(100vw-2rem),20rem)] min-w-[200px] rounded-xl border border-white/10 bg-ink-900 py-2 shadow-xl"
                >
                  <Link
                    to="/categories"
                    className="block px-4 py-2 text-sm text-brand-200 hover:bg-white/5 hover:text-white"
                    onClick={() => setCatOpen(false)}
                  >
                    {t("nav.browseCategories")}
                  </Link>
                  <Link
                    to="/shop"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setCatOpen(false)}
                  >
                    {t("nav.allProducts")}
                  </Link>
                  {categories.length > 0 ? (
                    <>
                      <div className="my-1 border-t border-white/10" role="presentation" />
                      <div className="border-l border-white/15 pl-1">
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            to={`/categories/${encodeURIComponent(c.slug)}`}
                            className="block py-2 pl-3 pr-4 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                            onClick={() => setCatOpen(false)}
                          >
                            {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setBrandOpen(true)}
            onMouseLeave={() => setBrandOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-0.5 ${bottomLinkClassDark(pathname === "/brands" || pathname.startsWith("/brands/"))}`}
              aria-expanded={brandOpen}
            >
              {t("nav.brands")}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            <AnimatePresence>
              {brandOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full z-50 max-h-[min(70vh,420px)] max-w-[min(calc(100vw-2rem),20rem)] min-w-[220px] overflow-y-auto rounded-xl border border-white/10 bg-ink-900 py-2 shadow-xl"
                >
                  <Link
                    to="/brands"
                    className="block px-4 py-2 text-sm text-brand-200 hover:bg-white/5 hover:text-white"
                    onClick={() => setBrandOpen(false)}
                  >
                    {t("nav.browseBrands")}
                  </Link>
                  {brands.length === 0 ? (
                    <span className="block px-4 py-2 text-sm text-slate-500">{t("nav.brandsSoon")}</span>
                  ) : (
                    <>
                      <div className="my-1 border-t border-white/10" role="presentation" />
                      <div className="border-l border-white/15 pl-1">
                        {brands.map((b) => (
                          <Link
                            key={b.id}
                            to={`/brands/${encodeURIComponent(b.slug)}`}
                            className="block py-2 pl-3 pr-4 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                            onClick={() => setBrandOpen(false)}
                          >
                            {i18n.language?.startsWith("bn") ? b.name_bn : b.name_en}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/about" className={bottomLinkClassDark(pathname === "/about")}>
            {t("nav.about")}
          </Link>
          <Link
            to="/blog"
            className={bottomLinkClassDark(pathname === "/blog" || pathname.startsWith("/blog/"))}
          >
            {t("nav.blog")}
          </Link>
          <Link to="/contact" className={bottomLinkClassDark(pathname === "/contact")}>
            {t("nav.contact")}
          </Link>
        </nav>
      </div>

      {/* Mobile full menu — primary nav, categories, brands, account (screens below md) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink-900 md:hidden"
          >
            <div
              className={`max-h-[min(85dvh,720px)] overflow-y-auto overscroll-y-contain py-4 ${headerPadX}`}
            >
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("nav.menuSection")}
              </p>
              <nav className="space-y-0.5" aria-label={t("nav.menuSection")}>
                <Link to="/" className={mobileSheetLink(pathname === "/")} onClick={() => setMobileOpen(false)}>
                  {t("nav.home")}
                </Link>
                <Link
                  to="/shop"
                  className={mobileSheetLink(pathname === "/shop" || pathname.startsWith("/shop/"))}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.products")}
                </Link>

                <div className="rounded-lg border border-white/5 bg-white/[0.02]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/5"
                    aria-expanded={mobileSheetCatOpen}
                    onClick={() => setMobileSheetCatOpen((o) => !o)}
                  >
                    <span>{t("nav.categories")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${mobileSheetCatOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileSheetCatOpen ? (
                    <div className="space-y-0.5 border-t border-white/10 px-2 pb-2 pt-1">
                      <Link
                        to="/categories"
                        className={mobileSheetSubLink(pathname === "/categories")}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("nav.browseCategories")}
                      </Link>
                      {categories.map((c) => {
                        const href = `/categories/${encodeURIComponent(c.slug)}`;
                        const active = pathname === href || pathname === `/categories/${c.slug}`;
                        return (
                          <Link
                            key={c.id}
                            to={href}
                            className={mobileSheetSubLink(active)}
                            onClick={() => setMobileOpen(false)}
                          >
                            {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/5"
                    aria-expanded={mobileSheetBrandOpen}
                    onClick={() => setMobileSheetBrandOpen((o) => !o)}
                  >
                    <span>{t("nav.brands")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${mobileSheetBrandOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileSheetBrandOpen ? (
                    <div className="space-y-0.5 border-t border-white/10 px-2 pb-2 pt-1">
                      <Link
                        to="/brands"
                        className={mobileSheetSubLink(pathname === "/brands")}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("nav.browseBrands")}
                      </Link>
                      {brands.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-slate-500">{t("nav.brandsSoon")}</p>
                      ) : (
                        brands.map((b) => {
                          const href = `/brands/${encodeURIComponent(b.slug)}`;
                          const active = pathname === href || pathname === `/brands/${b.slug}`;
                          return (
                            <Link
                              key={b.id}
                              to={href}
                              className={mobileSheetSubLink(active)}
                              onClick={() => setMobileOpen(false)}
                            >
                              {i18n.language?.startsWith("bn") ? b.name_bn : b.name_en}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </div>

                <Link
                  to="/about"
                  className={mobileSheetLink(pathname === "/about")}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.about")}
                </Link>
                <Link
                  to="/blog"
                  className={mobileSheetLink(pathname === "/blog" || pathname.startsWith("/blog/"))}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.blog")}
                </Link>
                <Link
                  to="/contact"
                  className={mobileSheetLink(pathname === "/contact")}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.contact")}
                </Link>
              </nav>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("lang.label")}
                </p>
                <div className="px-1">
                  <LanguageSwitcher />
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("nav.accountSection")}
                </p>
                {loggedIn ? (
                  <div className="space-y-1">
                    {String(user.role) === "admin" ? (
                      <>
                        <Link
                          to="/admin"
                          className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-400 hover:bg-white/5"
                          onClick={() => setMobileOpen(false)}
                        >
                          {t("admin.panel")}
                        </Link>
                        <p className="truncate px-3 text-xs text-slate-500" title={user.email || ""}>
                          {user.name?.trim() || user.email}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            handleLogout();
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          {t("auth.logout")}
                        </button>
                      </>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                        <div className="border-b border-white/10 px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {t("nav.signedInAs")}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-white" title={userDisplayName}>
                            {userDisplayName}
                          </p>
                        </div>
                        <nav className="py-1" aria-label={t("nav.userMenuAria")}>
                          <Link
                            to="/account"
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                              pathname === "/account"
                                ? "bg-white/5 font-medium text-brand-300"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <IconDash className="h-4 w-4 shrink-0 text-slate-400" />
                            {t("nav.userMenuDashboard")}
                          </Link>
                          <Link
                            to="/account/orders"
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                              pathname === "/account/orders"
                                ? "bg-white/5 font-medium text-brand-300"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <IconOrdersMenu className="h-4 w-4 shrink-0 text-slate-400" />
                            {t("nav.userMenuOrders")}
                          </Link>
                          <Link
                            to="/account/addresses"
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                              pathname === "/account/addresses"
                                ? "bg-white/5 font-medium text-brand-300"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <IconPinMenu className="h-4 w-4 shrink-0 text-slate-400" />
                            {t("nav.userMenuAddresses")}
                          </Link>
                          <Link
                            to="/account/profile"
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                              pathname === "/account/profile"
                                ? "bg-white/5 font-medium text-brand-300"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <IconCogMenu className="h-4 w-4 shrink-0 text-slate-400" />
                            {t("nav.userMenuSettings")}
                          </Link>
                        </nav>
                        <div className="border-t border-white/10 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setMobileOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center px-3 py-2.5 text-left text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            {t("auth.logout")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link
                      to="/login"
                      className="block w-full rounded-lg border border-white/15 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-white/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full rounded-full bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-400"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}
