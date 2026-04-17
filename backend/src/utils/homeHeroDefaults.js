/** Default home hero when DB row missing or table not migrated yet. */
export function defaultHomeHero() {
  return {
    id: 1,
    headline_en: "Style and essentials for men in Bangladesh",
    headline_bn: "বাংলাদেশে পুরুষদের পোশাক, জুতা ও গ্রুমিং — এক জায়গায়",
    subtext_en:
      "Browse clothing, shoes, and grooming with Bangla and English product details. Jump in by category or brand and shop with confidence.",
    subtext_bn:
      "বাংলা ও ইংরেজিতে পণ্যের বিবরণ দেখে পোশাক, জুতা ও গ্রুমিং ব্রাউজ করুন। ক্যাটাগরি বা ব্র্যান্ড দিয়ে ফিল্টার করে নির্ভরে কেনাকাটা করুন।",
    cta_label_en: "Shop the collection",
    cta_label_bn: "কালেকশন দেখুন",
    cta_url: "/shop",
    image_1_url:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1920&h=1080&q=85",
    image_2_url:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&h=1080&q=80",
    gradient_from: "#0f172a",
    gradient_to: "#0f766e",
  };
}

export function serializeHomeHeroRow(row) {
  const d = defaultHomeHero();
  if (!row) return { ...d, image_1_url: d.image_1_url, image_2_url: d.image_2_url };
  return {
    id: Number(row.id) || 1,
    headline_en: row.headline_en ?? d.headline_en,
    headline_bn: row.headline_bn ?? "",
    subtext_en: row.subtext_en ?? d.subtext_en,
    subtext_bn: row.subtext_bn ?? "",
    cta_label_en: row.cta_label_en ?? d.cta_label_en,
    cta_label_bn: row.cta_label_bn ?? "",
    cta_url: row.cta_url ?? d.cta_url,
    image_1_url: row.image_1_url != null && String(row.image_1_url).trim() !== "" ? String(row.image_1_url).trim() : null,
    image_2_url: row.image_2_url != null && String(row.image_2_url).trim() !== "" ? String(row.image_2_url).trim() : null,
    gradient_from: row.gradient_from ?? d.gradient_from,
    gradient_to: row.gradient_to ?? d.gradient_to,
    updated_at: row.updated_at,
  };
}

/** Ensures storefront always has two image URLs for the carousel. */
export function withPublicHeroImages(hero) {
  const d = defaultHomeHero();
  return {
    ...hero,
    image_1_url: hero.image_1_url || d.image_1_url,
    image_2_url: hero.image_2_url || d.image_2_url,
  };
}

const HEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export function normalizeHexColor(v, fallback) {
  const s = String(v ?? "").trim();
  if (HEX.test(s)) return s.length === 4 ? expandShortHex(s) : s;
  return fallback;
}

function expandShortHex(s) {
  const x = s.slice(1);
  if (x.length !== 3) return s;
  return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`;
}
