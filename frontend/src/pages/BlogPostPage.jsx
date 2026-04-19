import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { BlogArticleSeo, BlogNotFoundSeo } from "../components/blog/BlogSeo.jsx";
import { apiFetch, resolvePublicAssetUrl } from "../api/apiBase.js";
import { getPostBySlug, getRelatedPosts, getAdjacentBySlug, pickLocalized } from "../data/blogPosts.js";
import DOMPurify from "dompurify";
import { isProbablyHtml } from "../utils/blogBody.js";

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

function BodyContent({ text }) {
  const raw = String(text || "");
  if (isProbablyHtml(raw)) {
    const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    return (
      <div
        className="blog-prose-html text-base leading-relaxed text-slate-800 md:text-[17px] md:leading-[1.75] [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink-950 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-6 [&_p]:text-slate-700 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:max-h-[480px] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-cover [&_img]:shadow-md"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }
  return <Prose text={raw} />;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isBn = lang?.startsWith("bn");
  const locale = isBn ? "bn-BD" : "en-GB";
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [navPrevious, setNavPrevious] = useState(null);
  const [navNext, setNavNext] = useState(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setRelated([]);
      setResolved(true);
      return;
    }
    let cancelled = false;
    setResolved(false);
    setNavPrevious(null);
    setNavNext(null);
    (async () => {
      try {
        const r = await apiFetch(`/api/blog/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (r.ok) {
          const data = await r.json();
          if (data?.post) {
            setPost(data.post);
            setRelated(Array.isArray(data.related) ? data.related : []);
            setNavPrevious(data.navPrevious ?? null);
            setNavNext(data.navNext ?? null);
            setResolved(true);
            return;
          }
        }
      } catch {
        /* fallback below */
      }
      const staticPost = getPostBySlug(slug);
      setPost(staticPost);
      setRelated(staticPost ? getRelatedPosts(slug, 3) : []);
      const adj = staticPost ? getAdjacentBySlug(slug) : { prev: null, next: null };
      setNavPrevious(adj.prev);
      setNavNext(adj.next);
      setResolved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!resolved) {
    return (
      <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-none px-[20px] py-24 text-center text-slate-600">{t("shop.loading")}</main>
        <SiteFooter showCta={false} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
        <BlogNotFoundSeo
          title={`${t("blogPage.notFoundTitle")} | CartNexus`}
          description={t("blogPage.notFoundBody")}
          lang={lang}
        />
        <SiteHeader />
        <main className="mx-auto w-full max-w-none px-[20px] py-24 text-center">
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

  const title = pickLocalized(post.title, lang);

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
      <BlogArticleSeo post={post} lang={lang} />
      <SiteHeader />

      <article>
        <header
          className={`relative min-h-[240px] overflow-hidden text-white sm:min-h-[280px] md:min-h-[320px]`}
        >
          {post.imageUrl ? (
            <>
              <img
                src={resolvePublicAssetUrl(post.imageUrl)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" aria-hidden />
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-45 mix-blend-soft-light`}
                aria-hidden
              />
            </>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`} aria-hidden />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M20%200v40M0%2020h40%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.06%22%2F%3E%3C%2Fsvg%3E')] opacity-80" aria-hidden />
            </>
          )}
          <div className="relative mx-auto w-full max-w-none px-[20px] py-14 sm:py-16 md:py-20">
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
            <h1 className="mt-4 break-words font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-[2.75rem] md:leading-[1.15] lg:text-4xl">
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

        <div className="mx-auto w-full max-w-none px-[20px] py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10 md:p-12"
          >
            <BodyContent text={pickLocalized(post.body, lang)} />
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

          {navPrevious || navNext ? (
            <nav
              className="mt-12 border-t border-slate-200/90 pt-10"
              aria-label={t("blogPage.navAria")}
            >
              <h2 className="font-display text-lg font-bold text-ink-950 md:text-xl">{t("blogPage.continueReading")}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="min-h-[5.5rem]">
                  {navPrevious ? (
                    <Link
                      to={`/blog/${navPrevious.slug}`}
                      className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-black/[0.03] transition hover:border-brand-200 hover:shadow-md sm:p-4"
                    >
                      <div
                        className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${navPrevious.gradient || "from-slate-700 via-slate-800 to-ink-950"}`}
                      >
                        {navPrevious.imageUrl ? (
                          <>
                            <img
                              src={resolvePublicAssetUrl(navPrevious.imageUrl)}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                          </>
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          ← {t("blogPage.navOlder")}
                        </span>
                        <p className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-ink-950 transition group-hover:text-brand-800">
                          {pickLocalized(navPrevious.title, lang)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div aria-hidden className="hidden sm:block" />
                  )}
                </div>
                <div className="min-h-[5.5rem] sm:text-right">
                  {navNext ? (
                    <Link
                      to={`/blog/${navNext.slug}`}
                      className="group flex h-full flex-row-reverse gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 text-left shadow-sm ring-1 ring-black/[0.03] transition hover:border-brand-200 hover:shadow-md sm:p-4 sm:text-right"
                    >
                      <div
                        className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${navNext.gradient || "from-slate-700 via-slate-800 to-ink-950"}`}
                      >
                        {navNext.imageUrl ? (
                          <>
                            <img
                              src={resolvePublicAssetUrl(navNext.imageUrl)}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                          </>
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center sm:items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {t("blogPage.navNewer")} →
                        </span>
                        <p className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-ink-950 transition group-hover:text-brand-800">
                          {pickLocalized(navNext.title, lang)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div aria-hidden className="hidden sm:block" />
                  )}
                </div>
              </div>
            </nav>
          ) : null}

          {related.length > 0 ? (
            <section className="mt-16" aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-display text-xl font-bold text-ink-950 md:text-2xl">
                {t("blogPage.relatedTitle")}
              </h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r, idx) => {
                  const g = r.gradient || "from-slate-700 via-slate-800 to-ink-950";
                  return (
                    <motion.li
                      key={r.slug}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-24px" }}
                      transition={{ delay: Math.min(0.06 * idx, 0.18), duration: 0.4 }}
                    >
                      <Link
                        to={`/blog/${r.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-lg hover:shadow-brand-900/5"
                      >
                        <div className={`relative aspect-[16/10] shrink-0 overflow-hidden bg-gradient-to-br ${g}`}>
                          {r.imageUrl ? (
                            <>
                              <img
                                src={resolvePublicAssetUrl(r.imageUrl)}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden />
                              <div
                                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${g} opacity-35 mix-blend-soft-light`}
                                aria-hidden
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M30%200v60M0%2030h60%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.1%22%2F%3E%3C%2Fsvg%3E')] opacity-90" aria-hidden />
                          )}
                          <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                            {pickLocalized(r.category, lang)}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <time className="text-xs text-slate-500" dateTime={r.datePublished}>
                            {formatBlogDate(r.datePublished, locale)}
                          </time>
                          <p className="mt-2 font-display text-base font-bold leading-snug text-ink-950 transition group-hover:text-brand-800 md:text-[17px]">
                            {pickLocalized(r.title, lang)}
                          </p>
                          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                            {pickLocalized(r.excerpt, lang)}
                          </p>
                          <span className="mt-4 text-sm font-semibold text-brand-700">
                            {t("blogPage.readArticle")}{" "}
                            <span aria-hidden className="inline transition group-hover:translate-x-1">
                              →
                            </span>
                          </span>
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <SiteFooter showCta={false} />
    </div>
  );
}
