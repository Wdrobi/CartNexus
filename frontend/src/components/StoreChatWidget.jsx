import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiBase.js";

/** Linkify https URLs and /shop/... paths inside assistant messages. */
function ChatBubbleText({ text, isUser }) {
  const raw = String(text ?? "");
  const linkClass = isUser
    ? "font-medium text-white underline decoration-white/70 underline-offset-2"
    : "font-medium text-brand-700 underline decoration-brand-400/60 underline-offset-2 hover:text-brand-800";

  const lines = raw.split("\n");
  return (
    <span className="whitespace-pre-wrap break-words">
      {lines.map((line, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 ? "\n" : null}
          <LineWithLinks text={line} linkClass={linkClass} />
        </span>
      ))}
    </span>
  );
}

function LineWithLinks({ text, linkClass }) {
  const re = /(https?:\/\/[^\s]+)|(\/shop\/[a-zA-Z0-9\-_%]+)/g;
  const parts = [];
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      parts.push(<span key={`t-${key++}`}>{text.slice(last, m.index)}</span>);
    }
    if (m[1]) {
      parts.push(
        <a key={`e-${key++}`} href={m[1]} className={linkClass} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      );
    } else if (m[2]) {
      parts.push(
        <Link key={`i-${key++}`} to={m[2]} className={linkClass}>
          {m[2]}
        </Link>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={`t-${key++}`}>{text.slice(last)}</span>);
  }
  return parts.length ? parts : text;
}

export default function StoreChatWidget() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: "assistant", text: t("chat.intro") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const hidden = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", text: t("chat.intro") }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const r = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale: i18n.language }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data.error || data.message || String(r.status));
      }
      const reply = typeof data.reply === "string" ? data.reply : t("chat.error");
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("chat.error") }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, i18n.language, t]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-[60] flex flex-col items-start gap-3 p-4 sm:p-5 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
      <div
        id="cartnexus-chat-panel"
        className={`pointer-events-auto mb-3 flex max-h-[min(520px,calc(100dvh-8rem))] w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_50px_-12px_rgba(15,23,42,0.25)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-[#121a28] ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-teal-700 px-4 py-3 text-white dark:border-white/10">
          <div>
            <p className="font-display text-sm font-bold tracking-tight">{t("chat.title")}</p>
            <p className="text-[11px] text-white/85">{t("chat.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/15"
            aria-label={t("chat.close")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div
          ref={listRef}
          className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm [scrollbar-width:thin]"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-slate-100 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100"
                }`}
              >
                <ChatBubbleText text={msg.text} isUser={msg.role === "user"} />
              </div>
            </div>
          ))}
          {loading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("chat.typing")}</p>
          ) : null}
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("chat.placeholder")}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500/30 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 dark:border-white/15 dark:bg-[#0c1222] dark:text-white dark:placeholder:text-slate-500"
              disabled={loading}
              aria-label={t("chat.placeholder")}
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t("chat.send")}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(13,148,136,0.65)] ring-2 ring-white/40 transition hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:ring-white/10"
        aria-expanded={open}
        aria-controls="cartnexus-chat-panel"
        aria-label={open ? t("chat.close") : t("chat.open")}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
