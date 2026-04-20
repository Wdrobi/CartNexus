import { TERMS_SECTIONS, PRIVACY_SECTIONS } from "../data/legalPageSections.js";

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Split locale body text the same way as storefront Prose (\\n\\n → paragraphs, \\n → br). */
export function bodyPlainToHtmlParagraphs(text) {
  const blocks = String(text || "")
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => escapeHtml(line));
      return `<p>${lines.join("<br />")}</p>`;
    })
    .join("");
}

function sectionedPageHtml(ns, sections, idPrefix, t) {
  const parts = [];
  for (const { id, titleKey, bodyKey } of sections) {
    const title = t(`${ns}.${titleKey}`);
    const body = t(`${ns}.${bodyKey}`);
    parts.push(`<h2 id="${idPrefix}-${id}">${escapeHtml(title)}</h2>`);
    parts.push(bodyPlainToHtmlParagraphs(body));
  }
  return parts.join("");
}

export function buildTermsDefaultHtml(t) {
  return sectionedPageHtml("termsPage", TERMS_SECTIONS, "terms", t);
}

export function buildPrivacyDefaultHtml(t) {
  return sectionedPageHtml("privacyPage", PRIVACY_SECTIONS, "privacy", t);
}

export function buildFaqsDefaultHtml(t) {
  const intro = t("faqPage.staticIntro");
  const body = t("faqPage.staticBody");
  return bodyPlainToHtmlParagraphs(`${intro}\n\n${body}`);
}

/** @param {'terms' | 'faqs' | 'privacy'} pageKey */
export function getDefaultCmsBodies(pageKey, i18n) {
  const tEn = i18n.getFixedT("en");
  const tBn = i18n.getFixedT("bn");
  if (pageKey === "terms") {
    return { htmlEn: buildTermsDefaultHtml(tEn), htmlBn: buildTermsDefaultHtml(tBn) };
  }
  if (pageKey === "privacy") {
    return { htmlEn: buildPrivacyDefaultHtml(tEn), htmlBn: buildPrivacyDefaultHtml(tBn) };
  }
  return { htmlEn: buildFaqsDefaultHtml(tEn), htmlBn: buildFaqsDefaultHtml(tBn) };
}

export function htmlHasMeaningfulText(html) {
  const text = String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}
