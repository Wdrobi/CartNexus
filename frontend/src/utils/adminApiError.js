/**
 * Maps backend `error` codes from /api/admin/* to i18n strings (auth.errors.*).
 */
export function translateAdminError(t, code) {
  if (code == null || code === "") return "";
  return t(`auth.errors.${code}`, { defaultValue: String(code) });
}
