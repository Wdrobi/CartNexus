/**
 * Delivery area label — matches checkout (`checkout.zone.*`) so admin bars use the same names as customers see.
 * @param {import("i18next").TFunction} t
 * @param {string} zoneKey — `orders.delivery_zone` slug
 */
export function deliveryZoneDisplayName(t, zoneKey) {
  const key = String(zoneKey || "").trim();
  if (!key) return "";
  return t(`checkout.zone.${key}`, { defaultValue: key.replace(/_/g, " ") });
}
