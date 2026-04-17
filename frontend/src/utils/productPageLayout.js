/** @typedef {'clothing' | 'footwear' | 'accessories' | 'grooming'} PageLayout */

export const PAGE_LAYOUT = {
  CLOTHING: "clothing",
  FOOTWEAR: "footwear",
  ACCESSORIES: "accessories",
  GROOMING: "grooming",
};

/**
 * @param {string | null | undefined} layout
 * @returns {boolean}
 */
export function showApparelOrShoeSize(layout) {
  return layout === PAGE_LAYOUT.CLOTHING || layout === PAGE_LAYOUT.FOOTWEAR;
}

/**
 * @param {string | null | undefined} layout
 * @returns {string[]}
 */
export function sizeOptionsForLayout(layout) {
  if (layout === PAGE_LAYOUT.FOOTWEAR) return ["7", "8", "9", "10", "11", "12"];
  if (layout === PAGE_LAYOUT.CLOTHING) return ["S", "M", "L", "XL", "XXL"];
  return ["ONE"];
}

/**
 * @param {string | null | undefined} layout
 * @returns {string}
 */
export function defaultSizeForLayout(layout) {
  if (layout === PAGE_LAYOUT.FOOTWEAR) return "9";
  if (layout === PAGE_LAYOUT.CLOTHING) return "M";
  return "ONE";
}

/**
 * @param {string | null | undefined} layout
 * @returns {'color' | 'volume'}
 */
export function variantOptionKind(layout) {
  return layout === PAGE_LAYOUT.GROOMING ? "volume" : "color";
}
