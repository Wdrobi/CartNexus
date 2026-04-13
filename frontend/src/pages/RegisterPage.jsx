import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiBase.js";
import { useAuth } from "../auth/AuthContext.jsx";
import CustomerAuthLayout from "../components/customer/CustomerAuthLayout.jsx";
import AuthPasswordField from "../components/customer/AuthPasswordField.jsx";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, token, user, ready } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <CustomerAuthLayout variant="register">
        <p className="text-center text-slate-400">{t("auth.loading")}</p>
      </CustomerAuthLayout>
    );
  }

  if (token && user) {
    if (String(user.role) === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/account" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setErrorDetail(null);
    if (password !== confirm) {
      setError("password_mismatch");
      return;
    }
    if (password.length < 8) {
      setError("weak_password");
      return;
    }
    if (!name.trim()) {
      setError("missing_fields");
      return;
    }
    setSubmitting(true);
    try {
      const r = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
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
        return;
      }
      login(data.token, data.user, true);
      navigate("/account", { replace: true });
    } catch {
      setError("network");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomerAuthLayout variant="register">
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
      <h1 className="mt-6 font-display text-3xl font-bold text-white">{t("customerAuth.registerTitle")}</h1>
      <p className="mt-2 text-sm text-slate-400">{t("customerAuth.registerSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("customerAuth.fullNamePlaceholder")}
          aria-label={t("customerAuth.fullNamePlaceholder")}
          className="h-12 w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-brand-500/0 transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20"
          required
        />
        <input
          id="reg-email"
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
          id="reg-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("customerAuth.createPasswordPlaceholder")}
          autoComplete="new-password"
          disabled={submitting}
          ariaLabel={t("customerAuth.createPasswordPlaceholder")}
        />
        <AuthPasswordField
          id="reg-confirm"
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("customerAuth.confirmPasswordPlaceholder")}
          autoComplete="new-password"
          disabled={submitting}
          ariaLabel={t("customerAuth.confirmPasswordPlaceholder")}
        />

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
          {submitting ? t("customerAuth.submitting") : t("customerAuth.registerSubmit")}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {t("customerAuth.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-brand-400 transition hover:text-brand-300">
          {t("customerAuth.loginLink")}
        </Link>
      </p>
    </CustomerAuthLayout>
  );
}
