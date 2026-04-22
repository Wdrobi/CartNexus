/**
 * Static admin routes for global search (nav + common pages).
 * @param {import("i18next").TFunction} t
 */
export function getAdminNavSearchItems(t) {
  return [
    { id: "p-dashboard", path: "/admin", group: "page", title: t("admin.nav.dashboard") },
    { id: "p-orders", path: "/admin/orders", group: "page", title: t("admin.nav.orders") },
    { id: "p-inventory", path: "/admin/inventory", group: "page", title: t("admin.nav.inventory") },
    { id: "p-products", path: "/admin/products", group: "page", title: t("admin.nav.products") },
    { id: "p-categories", path: "/admin/categories", group: "page", title: t("admin.nav.categories") },
    { id: "p-brands", path: "/admin/brands", group: "page", title: t("admin.nav.brands") },
    { id: "p-hero", path: "/admin/home-hero", group: "page", title: t("admin.nav.homeHero") },
    { id: "p-blog", path: "/admin/blog", group: "page", title: t("admin.nav.blog") },
    { id: "p-users", path: "/admin/users", group: "page", title: t("admin.nav.users") },
    { id: "p-contact", path: "/admin/contact-messages", group: "page", title: t("admin.nav.contactInbox") },
    { id: "p-newsletter", path: "/admin/newsletter-subscribers", group: "page", title: t("admin.nav.newsletterSubscribers") },
    { id: "p-terms", path: "/admin/support/terms", group: "page", title: t("admin.nav.termsCms") },
    { id: "p-faqs", path: "/admin/support/faqs", group: "page", title: t("admin.nav.faqsCms") },
    { id: "p-privacy", path: "/admin/support/privacy", group: "page", title: t("admin.nav.privacyCms") },
    { id: "p-store", path: "/admin/store-settings", group: "page", title: t("admin.nav.storeSettings") },
  ];
}

export function matchesQuery(item, qLower) {
  if (!qLower) return true;
  const hay = `${item.title || ""} ${item.path || ""} ${item.subtitle || ""} ${item.extra || ""}`.toLowerCase();
  return hay.includes(qLower);
}
