import { useTranslation } from "react-i18next";

/**
 * @param {{ sections: Array<{ title?: string; body?: string }> | null | undefined; fallbackText?: string }} props
 */
export default function ProductDescriptionSections({ sections, fallbackText }) {
  const { t } = useTranslation();
  const list = Array.isArray(sections) ? sections.filter((s) => s && (s.title || s.body)) : [];

  if (!list.length) {
    if (!fallbackText?.trim()) return null;
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">{t("shop.product.descriptionHeading")}</h2>
        <div className="prose prose-slate prose-sm mt-3 max-w-none whitespace-pre-line text-slate-600 sm:prose-base">
          {fallbackText}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="product-desc-heading">
      <h2 id="product-desc-heading" className="font-display text-lg font-semibold text-slate-900">
        {t("shop.product.detailsHeading")}
      </h2>
      <div className="grid gap-4 sm:gap-5">
        {list.map((section, idx) => (
          <article
            key={`${section.title ?? "s"}-${idx}`}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
          >
            {section.title ? (
              <h3 className="font-display text-base font-semibold text-slate-900">{section.title}</h3>
            ) : null}
            {section.body ? (
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">{section.body}</div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
