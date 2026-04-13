import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HomeDealCountdown() {
  const { t } = useTranslation();
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const days = 3;
    const end = Date.now() + days * 24 * 60 * 60 * 1000;
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setParts({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { v: parts.d, label: t("home.dmCountdownDays") },
    { v: parts.h, label: t("home.dmCountdownHours") },
    { v: parts.m, label: t("home.dmCountdownMins") },
    { v: parts.s, label: t("home.dmCountdownSecs") },
  ];

  return (
    <section className="border-y border-brand-100 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">{t("home.dmDealKicker")}</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{t("home.dmDealTitle")}</h2>
            <p className="mt-3 text-neutral-600">{t("home.dmDealSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop?sort=hot"
                className="inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-900/10 transition hover:bg-brand-700"
              >
                {t("home.dmDealShop")}
              </Link>
              <Link
                to="/shop?sale=1"
                className="inline-flex rounded-full border border-brand-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink-900 transition hover:border-brand-300 hover:bg-brand-50"
              >
                {t("home.dmDealOffers")}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:justify-end">
            {cells.map(({ v, label }) => (
              <div
                key={label}
                className="flex min-w-[4rem] flex-col items-center rounded-xl border border-brand-100 bg-brand-50/80 px-3 py-3 sm:min-w-[4.5rem] sm:px-4 sm:py-4"
              >
                <span className="font-display text-2xl font-bold tabular-nums text-brand-800 sm:text-3xl">
                  {String(v).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-brand-700/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
