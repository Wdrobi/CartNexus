import { Helmet } from "react-helmet-async";
import { siteOrigin } from "../../lib/siteOrigin.js";
import { pickLocalized } from "../../data/blogPosts.js";
import { resolvePublicAssetUrl } from "../../api/apiBase.js";

function absUrl(path) {
  const o = siteOrigin();
  if (!o) return path;
  return `${o}${path.startsWith("/") ? path : `/${path}`}`;
}

export function BlogIndexSeo({ posts, title, description, lang }) {
  const origin = siteOrigin();
  const path = "/blog";
  const canonical = absUrl(path);
  const image = absUrl("/og-blog-default.svg");
  const isBn = lang?.startsWith("bn");

  const itemListElements = posts.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "BlogPosting",
      "@id": absUrl(`/blog/${p.slug}`),
      url: absUrl(`/blog/${p.slug}`),
      headline: pickLocalized(p.title, lang),
      datePublished: p.datePublished,
      dateModified: p.dateModified,
    },
  }));

  const graph = [
    {
      "@type": "Organization",
      "@id": `${origin || ""}#organization`,
      name: "CartNexus",
      url: origin || undefined,
    },
    {
      "@type": "Blog",
      "@id": `${canonical}#blog`,
      name: isBn ? "কার্টনেক্সাস ব্লগ" : "CartNexus Blog",
      description,
      url: canonical,
      inLanguage: isBn ? "bn" : "en",
      publisher: { "@id": `${origin || ""}#organization` },
    },
    {
      "@type": "ItemList",
      itemListElement: itemListElements,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isBn ? "হোম" : "Home", item: absUrl("/") },
        { "@type": "ListItem", position: 2, name: isBn ? "ব্লগ" : "Blog", item: canonical },
      ],
    },
  ].filter(Boolean);

  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={isBn ? "পুরুষ ফ্যাশন, ব্লগ, কার্টনেক্সাস, বাংলাদেশ" : "men's fashion blog, CartNexus, Bangladesh, style guide"} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CartNexus" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={isBn ? "bn_BD" : "en_US"} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      <script type="application/ld+json">{jsonLd}</script>
    </Helmet>
  );
}

export function BlogArticleSeo({ post, lang }) {
  const origin = siteOrigin();
  const path = `/blog/${post.slug}`;
  const canonical = absUrl(path);
  const cover = post.imageUrl ? resolvePublicAssetUrl(post.imageUrl) : null;
  const image = cover || absUrl("/og-blog-default.svg");
  const isBn = lang?.startsWith("bn");
  const headline = pickLocalized(post.title, lang);
  const description = pickLocalized(post.excerpt, lang);
  const keywords = pickLocalized(post.keywords, lang);
  const category = pickLocalized(post.category, lang);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image: [image],
    datePublished: `${post.datePublished}T08:00:00+06:00`,
    dateModified: `${post.dateModified}T08:00:00+06:00`,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "CartNexus",
      url: origin || undefined,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    articleSection: category,
    inLanguage: isBn ? "bn" : "en",
    keywords,
    url: canonical,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isBn ? "হোম" : "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: isBn ? "ব্লগ" : "Blog", item: absUrl("/blog") },
      { "@type": "ListItem", position: 3, name: headline, item: canonical },
    ],
  };

  const title = `${headline} | CartNexus Blog`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="CartNexus" />
      <meta property="og:title" content={headline} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="article:published_time" content={`${post.datePublished}T08:00:00+06:00`} />
      <meta property="article:modified_time" content={`${post.dateModified}T08:00:00+06:00`} />
      <meta property="article:author" content={post.author} />
      <meta property="article:section" content={category} />
      <meta property="og:locale" content={isBn ? "bn_BD" : "en_US"} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={headline} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
    </Helmet>
  );
}

export function BlogNotFoundSeo({ title, description, lang }) {
  const canonical = absUrl("/blog");
  const isBn = lang?.startsWith("bn");
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={isBn ? "bn_BD" : "en_US"} />
    </Helmet>
  );
}
