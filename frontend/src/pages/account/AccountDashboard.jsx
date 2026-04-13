import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext.jsx";
import { formatMemberSince, userInitials } from "../../utils/userDisplay.js";

function IconBag({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12L4.5 4H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 6.5-4 8-4s6.5 0 8 4" strokeLinecap="round" />
    </svg>
  );
}

function IconShop({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 10h16l-1 10H5L4 10Z" strokeLinejoin="round" />
      <path d="M8 10V7a4 4 0 118 0v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 6V4m8 2V4M5 10h14M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPackage({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 16V8l-9-4-9 4v8l9 4 9-4Z" strokeLinejoin="round" />
      <path d="M3.3 8L12 12l8.7-4M12 21V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function AccountDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email || "";
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const initials = userInitials(user?.name, user?.email);
  const memberSince = formatMemberSince(user?.created_at, i18n.language);

  const cards = [
    {
      to: "/shop",
      icon: IconShop,
      title: t("account.dashboard.shopTitle"),
      desc: t("account.dashboard.shopDesc"),
      accent: "from-violet-500/20 to-transparent",
    },
    {
      to: "/cart",
      icon: IconBag,
      title: t("account.dashboard.cartTitle"),
      desc: t("account.dashboard.cartDesc"),
      accent: "from-amber-500/15 to-transparent",
    },
    {
      to: "/account/profile",
      icon: IconUser,
      title: t("account.dashboard.profileTitle"),
      desc: t("account.dashboard.profileDesc"),
      accent: "from-brand-500/25 to-transparent",
    },
    {
      to: "/account/addresses",
      icon: IconMapPin,
      title: t("account.dashboard.addressesTitle"),
      desc: t("account.dashboard.addressesDesc"),
      accent: "from-teal-500/20 to-transparent",
    },
  ];

  const statItems = [
    {
      icon: IconCalendar,
      label: t("account.dashboard.statMember"),
      value: memberSince || t("account.dashboard.statMemberUnknown"),
    },
    {
      icon: IconSpark,
      label: t("account.dashboard.statAccount"),
      value: t("account.badge.customer"),
    },
    {
      icon: IconShield,
      label: t("account.dashboard.statSecurity"),
      value: t("account.dashboard.statVerified"),
    },
  ];

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800/80 via-ink-900/90 to-ink-950 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-600/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-teal-700 text-xl font-bold text-white shadow-lg ring-2 ring-white/10 sm:h-[4.5rem] sm:w-[4.5rem] sm:text-2xl"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400/95">
                {t("account.dashboard.kicker")}
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                <span className="text-gradient-brand">{t("account.dashboard.welcomeShort", { name: firstName })}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {t("account.dashboard.blurb")}
              </p>
            </div>
          </div>
          <Link
            to="/account/profile"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            {t("account.dashboard.editProfileCta")}
          </Link>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {statItems.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="flex gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-400">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                <p className="truncate font-medium text-slate-200">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">{t("account.dashboard.quickSection")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("account.dashboard.quickSectionHint")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={c.to}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-900/20"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100 ${c.accent}`}
                  aria-hidden
                />
                <div className="relative">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-brand-400 ring-1 ring-white/10 transition group-hover:bg-brand-500/15 group-hover:text-brand-300">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{c.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-400 transition group-hover:gap-2 group-hover:text-brand-300">
                    {t("account.dashboard.go")}
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/40 p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-10 lg:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-700/80 to-ink-950 ring-1 ring-white/10">
            <IconPackage className="h-10 w-10 text-slate-400" />
          </div>
          <div className="mt-6 min-w-0 flex-1 lg:mt-0">
            <h3 className="font-display text-xl font-semibold text-white">{t("account.orders.title")}</h3>
            <p className="mt-2 max-w-lg text-sm text-slate-500">{t("account.orders.empty")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to="/shop"
                className="inline-flex rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
              >
                {t("account.orders.browseShop")}
              </Link>
              <Link
                to="/contact"
                className="inline-flex rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/5"
              >
                {t("account.orders.needHelp")}
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
