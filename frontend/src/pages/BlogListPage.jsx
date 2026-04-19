import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { BlogIndexSeo } from "../components/blog/BlogSeo.jsx";
import { apiFetch, resolvePublicAssetUrl } from "../api/apiBase.js";
import { getAllPostsSorted, pickLocalized } from "../data/blogPosts.js";
import { previewPlainFromBody } from "../utils/blogBody.js";

function formatBlogDate(iso, locale) {
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(
      new Date(`${iso}T12:00:00`),
    );
  } catch {
    return iso;
  }
}

function ArticleBodyPreview({ text, maxLen = 220 }) {
  const line = previewPlainFromBody(text, maxLen);
  return (
    <div className="text-sm leading-relaxed text-slate-600 md:text-[15px]">
      <p className="line-clamp-4">{line}</p>
    </div>
  );
}

export default function BlogListPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isBn = lang?.startsWith("bn");
  const locale = isBn ? "bn-BD" : "en-GB";
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch("/api/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const apiPosts = data?.posts || [];
        setPosts(apiPosts.length > 0 ? apiPosts : getAllPostsSorted());
      })
      .catch(() => {
        if (!cancelled) setPosts(getAllPostsSorted());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedPosts = [...posts];
  const featuredIdx = sortedPosts.findIndex((p) => p.featured);
  const featured = featuredIdx >= 0 ? sortedPosts[featuredIdx] : sortedPosts[0];
  const rest =
    featuredIdx >= 0 ? sortedPosts.filter((_, i) => i !== featuredIdx) : sortedPosts.slice(1);
  const seoPosts = loading ? getAllPostsSorted() : posts.length > 0 ? posts : getAllPostsSorted();

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-900">
      <BlogIndexSeo
        posts={seoPosts}
        title={t("blogPage.metaTitle")}
        description={t("blogPage.metaDescription")}
        lang={lang}
      />
      <SiteHeader />

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-90" aria-hidden />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto w-full max-w-none px-[20px] py-16 sm:py-20 md:py-24">
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.28em] text-brand-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("blogPage.heroKicker")}
          </motion.p>
          <motion.h1
            className="mt-4 max-w-3xl break-words font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl lg:leading-tight"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {t("blogPage.heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("blogPage.heroSubtitle")}
          </motion.p>
          <motion.nav
            className="mt-10 flex flex-wrap gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            aria-label="Breadcrumb"
          >
            <Link to="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-brand-400/40 hover:text-white">
              {t("blogPage.breadcrumbHome")}
            </Link>
            <span className="flex items-center px-1 text-slate-500" aria-hidden>
              /
            </span>
            <span className="rounded-full border border-brand-500/40 bg-brand-500/15 px-4 py-2 font-semibold text-brand-200">
              {t("blogPage.breadcrumbBlog")}
            </span>
          </motion.nav>
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-[20px] py-12 sm:py-16">
        {loading ? (
          <p className="text-center text-slate-600">{t("shop.loading")}</p>
        ) : null}
        {!loading && featured ? (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5"
          >
            <div className="grid lg:grid-cols-2">
              <Link
                to={`/blog/${featured.slug}`}
                className={`relative min-h-[220px] overflow-hidden bg-gradient-to-br ${featured.gradient} p-10 text-white lg:min-h-[320px]`}
              >
                {featured.imageUrl ? (
                  <>
                    <img
                      src={resolvePublicAssetUrl(featured.imageUrl)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" aria-hidden />
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${featured.gradient} opacity-45 mix-blend-soft-light`}
                      aria-hidden
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M30%200v60M0%2030h60%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.08%22%2F%3E%3C%2Fsvg%3E')] opacity-90" aria-hidden />
                )}
                <span className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  {t("blogPage.featuredBadge")}
                </span>
                <h2 className="relative mt-6 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                  {pickLocalized(featured.title, lang)}
                </h2>
                <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                  {pickLocalized(featured.excerpt, lang)}
                </p>
              </Link>
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  {pickLocalized(featured.category, lang)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {formatBlogDate(featured.datePublished, locale)} · {t("blogPage.readTime", { count: featured.readTimeMin })}
                </p>
                <div className="mt-6">
                  <ArticleBodyPreview text={pickLocalized(featured.body, lang)} />
                </div>
                <Link
                  to={`/blog/${featured.slug}`}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ink-950/20 transition hover:bg-brand-700"
                >
                  {t("blogPage.readArticle")}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </motion.article>
        ) : null}

        <h2 className="mt-16 font-display text-xl font-bold text-ink-950 md:text-2xl">{t("blogPage.allPosts")}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            rest.map((post, idx) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: Math.min(0.04 * idx, 0.2), duration: 0.4 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-lg hover:shadow-brand-900/5"
              >
                <div className={`relative h-36 shrink-0 overflow-hidden bg-gradient-to-br ${post.gradient}`}>
                  {post.imageUrl ? (
                    <>
                      <img
                        src={resolvePublicAssetUrl(post.imageUrl)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
                      <div
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-35 mix-blend-soft-light`}
                        aria-hidden
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {pickLocalized(post.category, lang)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs text-slate-500" dateTime={post.datePublished}>
                    {formatBlogDate(post.datePublished, locale)}
                  </time>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink-950 transition group-hover:text-brand-800">
                    {pickLocalized(post.title, lang)}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {pickLocalized(post.excerpt, lang)}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-brand-700">
                    {t("blogPage.readArticle")} <span aria-hidden className="inline transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </motion.li>
            ))}
        </ul>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-8 text-center text-white sm:p-12"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("blogPage.shopCtaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{t("blogPage.shopCtaSubtitle")}</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400"
          >
            {t("blogPage.shopCtaLink")}
          </Link>
        </motion.section>
      </div>

      <SiteFooter showCta={false} />
    </div>
  );
}
