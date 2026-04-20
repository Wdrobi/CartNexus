import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiBase.js";

function htmlHasVisibleText(html) {
  if (html == null) return false;
  const text = String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

/**
 * @param {'terms' | 'faqs' | 'privacy'} pageKey
 */
export function useCmsPage(pageKey) {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await apiFetch(`/api/cms/pages/${encodeURIComponent(pageKey)}`);
        if (cancelled) return;
        if (r.ok) {
          const data = await r.json();
          setPage(data.page ?? null);
        } else {
          setPage(null);
        }
      } catch {
        if (!cancelled) setPage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  const isBn = i18n.language?.startsWith("bn");
  const rawHtml = isBn ? page?.bodyHtmlBn : page?.bodyHtmlEn;
  const hasContent = htmlHasVisibleText(rawHtml);

  return {
    loading,
    html: rawHtml ?? "",
    hasContent,
    updatedAt: page?.updatedAt ?? null,
  };
}
