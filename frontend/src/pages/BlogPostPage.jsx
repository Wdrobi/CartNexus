import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { BlogArticleSeo, BlogNotFoundSeo } from "../components/blog/BlogSeo.jsx";
import { getPostBySlug, getRelatedPosts, pickLocalized } from "../data/blogPosts.js";

function formatBlogDate(iso, locale) {
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
      new Date(`${iso}T12:00:00`),
    );
  } catch {
    return iso;
  }
}

function Prose({ text }) {
  const paragraphs = String(text || "")
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div>
      {paragraphs.map((para, i) => (
        <p key={i} className="mt-6 text-base leading-relaxed text-slate-700 first:mt-0 md:text-[17px] md:leading-[1.75]">
          {para.split(/\n/).map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isBn = lang?.startsWith("bn");
  const locale = isBn ? "bn-BD" : "en-GB";
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <BlogNotFoundSeo
          title={`${t("blogPage.notFoundTitle")} | CartNexus`}
          description={t("blogPage.notFoundBody")}
          lang={lang}
        />
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-2xl font-bold text-ink-950">{t("blogPage.notFoundTitle")}</h1>
          <p className="mt-4 text-slate-600">{t("blogPage.notFoundBody")}</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {t("blogPage.backToBlog")}
          </Link>
        </main>
        <SiteFooter showCta={false} />
      </div>
    );
  }

  const related = getRelatedPosts(post.slug, 3);
  const title = pickLocalized(post.title, lang);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <BlogArticleSeo post={post} lang={lang} />
      <SiteHeader />

      <article>
        <header
          className={`relative overflow-hidden bg-gradient-to-br ${post.gradient} text-white`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M20%200v40M0%2020h40%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.06%22%2F%3E%3C%2Fsvg%3E')] opacity-80" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/80" aria-label="Breadcrumb">
              <Link to="/" className="transition hover:text-white">
                {t("blogPage.breadcrumbHome")}
              </Link>
              <span aria-hidden>/</span>
              <Link to="/blog" className="transition hover:text-white">
                {t("blogPage.breadcrumbBlog")}
              </Link>
              <span aria-hidden>/</span>
              <span className="line-clamp-1 font-medium text-white">{title}</span>
            </nav>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              {pickLocalized(post.category, lang)}
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              {title}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/90 sm:text-lg">{pickLocalized(post.excerpt, lang)}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-8 text-sm text-white/85">
              <span>{t("blogPage.byAuthor", { name: post.author })}</span>
              <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished, locale)}</time>
              <span>{t("blogPage.readTime", { count: post.readTimeMin })}</span>
              <span className="text-white/60">
                {t("blogPage.updated", { date: formatBlogDate(post.dateModified, locale) })}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10 md:p-12"
          >
            <Prose text={pickLocalized(post.body, lang)} />
            <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-100 pt-10">
              <Link
                to="/shop"
                className="inline-flex rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {t("blogPage.shopCtaLink")}
              </Link>
              <Link
                to="/blog"
                className="inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-brand-300"
              >
                {t("blogPage.backToBlog")}
              </Link>
            </div>
          </motion.div>

          {related.length > 0 ? (
            <section className="mt-16" aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-display text-xl font-bold text-ink-950 md:text-2xl">
                {t("blogPage.relatedTitle")}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={`/blog/${r.slug}`}
                      className="block h-full rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                        {pickLocalized(r.category, lang)}
                      </p>
                      <p className="mt-2 font-display text-sm font-bold leading-snug text-ink-950">{pickLocalized(r.title, lang)}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{pickLocalized(r.excerpt, lang)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <SiteFooter showCta={false} />
    </div>
  );
}
