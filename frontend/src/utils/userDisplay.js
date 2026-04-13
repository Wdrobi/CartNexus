/** Two-letter avatar initials from name or email. */
export function userInitials(name, email) {
  const n = String(name || "").trim();
  if (n.length >= 1) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (n.length >= 2) return n.slice(0, 2).toUpperCase();
    return (n[0] + n[0]).toUpperCase();
  }
  const e = String(email || "").trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "?";
}

export function formatMemberSince(iso, locale) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale || undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}
