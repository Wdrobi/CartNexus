export function formatPrice(amount, lang) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  if (lang?.startsWith("bn")) {
    return `৳ ${n.toLocaleString("bn-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `৳ ${n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
