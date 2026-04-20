import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getWhatsAppChatUrl } from "../utils/whatsappUrl.js";

function ArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        d="M8.5 4.5h2l1.5 4.5-2 1a8 8 0 004 4l1-2 4.5 1.5v2a2 2 0 01-2 2A18 18 0 013 8.5a2 2 0 012-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.382-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconYoutube({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconVideo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10l6-3v10l-6-3" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteFooter({ showCta = true }) {
  const { t } = useTranslation();
  const whatsAppUrl = useMemo(() => getWhatsAppChatUrl(), []);
  const year = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onNewsletter(e) {
    e.preventDefault();
    if (email.trim()) {
      setJoined(true);
      setEmail("");
      setTimeout(() => setJoined(false), 4000);
    }
  }

  const socialClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300/80 text-slate-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600";

  return (
    <>
      {showCta && (
        <section className="relative w-full border-t border-white/5 bg-ink-950 px-[20px] py-14 sm:py-20">
          <div className="mx-auto w-full max-w-none">
            <motion.div
              className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-ink-900 via-brand-900/90 to-ink-950 px-6 py-12 text-center shadow-2xl sm:px-12 sm:py-14"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(45,212,191,0.15),transparent)]" />
              <h2 className="relative font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                {t("footer.ctaTitle")}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {t("footer.ctaSubtitle")}
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                <Link
                  to="/shop"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ink-950 shadow-lg transition hover:bg-brand-50 sm:w-auto"
                >
                  {t("footer.ctaBrowse")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {whatsAppUrl ? (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {t("footer.ctaContact")}
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {t("footer.ctaContact")}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <footer id="site-footer" className="scroll-mt-24 bg-slate-100 text-slate-800">
        <div className="w-full px-[20px] py-14 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <p className="font-display text-2xl font-bold text-ink-950">
                Cart<span className="text-brand-600">Nexus</span>
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                {t("footer.aboutBody")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  {t("footer.badge1")}
                </span>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  {t("footer.badge2")}
                </span>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  {t("footer.badge3")}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                {t("footer.quickLinks")}
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col gap-2">
                  <Link to="/categories" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkBrands")}
                  </Link>
                  <Link to="/about" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkAbout")}
                  </Link>
                  {whatsAppUrl ? (
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 transition hover:text-brand-700"
                    >
                      {t("footer.linkContact")}
                    </a>
                  ) : (
                    <Link to="/contact" className="text-slate-600 transition hover:text-brand-700">
                      {t("footer.linkContact")}
                    </Link>
                  )}
                  <Link to="/terms" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkTerms")}
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/blog" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkBlog")}
                  </Link>
                  <Link to="/faqs" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkFaq")}
                  </Link>
                  <Link to="/privacy" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkPrivacy")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4" id="newsletter">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                {t("footer.stayConnected")}
              </h3>
              <div className="mt-6 flex gap-3">
                <a href="#" className={socialClass} aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                  <IconFacebook className="h-4 w-4" />
                </a>
                <a href="#" className={socialClass} aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                  <IconInstagram className="h-4 w-4" />
                </a>
                <a href="#" className={socialClass} aria-label="YouTube" onClick={(e) => e.preventDefault()}>
                  <IconYoutube className="h-4 w-4" />
                </a>
                <a href="#" className={socialClass} aria-label="Video" onClick={(e) => e.preventDefault()}>
                  <IconVideo className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-8 text-sm font-medium text-slate-700">{t("footer.newsletterHint")}</p>
              <form onSubmit={onNewsletter} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-500"
                >
                  {t("footer.newsletterJoin")}
                </button>
              </form>
              {joined && (
                <p className="mt-2 text-xs font-medium text-brand-700">{t("footer.newsletterThanks")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-slate-200/40">
          <div className="flex w-full flex-col items-center justify-between gap-3 px-[20px] py-5 text-xs text-slate-600 sm:flex-row">
            <span>
              {t("footer.copyright", { year })}
            </span>
            <span className="text-center sm:text-right">{t("footer.crafted")}</span>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed z-40 flex flex-col gap-3 [bottom:calc(1.5rem+env(safe-area-inset-bottom,0px))] [right:calc(1rem+env(safe-area-inset-right,0px))] sm:[right:calc(1.5rem+env(safe-area-inset-right,0px))]">
        {showTop && (
          <motion.button
            type="button"
            onClick={scrollTop}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            aria-label={t("footer.backToTop")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-lg transition hover:border-brand-400 hover:text-brand-600"
            aria-label={t("footer.openWhatsApp")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M4 11a8 8 0 0116 0v5a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2.5" strokeLinecap="round" />
              <path d="M8 11V9a4 4 0 018 0v2" strokeLinecap="round" />
            </svg>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden />
          </a>
        ) : (
          <button
            type="button"
            className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-lg transition hover:border-brand-400 hover:text-brand-600"
            aria-label={t("footer.support")}
            onClick={() => document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M4 11a8 8 0 0116 0v5a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2.5" strokeLinecap="round" />
              <path d="M8 11V9a4 4 0 018 0v2" strokeLinecap="round" />
            </svg>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}
