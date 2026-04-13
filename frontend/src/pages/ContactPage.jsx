import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiBase.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

/** OpenStreetMap embed — Dhaka city centre (placeholder). Replace with your real map if needed. */
const MAP_EMBED_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=90.365%2C23.765%2C90.445%2C23.825&layer=mapnik&marker=23.7937%2C90.4066";

function IconMapPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M8.5 4.5h2l1.5 4.5-2 1a8 8 0 004 4l1-2 4.5 1.5v2a2 2 0 01-2 2A18 18 0 013 8.5a2 2 0 012-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorKey, setErrorKey] = useState(null);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrorKey(null);
    setStatus((s) => (s === "success" ? "idle" : s));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorKey(null);
    try {
      const r = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrorKey(data.error || "request_failed");
        setStatus("idle");
        return;
      }
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch {
      setErrorKey("network");
      setStatus("idle");
    }
  }

  const infoCards = [
    {
      icon: IconMapPin,
      titleKey: "infoAddressTitle",
      bodyKey: "infoAddressBody",
      subKey: "infoAddressLine2",
    },
    {
      icon: IconPhone,
      titleKey: "infoPhoneTitle",
      bodyKey: "infoPhoneBody",
      subKey: "infoPhoneNote",
    },
    {
      icon: IconMail,
      titleKey: "infoEmailTitle",
      bodyKey: "infoEmailBody",
      subKey: "infoEmailNote",
    },
    {
      icon: IconClock,
      titleKey: "infoHoursTitle",
      bodyKey: "infoHoursBody",
      subKey: "infoHoursNote",
    },
  ];

  const faqIds = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-90" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("contactPage.heroKicker")}
          </motion.p>
          <motion.h1
            className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {t("contactPage.heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("contactPage.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-6 lg:col-span-5">
              <h2 className="font-display text-xl font-bold text-ink-950 md:text-2xl">
                {t("contactPage.infoSectionTitle")}
              </h2>
              <ul className="space-y-4">
                {infoCards.map(({ icon: Icon, titleKey, bodyKey, subKey }, idx) => (
                  <motion.li
                    key={titleKey}
                    className="flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 transition hover:border-brand-200/80 hover:bg-white"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-30px" }}
                    custom={idx}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-950">
                        {t(`contactPage.${titleKey}`)}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-800">{t(`contactPage.${bodyKey}`)}</p>
                      <p className="mt-1 text-xs text-slate-500">{t(`contactPage.${subKey}`)}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-inner">
                <iframe
                  title={t("contactPage.mapTitle")}
                  src={MAP_EMBED_SRC}
                  className="h-52 w-full border-0 sm:h-64"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="border-t border-slate-200/80 px-4 py-3 text-center text-xs text-slate-500">
                  <a
                    href="https://www.openstreetmap.org/?mlat=23.7937&mlon=90.4066#map=14/23.7937/90.4066"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 underline-offset-2 hover:underline"
                  >
                    {t("contactPage.mapOpen")}
                  </a>
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <motion.div
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-8 md:p-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45 }}
              >
                <h2 className="font-display text-xl font-bold text-ink-950 md:text-2xl">{t("contactPage.formTitle")}</h2>
                <p className="mt-2 text-sm text-slate-600">{t("contactPage.formSubtitle")}</p>

                <form onSubmit={onSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-first" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("contactPage.fieldFirstName")}
                      </label>
                      <input
                        id="cf-first"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        maxLength={120}
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-last" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("contactPage.fieldLastName")}
                      </label>
                      <input
                        id="cf-last"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        maxLength={120}
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cf-email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("contactPage.fieldEmail")}
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="cf-subject" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("contactPage.fieldSubject")}
                    </label>
                    <input
                      id="cf-subject"
                      name="subject"
                      type="text"
                      required
                      maxLength={200}
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="cf-message" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("contactPage.fieldMessage")}
                    </label>
                    <textarea
                      id="cf-message"
                      name="message"
                      required
                      rows={5}
                      maxLength={8000}
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {errorKey && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                      {t(`contactPage.err.${errorKey}`, { defaultValue: "" }) || t("contactPage.err.generic")}
                    </p>
                  )}
                  {status === "success" && (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                      {t("contactPage.formSuccess")}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full rounded-xl bg-ink-950 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
                  >
                    {status === "sending" ? t("contactPage.formSending") : t("contactPage.formSubmit")}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-24 border-b border-slate-200/80 bg-slate-50 py-12 sm:py-16 md:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink-950 md:text-3xl">{t("contactPage.faqTitle")}</h2>
            <p className="mt-3 text-slate-600">{t("contactPage.faqSubtitle")}</p>
          </div>
          <div className="mt-10 space-y-3">
            {faqIds.map((n) => (
              <details
                key={n}
                className="group rounded-2xl border border-slate-200/90 bg-white px-5 py-1 shadow-sm open:shadow-md open:ring-1 open:ring-brand-500/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-display text-sm font-semibold text-ink-950 marker:hidden md:text-base [&::-webkit-details-marker]:hidden">
                  {t(`contactPage.faq${n}Q`)}
                  <span className="text-brand-600 transition group-open:rotate-180">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="border-t border-slate-100 pb-4 pt-0 text-sm leading-relaxed text-slate-600">
                  {t(`contactPage.faq${n}A`)}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            {t("contactPage.faqFooter")}{" "}
            <Link to="/shop" className="font-semibold text-brand-700 hover:underline">
              {t("contactPage.faqShopLink")}
            </Link>
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-950 py-14 text-white sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,212,191,0.12),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("contactPage.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">{t("contactPage.ctaSubtitle")}</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400"
          >
            {t("contactPage.ctaButton")}
          </Link>
        </div>
      </section>

      <SiteFooter showCta={false} />
    </div>
  );
}
