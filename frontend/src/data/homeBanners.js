/** Same crop dimensions for every slide (16∶9) — Unsplash `fit=crop` + fixed w×h. */
export const BANNER_IMAGE_QUERY = "auto=format&fit=crop&w=1200&h=675&q=80";

function bannerImg(photoId) {
  return `https://images.unsplash.com/${photoId}?${BANNER_IMAGE_QUERY}`;
}

/** Promotional slides (copy in locales: home.banner*). */
export const HOME_BANNERS = [
  {
    id: "footwear",
    to: "/shop?category=footwear",
    image: bannerImg("photo-1542291026-7eec264c27ff"),
    badgeKey: "home.banner1Badge",
    titleKey: "home.banner1Title",
    subtitleKey: "home.banner1Subtitle",
    ctaKey: "home.banner1Cta",
  },
  {
    id: "shirts",
    to: "/shop?category=shirts",
    image: bannerImg("photo-1602810318383-e386cc2a3ccf"),
    badgeKey: "home.banner2Badge",
    titleKey: "home.banner2Title",
    subtitleKey: "home.banner2Subtitle",
    ctaKey: "home.banner2Cta",
  },
  {
    id: "grooming",
    to: "/shop?category=grooming-skincare",
    image: bannerImg("photo-1434389677669-e08b4cac3105"),
    badgeKey: "home.banner3Badge",
    titleKey: "home.banner3Title",
    subtitleKey: "home.banner3Subtitle",
    ctaKey: "home.banner3Cta",
  },
];
