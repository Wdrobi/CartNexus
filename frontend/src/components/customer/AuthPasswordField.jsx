import { useState } from "react";

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 003-3 3 3 0 00-.42-1.52M9.88 5.09A10.94 10.94 0 0112 5c6 0 10 7 10 7a18.5 18.5 0 01-5.06 5.17M6.12 6.12A18.4 18.4 0 002 12s4 7 10 7c1.09 0 2.12-.2 3.09-.56"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const inputClass = {
  dark: "h-12 w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 outline-none ring-brand-500/0 transition focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20",
  light:
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20",
};

export default function AuthPasswordField({
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  ariaLabel,
  variant = "dark",
}) {
  const [show, setShow] = useState(false);
  const v = variant === "light" ? "light" : "dark";
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-label={ariaLabel}
        className={inputClass[v]}
      />
      <button
        type="button"
        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition ${
          v === "light"
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            : "text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
