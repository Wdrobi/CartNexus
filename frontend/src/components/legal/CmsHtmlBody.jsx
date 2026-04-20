import DOMPurify from "dompurify";

const PROSE_CLASS =
  "blog-prose-html text-base leading-relaxed text-slate-800 md:text-[17px] md:leading-[1.75] [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink-950 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-6 [&_p]:text-slate-700 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:max-h-[480px] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-cover [&_img]:shadow-md";

/** Sanitized HTML body for Terms / Privacy / FAQs CMS content. */
export default function CmsHtmlBody({ html, className = "" }) {
  const raw = String(html || "");
  const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  return (
    <div
      className={`${PROSE_CLASS} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
