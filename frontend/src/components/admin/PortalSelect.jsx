import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Replaces native `<select>` on dark admin pages: OS dropdown panels often render
 * light backgrounds with inherited white text → unreadable options.
 */
export function PortalSelect({ value, onChange, options, disabled = false, triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [rect, setRect] = useState(null);

  const selectedLabel =
    options.find((o) => String(o.value) === String(value))?.label ?? String(value ?? "");

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({
      top: r.bottom + 6,
      left: r.left,
      width: Math.max(r.width, 160),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onScrollResize = () => measure();
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let removeListener = () => {};
    const timer = window.setTimeout(() => {
      const closeIfOutside = (e) => {
        if (btnRef.current?.contains(e.target)) return;
        if (menuRef.current?.contains(e.target)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", closeIfOutside, true);
      removeListener = () => document.removeEventListener("pointerdown", closeIfOutside, true);
    }, 0);
    return () => {
      clearTimeout(timer);
      removeListener();
    };
  }, [open]);

  const menu =
    open &&
    rect &&
    createPortal(
      <div
        ref={menuRef}
        role="listbox"
        className="z-[300] max-h-[min(60vh,320px)] overflow-y-auto rounded-lg border border-white/15 bg-slate-900 py-1 shadow-2xl shadow-black/70"
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          minWidth: rect.width,
        }}
      >
        {options.map((o, idx) => {
          const v = o.value;
          const isSelected = String(v) === String(value);
          return (
            <button
              key={`opt-${idx}-${String(v)}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`flex w-full items-center px-3 py-2 text-left text-sm text-slate-100 hover:bg-white/12 ${
                isSelected ? "bg-white/10 font-medium text-white" : ""
              }`}
              onClick={() => {
                setOpen(false);
                if (String(v) !== String(value)) onChange(v);
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className="relative min-w-0">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen((x) => !x);
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-left text-sm text-white outline-none focus:border-brand-500/40 disabled:opacity-50 ${triggerClassName}`}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <span className="shrink-0 opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {menu}
    </div>
  );
}
