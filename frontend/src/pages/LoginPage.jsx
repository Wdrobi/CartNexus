import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext.jsx";
import CustomerAuthLayout from "../components/customer/CustomerAuthLayout.jsx";
import AuthPasswordField from "../components/customer/AuthPasswordField.jsx";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, token, user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (ready && token && user?.role === "customer") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setErrorDetail(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
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
      login(data.token, data.user, remember);
      if (data.user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch {
      setError("network");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomerAuthLayout variant="login">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-300"
      >
        <span aria-hidden>←</span>
        {t("customerAuth.backHome")}
      </Link>

      <p className="font-display text-2xl font-bold tracking-tight text-white">
        Cart<span className="text-brand-400">Nexus</span>
      </p>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">{t("customerAuth.loginTitle")}</h1>
      <p className="mt-2 text-sm text-slate-400">{t("customerAuth.loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("customerAuth.emailPlaceholder")}
          aria-label={t("customerAuth.emailPlaceholder")}
          className="h-12 w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-brand-500/0 transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20"
          required
        />
        <AuthPasswordField
          id="login-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("customerAuth.passwordPlaceholder")}
          autoComplete="current-password"
          disabled={submitting}
          ariaLabel={t("customerAuth.passwordPlaceholder")}
        />

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-ink-900/80 text-brand-500 focus:ring-brand-500/40"
            />
            {t("customerAuth.rememberMe")}
          </label>
          <button
            type="button"
            className="font-medium text-brand-400 transition hover:text-brand-300"
            onClick={(e) => e.preventDefault()}
          >
            {t("customerAuth.forgotPassword")}
          </button>
        </div>

        {error && (
          <div
            className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95"
            role="alert"
          >
            <p>{t(`auth.errors.${error}`, { defaultValue: t("auth.errors.generic") })}</p>
            {errorDetail && (
              <p className="mt-2 font-mono text-xs leading-relaxed text-amber-200/80">{errorDetail}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-ink-950 shadow-xl shadow-black/25 transition hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t("customerAuth.submitting") : t("customerAuth.loginSubmit")}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {t("customerAuth.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-brand-400 transition hover:text-brand-300">
          {t("customerAuth.signUp")}
        </Link>
      </p>
    </CustomerAuthLayout>
  );
}
