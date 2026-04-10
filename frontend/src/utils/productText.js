export function productName(p, lang) {
  if (!p) return "";
  return lang?.startsWith("bn") ? p.name_bn : p.name_en;
}

export function productDescription(p, lang) {
  if (!p) return "";
  const d = lang?.startsWith("bn") ? p.description_bn : p.description_en;
  return d || "";
}

export function categoryName(c, lang) {
  if (!c) return "";
  return lang?.startsWith("bn") ? c.name_bn : c.name_en;
}

export function brandName(b, lang) {
  if (!b) return "";
  return lang?.startsWith("bn") ? b.name_bn : b.name_en;
}
