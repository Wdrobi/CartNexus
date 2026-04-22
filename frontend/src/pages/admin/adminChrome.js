/**
 * Central class map for admin light/dark chrome (navbar, shell, sidebar, main).
 * Light mode: **main canvas + top bar** use a light palette; **left sidebar** stays the same dark chrome as dark mode.
 */

const THEME_KEY = "cartnexus.admin.theme.v1";

export function readStoredAdminTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function persistAdminTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** Shared dark sidebar + shell base (also used when global theme is “light”). */
const darkChrome = {
  shell: "min-h-dvh bg-[#10151d] text-slate-100",
  aside:
    "relative flex shrink-0 flex-col overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#161f2f] via-[#121a28] to-[#0d121a] lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:max-h-dvh lg:w-[19rem] lg:max-w-[19rem] lg:self-start lg:border-b-0 lg:border-r lg:border-white/[0.08] lg:shadow-[inset_-1px_0_0_rgba(45,212,191,0.06)]",
  main:
    "relative min-w-0 flex-1 border-l border-transparent bg-[#0c1018] px-[20px] py-4 sm:py-6 lg:rounded-tl-3xl lg:border-l-white/[0.05] lg:bg-[#0e1420]/98 lg:py-8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]",
  mobileOverlay: "bg-black/55",
  logoCard:
    "group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-3 shadow-lg shadow-black/20 ring-1 ring-white/[0.06] transition hover:border-brand-500/25 hover:shadow-brand-900/20",
  sectionHint: "text-slate-500",
  sectionHintLabel: "text-slate-600",
  sectionHintValue: "text-brand-200/90",
  navScroll: "[scrollbar-color:rgba(255,255,255,0.15)_transparent]",
  bottomBar: "border-white/[0.07]",
  logoutBtn:
    "border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-red-500/40 hover:bg-red-500/[0.12] hover:text-red-200",
  viewSiteLink:
    "border border-brand-500/40 from-brand-500/[0.18] via-teal-600/[0.12] to-slate-900/40 ring-1 ring-brand-400/15 hover:border-brand-300/55 hover:from-brand-500/28 hover:via-teal-500/[0.18] hover:to-slate-900/55 hover:shadow-[0_12px_32px_-12px_rgba(45,212,191,0.5)] hover:ring-brand-300/25 focus-visible:ring-offset-[#0e1424]",
  viewSiteIcon: "text-brand-200 group-hover:text-white",
  viewSiteText: "text-brand-50 group-hover:text-white",
  blurBlob: "opacity-100",
  collapsibleWrap: "rounded-xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  collapsibleTitle: "text-slate-400",
  collapsibleBtn: "hover:bg-white/[0.05]",
  liveDotRing: "ring-[#121a2e]",
  itemActive:
    "border-brand-500/35 bg-gradient-to-r from-brand-500/20 via-brand-500/[0.08] to-transparent text-white shadow-[0_0_24px_-4px_rgba(20,184,166,0.35),inset_0_0_0_1px_rgba(45,212,191,0.12)]",
  itemIdle:
    "text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-slate-100",
  iconActive: "bg-brand-500/25 text-brand-100 shadow-inner ring-1 ring-brand-400/30",
  iconIdle:
    "bg-white/[0.05] text-slate-500 ring-1 ring-white/[0.04] group-hover:bg-white/[0.09] group-hover:text-slate-300 group-hover:ring-white/[0.08]",
  topNavbar:
    "border-white/[0.07] bg-[#141c2a]/92 text-slate-100 shadow-[0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md",
  topNavbarIconBtn:
    "rounded-xl border border-transparent p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white",
  topNavbarSearchWrap: "rounded-xl border border-white/[0.08] bg-white/[0.04]",
  topNavbarSearchInput: "placeholder:text-slate-500 text-slate-100",
  userBlockName: "text-white",
  userBlockRole: "text-slate-400",
};

const lightChromeOverrides = {
  shell: "min-h-dvh bg-slate-100 text-slate-900",
  /** Slightly darker canvas so white cards / tables separate clearly */
  main:
    "relative min-w-0 flex-1 border-l border-slate-200/80 bg-slate-100 px-[20px] py-4 sm:py-6 lg:rounded-tl-2xl lg:border-l-slate-300/70 lg:bg-slate-100 lg:py-6 lg:shadow-none",
  mobileOverlay: "bg-slate-900/40",
  topNavbar:
    "border-slate-200/90 bg-white/95 text-slate-800 shadow-sm shadow-slate-200/40 backdrop-blur-md",
  topNavbarIconBtn:
    "rounded-xl border border-transparent p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
  topNavbarSearchWrap: "rounded-xl border border-slate-200/90 bg-slate-50",
  topNavbarSearchInput: "placeholder:text-slate-400 text-slate-900",
  userBlockName: "text-slate-900",
  userBlockRole: "text-slate-500",
};

export function getAdminChrome(isLight) {
  if (!isLight) return { ...darkChrome };
  return { ...darkChrome, ...lightChromeOverrides };
}
