import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { authFetch } from "../../api/authFetch.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useCart } from "../../cart/CartContext.jsx";
import { formatMemberSince, userInitials } from "../../utils/userDisplay.js";

function daysSinceJoined(createdAt) {
  if (!createdAt) return null;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

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

function IconClock({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
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
  const { totalQty } = useCart();
  const [addressCount, setAddressCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [pendingOrderCount, setPendingOrderCount] = useState(null);
  const displayName = user?.name?.trim() || user?.email || "";
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const initials = userInitials(user?.name, user?.email);
  const memberSince = formatMemberSince(user?.created_at, i18n.language);
  const memberDays = daysSinceJoined(user?.created_at);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/auth/addresses")
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((d) => {
        if (!cancelled) setAddressCount((d.addresses || []).length);
      })
      .catch(() => {
        if (!cancelled) setAddressCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => {
        if (cancelled) return;
        const list = d.orders || [];
        setOrderCount(list.length);
        setPendingOrderCount(list.filter((o) => o.status === "pending").length);
      })
      .catch(() => {
        if (!cancelled) {
          setOrderCount(0);
          setPendingOrderCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      to: "/shop",
      icon: IconShop,
      title: t("account.dashboard.shopTitle"),
      desc: t("account.dashboard.shopDesc"),
      accent: "from-violet-500/20 to-transparent",
    },
    {
      to: "/account/orders",
      icon: IconPackage,
      title: t("account.dashboard.ordersTitle"),
      desc: t("account.dashboard.ordersDesc"),
      accent: "from-sky-500/20 to-transparent",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
  };

  const orderStats = {
    total: orderCount ?? 0,
    pending: pendingOrderCount ?? 0,
    cartItems: totalQty,
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-8 lg:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" aria-hidden />
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
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                <span className="text-gradient-brand">{t("account.dashboard.welcomeShort", { name: firstName })}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {t("account.dashboard.blurb")}
              </p>
            </div>
          </div>
          <Link
            to="/account/profile"
            className="group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
          >
            {t("account.dashboard.editProfileCta")}
            <span className="transition group-hover/btn:translate-x-0.5" aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className="relative mt-10 border-t border-slate-100 pt-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {t("account.dashboard.statsHeading")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t("account.dashboard.statsSub")}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                key: "orders",
                to: "/account/orders",
                icon: IconPackage,
                label: t("account.dashboard.statTotalOrders"),
                value: orderStats.total,
                ring: "ring-brand-500/15",
                iconBg: "bg-brand-50 text-brand-600",
              },
              {
                key: "pending",
                to: "/account/orders",
                icon: IconClock,
                label: t("account.dashboard.statPendingOrders"),
                value: orderStats.pending,
                ring: "ring-amber-500/15",
                iconBg: "bg-amber-50 text-amber-700",
              },
              {
                key: "addresses",
                to: "/account/addresses",
                icon: IconMapPin,
                label: t("account.dashboard.statSavedAddresses"),
                value: addressCount,
                ring: "ring-teal-500/15",
                iconBg: "bg-teal-50 text-teal-700",
              },
              {
                key: "cart",
                to: "/cart",
                icon: IconBag,
                label: t("account.dashboard.statCartItems"),
                value: orderStats.cartItems,
                ring: "ring-violet-500/15",
                iconBg: "bg-violet-50 text-violet-700",
              },
            ].map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.04, type: "spring", stiffness: 420, damping: 32 }}
              >
                <Link
                  to={s.to}
                  className={`group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ${s.ring} transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-h-[2.5rem] text-left text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:min-h-0">
                      {s.label}
                    </p>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-200/80 ${s.iconBg}`}
                    >
                      <s.icon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
                    </span>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                    {typeof s.value === "number" ? s.value : "—"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    {t("account.dashboard.go")}
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-slate-500">
                <IconCalendar className="h-4 w-4 shrink-0" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-wide">{t("account.dashboard.statMember")}</p>
              </div>
              <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
                {memberSince || t("account.dashboard.statMemberUnknown")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("account.dashboard.statDaysMember")}
              </p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900">
                {memberDays != null ? memberDays : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t("account.dashboard.statDaysMemberHint")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-slate-500">
                <IconShield className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-wide">{t("account.dashboard.statAccount")}</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{t("account.badge.customer")}</p>
              <p className="mt-2 text-xs font-medium text-emerald-700">{t("account.dashboard.statVerified")}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <h2 className="font-display text-lg font-semibold text-slate-900">{t("account.dashboard.quickSection")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("account.dashboard.quickSectionHint")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 400, damping: 28 }}
            >
              <Link
                to={c.to}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-slate-200/80"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100 ${c.accent}`}
                  aria-hidden
                />
                <div className="relative">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-brand-600 ring-1 ring-slate-200/80 transition duration-300 group-hover:scale-105 group-hover:bg-brand-50 group-hover:ring-brand-200">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2 group-hover:text-brand-500">
                    {t("account.dashboard.go")}
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
