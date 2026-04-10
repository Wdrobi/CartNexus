import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "bn", short: "BN" },
  { code: "en", short: "EN" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const active = i18n.language?.startsWith("bn") ? "bn" : "en";

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="group"
      aria-label={t("lang.label")}
    >
      <span className="hidden text-xs text-slate-500 sm:inline">{t("lang.label")}</span>
      <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5">
        {LANGS.map(({ code, short }) => (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active === code
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            aria-pressed={active === code}
            title={t(`lang.${code}`)}
          >
            {short}
          </button>
        ))}
      </div>
    </div>
  );
}
