import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authFetch } from "../../api/authFetch.js";
import AdminNavbarSearch from "./AdminNavbarSearch.jsx";

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function IconFullscreen(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
    </svg>
  );
}

function IconChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const READ_NOTIF_IDS_KEY = "cartnexus.admin.notifications.readIds.v1";

function loadReadNotifIds() {
  try {
    const raw = localStorage.getItem(READ_NOTIF_IDS_KEY);
    const p = JSON.parse(raw || "[]");
    return new Set(Array.isArray(p) ? p.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function persistReadNotifIds(ids) {
  try {
    localStorage.setItem(READ_NOTIF_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

function IconGlobe(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      />
    </svg>
  );
}

/**
 * @param {object} props
 * @param {Record<string, string>} props.chrome
 * @param {() => void} props.onMenuClick
 * @param {'light' | 'dark'} props.theme
 * @param {() => void} props.onToggleTheme
 * @param {object | null} props.user
 */
export default function AdminTopNavbar({ chrome, onMenuClick, theme, onToggleTheme, user }) {
  const { t, i18n } = useTranslation();
  const isLight = theme === "light";

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifItems, setNotifItems] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(loadReadNotifIds);

  const unreadNotifCount = useMemo(
    () => notifItems.filter((it) => !readNotifIds.has(it.id)).length,
    [notifItems, readNotifIds]
  );

  const markNotificationRead = useCallback((id) => {
    setReadNotifIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadNotifIds(next);
      return next;
    });
  }, []);

  const activeLang = i18n.language?.startsWith("bn") ? "bn" : "en";

  const closeLang = useCallback(() => setLangOpen(false), []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const r = await authFetch("/api/admin/notifications-feed");
      const data = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(data.items)) {
        setNotifItems(data.items);
      } else {
        setNotifItems([]);
      }
    } catch {
      setNotifItems([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    loadNotifications();
  }, [notifOpen, loadNotifications]);

  useEffect(() => {
    loadNotifications();
    const id = window.setInterval(loadNotifications, 90000);
    return () => window.clearInterval(id);
  }, [loadNotifications]);

  useEffect(() => {
    if (!langOpen) return;
    function onDoc(e) {
      if (langRef.current?.contains(e.target)) return;
      setLangOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [langOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    function onDoc(e) {
      if (notifRef.current?.contains(e.target)) return;
      setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [notifOpen]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const initial =
    user?.name?.trim()?.[0]?.toUpperCase() ||
    user?.email?.trim()?.[0]?.toUpperCase() ||
    "A";

  const langBtnSurface = isLight
    ? "rounded-full border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-2 py-1.5 shadow-sm shadow-slate-200/80 ring-1 ring-slate-200/60 transition hover:border-brand-300/70 hover:shadow-md"
    : "rounded-full border border-white/[0.12] bg-white/[0.06] px-2 py-1.5 shadow-inner shadow-black/30 ring-1 ring-white/[0.06] transition hover:border-brand-400/35 hover:bg-white/[0.09]";

  const langMenuSurface = isLight
    ? "border border-slate-200 bg-white shadow-xl shadow-slate-300/40"
    : "border border-white/10 bg-[#161f2f] shadow-2xl shadow-black/70";

  const notifSurface = isLight
    ? "border border-slate-200 bg-white shadow-xl shadow-slate-300/40"
    : "border border-white/10 bg-[#161f2f] shadow-2xl shadow-black/70";

  const notifRowHoverUnread = isLight ? "hover:bg-slate-300/80" : "hover:bg-white/[0.14]";
  const notifRowHoverRead = isLight ? "hover:bg-slate-100/90" : "hover:bg-white/[0.06]";

  function formatWhen(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString(i18n.language?.startsWith("bn") ? "bn-BD" : "en-BD", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  }

  return (
    <header
      className={`sticky top-0 z-30 flex min-h-[56px] flex-wrap items-center gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4 lg:px-5 ${chrome.topNavbar}`}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className={`${chrome.topNavbarIconBtn} lg:hidden`}
        aria-label={t("admin.topBar.openMenu")}
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <AdminNavbarSearch chrome={chrome} isLight={isLight} />

      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            className={`flex items-center gap-2 ${langBtnSurface}`}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
          >
            <IconGlobe className="h-4 w-4 shrink-0 text-brand-600 opacity-90 dark:text-brand-400" aria-hidden />
            <span className="text-lg leading-none" aria-hidden>
              {activeLang === "bn" ? "🇧🇩" : "🇺🇸"}
            </span>
            <span className={`hidden text-sm font-semibold sm:inline ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {activeLang === "bn" ? t("lang.bn") : t("lang.en")}
            </span>
            <IconChevronDown className={`h-3.5 w-3.5 shrink-0 opacity-70 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
          </button>
          {langOpen && (
            <ul
              role="listbox"
              className={`absolute right-0 top-full z-[90] mt-2 min-w-[11.5rem] overflow-hidden rounded-2xl py-1 text-sm ${langMenuSurface}`}
            >
              <li role="option">
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium transition ${isLight ? "hover:bg-brand-50 text-slate-800" : "hover:bg-white/10 text-slate-100"}`}
                  onClick={() => {
                    i18n.changeLanguage("en");
                    closeLang();
                  }}
                >
                  <span className="text-lg">🇺🇸</span>
                  {t("lang.en")}
                </button>
              </li>
              <li role="option">
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium transition ${isLight ? "hover:bg-brand-50 text-slate-800" : "hover:bg-white/10 text-slate-100"}`}
                  onClick={() => {
                    i18n.changeLanguage("bn");
                    closeLang();
                  }}
                >
                  <span className="text-lg">🇧🇩</span>
                  {t("lang.bn")}
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className={`relative ${chrome.topNavbarIconBtn}`}
            aria-label={t("admin.topBar.notifications")}
            title={t("admin.topBar.notifications")}
            aria-expanded={notifOpen}
          >
            <IconBell className="h-5 w-5" />
            {unreadNotifCount > 0 ? (
              <span
                className={`absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none ring-2 ${
                  isLight ? "bg-brand-600 text-white ring-white" : "bg-brand-500 text-white ring-[#141c2a]"
                }`}
              >
                {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div
              className={`absolute right-0 top-full z-[90] mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl ${notifSurface}`}
            >
              <div
                className={`border-b px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-slate-400"}`}
              >
                {t("admin.notifications.title")}
              </div>
              <div className="max-h-[min(70vh,360px)] overflow-y-auto">
                {notifLoading ? (
                  <p className={`px-4 py-6 text-center text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t("admin.notifications.loading")}
                  </p>
                ) : notifItems.length === 0 ? (
                  <p className={`px-4 py-6 text-center text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t("admin.notifications.empty")}
                  </p>
                ) : (
                  notifItems.map((item) => {
                    const isRead = readNotifIds.has(item.id);
                    const rowTint = isRead
                      ? isLight
                        ? "bg-slate-50"
                        : "bg-white/[0.03]"
                      : isLight
                        ? "bg-slate-200/85"
                        : "bg-white/[0.11]";
                    const rowHover = isRead ? notifRowHoverRead : notifRowHoverUnread;
                    return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`block border-b px-4 py-3 text-left transition last:border-b-0 ${rowTint} ${rowHover} ${isLight ? "border-slate-100" : "border-white/[0.06]"}`}
                      onClick={() => {
                        markNotificationRead(item.id);
                        setNotifOpen(false);
                      }}
                    >
                      <p className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {t(item.titleKey, item.titleParams || {})}
                      </p>
                      {item.subtitle ? (
                        <p className={`mt-0.5 line-clamp-2 text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>{item.subtitle}</p>
                      ) : null}
                      <p className={`mt-1 text-[10px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>{formatWhen(item.createdAt)}</p>
                    </Link>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className={`${chrome.topNavbarIconBtn}`}
          aria-label={theme === "dark" ? t("admin.topBar.themeLight") : t("admin.topBar.themeDark")}
          title={theme === "dark" ? t("admin.topBar.themeLight") : t("admin.topBar.themeDark")}
        >
          {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`hidden md:inline-flex ${chrome.topNavbarIconBtn}`}
          aria-label={t("admin.topBar.fullscreen")}
          title={t("admin.topBar.fullscreen")}
        >
          <IconFullscreen className="h-5 w-5" />
        </button>

        <div className={`ml-1 flex items-center gap-2 border-l pl-2 sm:ml-2 sm:pl-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-xs font-bold text-white shadow-md ring-2 ring-white/20 dark:ring-white/10"
            aria-hidden
          >
            {initial}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className={`truncate text-sm font-semibold leading-tight ${chrome.userBlockName}`}>
              {user?.name?.trim() || user?.email || t("admin.topBar.guest")}
            </p>
            <p className={`truncate text-xs ${chrome.userBlockRole}`}>
              {user?.role === "admin" ? t("admin.topBar.roleAdmin") : t("admin.topBar.roleUser")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
