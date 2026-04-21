import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import { apiFetch } from "../api/apiBase.js";
import { normalizeExternalUrl } from "../utils/normalizeExternalUrl.js";
import { resolveWhatsAppUrl } from "../utils/whatsappUrl.js";

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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10l6-3v10l-6-3" strokeLinejoin="round" />
    </svg>
  );
}

function IconMessenger({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.02 2 10.95c0 2.07.82 4.01 2.27 5.62L2 22l5.62-2.96c1.52.82 3.26 1.29 5.07 1.31h.06c5.52 0 10-4.02 10-8.95S17.52 2 12 2zm.52 11.95h-.08c-.54 0-1.62-.34-2.91-1.24l-.24-.17-2.47 1.04.87-2.08-.18-.29c-.96-1.53-1.54-2.81-1.54-4.06 0-2.07 1.74-3.73 3.87-3.73 1.03 0 2 .43 2.73 1.21.73.76 1.14 1.76 1.13 2.82-.01 2.06-1.74 3.72-3.87 3.72z" />
    </svg>
  );
}

function IconWhatsApp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function SiteFooter({ showCta = true }) {
  const { t } = useTranslation();
  const { settings } = useStoreSettings();
  const whatsAppUrl = useMemo(() => resolveWhatsAppUrl(settings), [settings]);
  const messengerUrl = useMemo(() => {
    const raw = settings?.messengerUrl?.trim();
    return raw ? normalizeExternalUrl(raw) : null;
  }, [settings]);

  const year = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterError, setNewsletterError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const chatMenuRef = useRef(null);
  const chatFabRef = useRef(null);

  const showFabMenu = Boolean(whatsAppUrl || messengerUrl);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    function onDocDown(e) {
      const t = e.target;
      if (chatMenuRef.current?.contains(t) || chatFabRef.current?.contains(t)) return;
      setChatOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [chatOpen]);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onNewsletter(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    setNewsletterError(null);
    if (!trimmed) {
      setNewsletterError("missing_email");
      return;
    }
    const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmail.test(trimmed)) {
      setNewsletterError("invalid_email");
      return;
    }
    setNewsletterBusy(true);
    try {
      const r = await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "footer" }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setNewsletterError(data.error || "request_failed");
        return;
      }
      setJoined(true);
      setEmail("");
      window.setTimeout(() => setJoined(false), 4000);
    } catch {
      setNewsletterError("network");
    } finally {
      setNewsletterBusy(false);
    }
  }

  function toggleChatFab() {
    if (!showFabMenu) {
      document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setChatOpen((o) => !o);
  }

  const socialClass =
    "relative z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400/95 bg-white text-ink-950 shadow-sm ring-1 ring-black/[0.04] transition hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md";

  const socialItems = useMemo(() => {
    const raw = [
      { url: settings?.socialFacebookUrl, Icon: IconFacebook, label: "Facebook" },
      { url: settings?.socialInstagramUrl, Icon: IconInstagram, label: "Instagram" },
      { url: settings?.socialYoutubeUrl, Icon: IconYoutube, label: "YouTube" },
      { url: settings?.socialOtherUrl, Icon: IconVideo, label: t("footer.socialOtherAria") },
    ];
    return raw
      .map((item) => ({ ...item, href: normalizeExternalUrl(item.url) }))
      .filter((item) => Boolean(item.href));
  }, [settings, t]);

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
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {t("footer.ctaContact")}
                </Link>
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
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">{t("footer.aboutBody")}</p>
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
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("footer.quickLinks")}</h3>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col gap-2">
                  <Link to="/categories" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkBrands")}
                  </Link>
                  <Link to="/about" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkAbout")}
                  </Link>
                  <Link to="/contact" className="text-slate-600 transition hover:text-brand-700">
                    {t("footer.linkContact")}
                  </Link>
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
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{t("footer.stayConnected")}</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {socialItems.length > 0 ? (
                  socialItems.map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={socialClass}
                      aria-label={label}
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    </a>
                  ))
                ) : (
                  <>
                    <span className={`${socialClass} cursor-not-allowed opacity-[0.68]`} aria-hidden title={t("footer.socialPlaceholder")}>
                      <IconFacebook className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    </span>
                    <span className={`${socialClass} cursor-not-allowed opacity-[0.68]`} aria-hidden>
                      <IconInstagram className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    </span>
                    <span className={`${socialClass} cursor-not-allowed opacity-[0.68]`} aria-hidden>
                      <IconYoutube className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    </span>
                    <span className={`${socialClass} cursor-not-allowed opacity-[0.68]`} aria-hidden>
                      <IconVideo className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    </span>
                  </>
                )}
              </div>

              <p className="mt-8 text-sm font-medium text-slate-700">{t("footer.newsletterHint")}</p>
              <form onSubmit={onNewsletter} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNewsletterError(null);
                  }}
                  placeholder={t("footer.newsletterPlaceholder")}
                  disabled={newsletterBusy}
                  autoComplete="email"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={newsletterBusy}
                  className="shrink-0 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {newsletterBusy ? t("footer.newsletterSending") : t("footer.newsletterJoin")}
                </button>
              </form>
              {newsletterError && (
                <p className="mt-2 text-xs font-medium text-red-700">
                  {t(`footer.newsletterErr.${newsletterError}`, { defaultValue: "" }) || t("footer.newsletterErr.generic")}
                </p>
              )}
              {joined && (
                <p className="mt-2 text-xs font-medium text-brand-700">{t("footer.newsletterThanks")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-slate-200/40">
          <div className="flex w-full flex-col items-center justify-between gap-3 px-[20px] py-5 text-xs text-slate-600 sm:flex-row">
            <span>{t("footer.copyright", { year })}</span>
            <span className="text-center sm:text-right">{t("footer.crafted")}</span>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed z-40 flex flex-col items-end gap-3 [bottom:calc(1.5rem+env(safe-area-inset-bottom,0px))] [right:calc(1rem+env(safe-area-inset-right,0px))] sm:[right:calc(1.5rem+env(safe-area-inset-right,0px))]">
        {chatOpen && showFabMenu && (
          <div
            ref={chatMenuRef}
            className="pointer-events-auto mb-1 w-[min(100vw-2rem,17rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/15"
          >
            <p className="border-b border-slate-100 px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("footer.chatMenuTitle")}
            </p>
            <div className="flex flex-col py-1">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-brand-50 hover:text-brand-800"
                  onClick={() => setChatOpen(false)}
                >
                  <IconWhatsApp className="h-6 w-6 shrink-0 text-emerald-600" />
                  {t("footer.chatWhatsApp")}
                </a>
              ) : null}
              {messengerUrl ? (
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-brand-50 hover:text-brand-800"
                  onClick={() => setChatOpen(false)}
                >
                  <IconMessenger className="h-6 w-6 shrink-0 text-blue-600" />
                  {t("footer.chatMessenger")}
                </a>
              ) : null}
            </div>
          </div>
        )}
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
        <button
          ref={chatFabRef}
          type="button"
          className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-lg transition hover:border-brand-400 hover:text-brand-600"
          aria-expanded={chatOpen}
          aria-haspopup="true"
          aria-label={showFabMenu ? t("footer.supportMenuOpen") : t("footer.support")}
          onClick={toggleChatFab}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 11a8 8 0 0116 0v5a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2.5" strokeLinecap="round" />
            <path d="M8 11V9a4 4 0 018 0v2" strokeLinecap="round" />
          </svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden />
        </button>
      </div>
    </>
  );
}
