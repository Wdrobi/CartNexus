import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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

export default function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
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
  }, [mobileOpen, i18n.language]);

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
        if (mobileOpen || catOpen || brandOpen) {
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
  }, [mobileOpen, catOpen, brandOpen]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch("/api/brands")
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
  }, [pathname]);

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

  const bottomLinkClassDark = (active) =>
    `whitespace-nowrap py-2.5 text-sm font-medium transition md:py-3 ${
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
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-ink-950/95 shadow-lg shadow-black/10 backdrop-blur-xl"
        initial={false}
        animate={{ y: headerVisible ? 0 : "-100%" }}
        transition={headerMotion}
      >
      {/* Top tier — logo | search | actions */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex items-center justify-between gap-4 lg:contents">
            <div className="shrink-0 lg:order-1">
              <Link
                to="/"
                className="block font-display text-xl font-semibold tracking-tight text-white"
              >
                Cart<span className="text-brand-400">Nexus</span>
              </Link>
              <p className="mt-0.5 hidden max-w-[11rem] text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-slate-500 sm:max-w-none md:block">
                {t("nav.mensTagline")}
              </p>
            </div>

            <div className="flex items-center gap-2 lg:order-3 lg:ml-auto">
              <div className="lg:hidden">
                <LanguageSwitcher />
              </div>
              <Link
                to="/cart"
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                aria-label={t("nav.cart")}
              >
                <IconCart className="h-6 w-6" />
              </Link>
              <button
                type="button"
                className="rounded-full p-2 text-slate-300 lg:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label="Menu"
              >
                {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <form
            onSubmit={onSearchSubmit}
            className="order-3 w-full lg:order-2 lg:max-w-2xl lg:flex-1"
          >
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="h-12 w-full rounded-full border border-white/10 bg-ink-900/80 py-2 pl-12 pr-20 text-sm text-white placeholder:text-slate-500 outline-none ring-brand-500/0 transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20"
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

          <div className="order-2 hidden items-center gap-3 lg:order-3 lg:flex lg:gap-4">
            <LanguageSwitcher />
            <Link
              to="/cart"
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={t("nav.cart")}
            >
              <IconCart className="h-6 w-6" />
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-400"
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>

        {/* Mobile: login + register row */}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/5 pt-3 lg:hidden">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white">
            {t("nav.login")}
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
          >
            {t("nav.register")}
          </Link>
        </div>
      </div>

      {/* Bottom tier — nav strip (Direct Malaysia style, CartNexus colors) */}
      <div className="border-t border-white/5 bg-gradient-to-b from-brand-900/20 to-ink-900/95">
        <nav className="mx-auto hidden max-w-7xl items-center gap-1 px-4 md:flex md:gap-2 md:px-6 lg:gap-4">
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
                  className="absolute left-0 top-full z-50 min-w-[200px] rounded-xl border border-white/10 bg-ink-900 py-2 shadow-xl"
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
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${encodeURIComponent(c.slug)}`}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setCatOpen(false)}
                    >
                      {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                    </Link>
                  ))}
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
              className={`flex items-center gap-0.5 ${bottomLinkClassDark(pathname === "/brands")}`}
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
                  className="absolute left-0 top-full z-50 max-h-[min(70vh,420px)] min-w-[220px] overflow-y-auto rounded-xl border border-white/10 bg-ink-900 py-2 shadow-xl"
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
                    brands.map((b) => (
                      <Link
                        key={b.id}
                        to={`/shop?brand=${encodeURIComponent(b.slug)}`}
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={() => setBrandOpen(false)}
                      >
                        {i18n.language?.startsWith("bn") ? b.name_bn : b.name_en}
                      </Link>
                    ))
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

        {/* Mobile horizontal scroll nav */}
        <nav className="flex gap-4 overflow-x-auto px-4 py-2.5 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link to="/" className="shrink-0 text-sm font-medium text-slate-300">
            {t("nav.home")}
          </Link>
          <Link to="/shop" className="shrink-0 text-sm font-medium text-slate-300">
            {t("nav.products")}
          </Link>
          <Link
            to="/categories"
            className={`shrink-0 text-sm font-medium ${
              pathname === "/categories" ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {t("nav.categories")}
          </Link>
          <Link
            to="/brands"
            className={`shrink-0 text-sm font-medium ${
              pathname === "/brands" ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {t("nav.brands")}
          </Link>
          <Link
            to="/about"
            className={`shrink-0 text-sm font-medium ${
              pathname === "/about" ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {t("nav.about")}
          </Link>
          <Link
            to="/blog"
            className={`shrink-0 text-sm font-medium ${
              pathname === "/blog" || pathname.startsWith("/blog/") ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {t("nav.blog")}
          </Link>
          <Link
            to="/contact"
            className={`shrink-0 text-sm font-medium ${
              pathname === "/contact" ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {t("nav.contact")}
          </Link>
        </nav>
      </div>

      {/* Mobile full menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink-900 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  {i18n.language?.startsWith("bn") ? c.name_bn : c.name_en}
                </Link>
              ))}
              <Link to="/categories" className="block rounded-lg px-3 py-2 text-sm text-brand-300">
                {t("nav.browseCategories")}
              </Link>
              <Link to="/shop" className="block rounded-lg px-3 py-2 text-sm text-slate-400">
                {t("nav.allProducts")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}
