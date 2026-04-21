import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { apiFetch } from "../../api/apiBase.js";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token, user, ready } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  if (!ready) {
    return (
      <div className="flex min-h-dvh min-w-0 items-center justify-center bg-ink-950 text-slate-400">
        {t("auth.loading")}
      </div>
    );
  }
  if (ready && token && String(user?.role) === "admin") {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setErrorDetail(null);
    setSubmitting(true);
    try {
      const r = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username.trim(), password }),
      });
      const raw = await r.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!r.ok) {
        setError(data.error || "request_failed");
        if (data.message) setErrorDetail(String(data.message));
        return;
      }
      if (!data.token || typeof data.token !== "string") {
        setError("bad_response");
        if (raw && raw.length < 200 && !raw.trim().startsWith("{")) {
          setErrorDetail(t("auth.errors.badResponseHint"));
        }
        return;
      }
      login(data.token, data.user, true);
      navigate(from, { replace: true });
    } catch {
      setError("network");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-dvh min-w-0 overflow-x-clip bg-ink-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,rgba(20,184,166,0.18),transparent)]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-dvh min-w-0 flex-col items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/"
            className="group mb-8 inline-flex max-w-full items-center gap-3 rounded-xl border border-brand-500/35 bg-gradient-to-r from-brand-500/[0.14] via-teal-600/[0.09] to-slate-900/30 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_-12px_rgba(20,184,166,0.45)] ring-1 ring-brand-400/15 transition hover:border-brand-300/50 hover:from-brand-500/22 hover:via-teal-500/14 hover:shadow-[0_14px_36px_-10px_rgba(45,212,191,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/45"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/25 text-brand-50 ring-1 ring-brand-400/30 transition group-hover:bg-brand-400/30 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-brand-50 group-hover:text-white">{t("admin.backSite")}</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200/65 group-hover:text-brand-100/90">
                {t("admin.backSiteKicker")}
              </span>
            </span>
          </Link>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/85 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div
              className="h-0.5 w-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600"
              aria-hidden
            />
            <div className="px-5 pb-10 pt-9 sm:px-10">
              <p className="font-display text-xl font-semibold tracking-tight text-white">
                Cart<span className="text-brand-400">Nexus</span>
              </p>
              <h1 className="mt-4 font-display text-2xl font-bold text-white">
                {t("auth.loginTitle")}
              </h1>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="admin-user"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {t("auth.username")}
                  </label>
                  <input
                    id="admin-user"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-brand-500/45 focus:ring-2 focus:ring-brand-500/15"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-pass"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {t("auth.passwordField")}
                  </label>
                  <input
                    id="admin-pass"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[15px] text-white outline-none transition focus:border-brand-500/45 focus:ring-2 focus:ring-brand-500/15"
                    required
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95"
                    role="alert"
                  >
                    <p>
                      {t(`auth.errors.${error}`, { defaultValue: t("auth.errors.generic") })}
                    </p>
                    {errorDetail && (
                      <p className="mt-2 font-mono text-xs leading-relaxed text-amber-200/80">
                        {errorDetail}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t("auth.submitting") : t("auth.submit")}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
