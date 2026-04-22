import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import AdminTopNavbar from "./AdminTopNavbar.jsx";
import { getAdminChrome, persistAdminTheme, readStoredAdminTheme } from "./adminChrome.js";

const SIDEBAR_STORAGE_KEY = "cartnexus.admin.sidebar.sections.v1";

const SECTION_KEYS = ["main", "store", "content", "ops", "support", "settings"];

const SECTION_TITLE_I18N = {
  main: "admin.nav.groupMain",
  store: "admin.nav.groupStore",
  content: "admin.nav.groupContent",
  ops: "admin.nav.groupOps",
  support: "admin.nav.groupSupport",
  settings: "admin.nav.groupSettings",
};

function loadSidebarSections() {
  const defaults = Object.fromEntries(SECTION_KEYS.map((k) => [k, true]));
  try {
    const raw = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    const next = { ...defaults };
    for (const k of SECTION_KEYS) {
      if (typeof parsed[k] === "boolean") next[k] = parsed[k];
    }
    return next;
  } catch {
    return defaults;
  }
}

function persistSidebarSections(next) {
  try {
    sessionStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Which nav section should be highlighted / auto-expanded from the path */
function inferActiveSection(pathname) {
  const p = pathname.replace(/\/$/, "") || "/admin";
  if (p === "/admin") return "main";
  if (/^\/admin\/(orders|inventory|products|categories|brands)/.test(pathname)) return "store";
  if (/^\/admin\/(home-hero|blog)/.test(pathname)) return "content";
  if (/^\/admin\/users/.test(pathname)) return "ops";
  if (/^\/admin\/(support|contact-messages|newsletter-subscribers)/.test(pathname)) return "support";
  if (/^\/admin\/store-settings/.test(pathname)) return "settings";
  return null;
}

function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconOrders(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function IconInventory(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconHero(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconProducts(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8-4v10m-8-4l8 4" />
    </svg>
  );
}

function IconCategories(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function IconBrands(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function IconBlog(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconTerms(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconFaq(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconNewsletter(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 12h10M4 16h14" />
    </svg>
  );
}

function IconPrivacy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** Open storefront (public site) — used for “View site” CTA */
function IconViewSite(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconChevronSection({ open, className }) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-300 ease-out ${open ? "rotate-0" : "-rotate-90"} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CollapsibleNavSection({ sectionKey, title, open, onToggle, children, wrapClass, titleClass, headerBtnClass }) {
  const toggleLabel = open ? `${title} — collapse` : `${title} — expand`;
  return (
    <div className={wrapClass}>
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left transition ${headerBtnClass}`}
        aria-expanded={open}
        aria-controls={`admin-nav-${sectionKey}`}
        aria-label={toggleLabel}
      >
        <span className={`select-none font-display text-[10px] font-bold uppercase tracking-[0.22em] ${titleClass}`}>{title}</span>
        <IconChevronSection open={open} className="h-4 w-4 text-slate-500" />
      </button>
      <div
        id={`admin-nav-${sectionKey}`}
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-0.5 px-1 pb-2 pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState(readStoredAdminTheme);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(loadSidebarSections);

  const isLight = theme === "light";
  const chrome = useMemo(() => getAdminChrome(isLight), [isLight]);

  useEffect(() => {
    persistAdminTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleSection = useCallback((key) => {
    setSectionsOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistSidebarSections(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const active = inferActiveSection(location.pathname);
    if (!active) return;
    setSectionsOpen((prev) => {
      if (prev[active]) return prev;
      const next = { ...prev, [active]: true };
      persistSidebarSections(next);
      return next;
    });
  }, [location.pathname]);

  const itemClass = useCallback(
    ({ isActive }) =>
      `group relative flex items-center gap-3 rounded-xl border border-transparent py-2 pl-2.5 pr-2 text-sm font-medium transition-all duration-200 ${
        isActive ? chrome.itemActive : chrome.itemIdle
      }`,
    [chrome]
  );

  const iconWrap = useCallback(
    (isActive) =>
      `relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
        isActive ? chrome.iconActive : chrome.iconIdle
      }`,
    [chrome]
  );

  const sectionPass = useMemo(
    () => ({
      wrapClass: chrome.collapsibleWrap,
      titleClass: chrome.collapsibleTitle,
      headerBtnClass: chrome.collapsibleBtn,
    }),
    [chrome]
  );

  const activeSection = useMemo(() => inferActiveSection(location.pathname), [location.pathname]);

  return (
    <div className={chrome.shell}>
      {mobileNavOpen ? (
        <button
          type="button"
          className={`fixed inset-0 z-40 lg:hidden ${chrome.mobileOverlay}`}
          aria-label={t("admin.topBar.closeMenu")}
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="flex min-h-dvh flex-col lg:flex-row">
        <aside
          className={`${chrome.aside} fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-1rem))] max-w-[100vw] transition-transform duration-200 ease-out lg:static lg:z-auto lg:flex lg:w-[19rem] lg:max-w-[19rem] lg:translate-x-0 ${mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}`}
        >
          <div
            className={`pointer-events-none absolute -right-24 top-1/4 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl ${chrome.blurBlob}`}
            aria-hidden
          />
          <div
            className={`pointer-events-none absolute -left-16 bottom-20 h-36 w-36 rounded-full bg-teal-600/10 blur-3xl ${chrome.blurBlob}`}
            aria-hidden
          />

          <div className="relative flex max-h-[min(100dvh,100vh)] min-h-0 flex-col px-3 py-4 sm:px-4 lg:h-full lg:max-h-none lg:flex-1 lg:px-4 lg:py-7">
            <div className={chrome.logoCard}>
              <div className="flex items-start gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-teal-700 text-sm font-bold text-white shadow-lg shadow-brand-950/50 ring-2 ring-white/10 transition group-hover:scale-[1.02]">
                  CN
                  <span
                    className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ${chrome.liveDotRing}`}
                    title="Live"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold leading-tight tracking-tight text-white">
                    Cart
                    <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                      Nexus
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300/90">
                    {t("admin.panel")}
                  </p>
                  {user ? (
                    <p className="mt-2 truncate text-xs text-slate-400" title={user.email}>
                      {user.name}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {activeSection && SECTION_TITLE_I18N[activeSection] ? (
              <p className={`mt-3 px-1 text-[11px] ${chrome.sectionHint}`}>
                <span className={chrome.sectionHintLabel}>{t("admin.navSectionHint")}:</span>{" "}
                <span className={`font-medium ${chrome.sectionHintValue}`}>{t(SECTION_TITLE_I18N[activeSection])}</span>
              </p>
            ) : null}

            <nav
              className={`mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2 pt-1 [scrollbar-width:thin] lg:mt-4 ${chrome.navScroll}`}
              aria-label={t("admin.panel")}
            >
              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="main"
                title={t("admin.nav.groupMain")}
                open={sectionsOpen.main}
                onToggle={toggleSection}
              >
                <NavLink to="/admin" end className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconDashboard className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.dashboard")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>

              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="store"
                title={t("admin.nav.groupStore")}
                open={sectionsOpen.store}
                onToggle={toggleSection}
              >
                <NavLink to="/admin/orders" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconOrders className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.orders")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/inventory" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconInventory className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.inventory")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/products" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconProducts className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.products")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/categories" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconCategories className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.categories")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/brands" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconBrands className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.brands")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>

              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="content"
                title={t("admin.nav.groupContent")}
                open={sectionsOpen.content}
                onToggle={toggleSection}
              >
                <NavLink to="/admin/home-hero" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconHero className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.homeHero")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/blog" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconBlog className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.blog")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>

              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="ops"
                title={t("admin.nav.groupOps")}
                open={sectionsOpen.ops}
                onToggle={toggleSection}
              >
                <NavLink to="/admin/users" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconUsers className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.users")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>

              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="support"
                title={t("admin.nav.groupSupport")}
                open={sectionsOpen.support}
                onToggle={toggleSection}
              >
                <NavLink to="/admin/contact-messages" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconMail className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.contactInbox")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/newsletter-subscribers" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconNewsletter className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.newsletterSubscribers")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/support/terms" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconTerms className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.termsCms")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/support/faqs" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconFaq className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.faqsCms")}</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/support/privacy" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconPrivacy className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.privacyCms")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>

              <CollapsibleNavSection
                {...sectionPass}
                sectionKey="settings"
                title={t("admin.nav.groupSettings")}
                open={sectionsOpen.settings}
                onToggle={toggleSection}
              >
                <NavLink to="/admin/store-settings" className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <span className={iconWrap(isActive)}>
                        <IconSettings className="h-5 w-5" />
                      </span>
                      <span>{t("admin.nav.storeSettings")}</span>
                    </>
                  )}
                </NavLink>
              </CollapsibleNavSection>
            </nav>

            <div className={`mt-auto flex flex-shrink-0 flex-col gap-2 border-t pt-4 ${chrome.bottomBar}`}>
              <button
                type="button"
                onClick={() => logout()}
                className={`flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition ${chrome.logoutBtn}`}
              >
                {t("auth.logout")}
              </button>
              <NavLink
                to="/"
                className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(20,184,166,0.45)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 ${chrome.viewSiteLink}`}
              >
                <span
                  className="pointer-events-none absolute -right-6 -top-10 h-20 w-20 rounded-full bg-brand-400/12 blur-2xl transition-opacity group-hover:opacity-90"
                  aria-hidden
                />
                <span className="relative z-[1] inline-flex max-w-full items-center justify-center gap-2 text-sm font-medium">
                  <IconViewSite className={`h-[1.125rem] w-[1.125rem] shrink-0 transition ${chrome.viewSiteIcon}`} />
                  <span className={`truncate ${chrome.viewSiteText}`}>{t("admin.backSite")}</span>
                </span>
              </NavLink>
            </div>
          </div>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:min-h-0">
          <AdminTopNavbar
            chrome={chrome}
            theme={theme}
            onToggleTheme={toggleTheme}
            onMenuClick={() => setMobileNavOpen(true)}
            user={user}
          />
          <div className={`relative min-w-0 flex-1 overflow-auto ${chrome.main} ${isLight ? "admin-app-light" : ""}`}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
