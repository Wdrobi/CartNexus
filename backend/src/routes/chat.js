import { Router } from "express";
import { pool } from "../db/pool.js";
import { serializeStoreSettingsRow } from "../utils/storeSettingsSerialize.js";

const router = Router();

const MAX_MESSAGE = 4000;
const PRODUCT_LIMIT = 10;

/** @returns {Promise<Record<string, unknown>|null>} */
async function loadStoreSettings() {
  try {
    const [[row]] = await pool.query(`SELECT * FROM store_settings WHERE id = 1 LIMIT 1`);
    return row ? serializeStoreSettingsRow(row) : null;
  } catch {
    return null;
  }
}

async function loadCategoriesHint() {
  try {
    const [rows] = await pool.query(
      `SELECT name_en, name_bn, slug FROM categories ORDER BY sort_order ASC, id ASC LIMIT 24`
    );
    return rows || [];
  } catch {
    return [];
  }
}

async function loadBrandsHint() {
  try {
    const [rows] = await pool.query(
      `SELECT name_en, name_bn, slug FROM brands ORDER BY sort_order ASC, id ASC LIMIT 24`
    );
    return rows || [];
  } catch {
    return [];
  }
}

/**
 * Extract a reasonable search phrase from free text for product LIKE.
 */
function searchPhraseFromMessage(raw) {
  let s = String(raw || "").trim().slice(0, 160);
  if (!s) return "";
  const stop = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "what",
    "which",
    "who",
    "how",
    "why",
    "when",
    "where",
    "can",
    "could",
    "would",
    "please",
    "tell",
    "me",
    "about",
    "দেখান",
    "কি",
    "কী",
    "এবং",
    "একটি",
    "পারি",
    "চাই",
    "জানতে",
    "জানাই",
    "হয়",
    "থেকে",
    "এর",
    "do",
    "you",
    "have",
    "any",
    "কিছু",
    "আছে",
  ]);
  const tokens = s.split(/\s+/).filter(Boolean);
  const meaningful = tokens.filter((t) => !stop.has(String(t).toLowerCase()));
  const use = meaningful.length >= 2 ? meaningful.slice(0, 8) : tokens.slice(0, 8);
  return use.join(" ").trim().slice(0, 120) || s.slice(0, 80);
}

/** User seems to want product / shopping help (not pure small talk). */
function wantsProductOrStoreShoppingHelp(message) {
  const m = String(message || "").trim();
  if (!m) return false;
  const lower = m.toLowerCase();

  const bn =
    /পণ্য|প্রোডাক্ট|জুতা|শার্ট|টিশার্ট|প্যান্ট|ডেনিম|জ্যাকেট|ক্রিম|গ্রুমিং|দাম|টাকা|খরচ|কিনতে|কেনাকাটা|খুঁজ|দেখান|স্টক|সাইজ|রঙ|কালার|ব্র্যান্ড|ক্যাটাগরি|কালেকশন|অর্ডার|ডেলিভারি|চেকআউট|কার্ট/.test(m);

  const en =
    /\b(product|products|buy|purchase|price|cost|how\s*much|shirt|shoe|sneaker|jeans|jacket|cream|grooming|cart|checkout|order|browse|catalog|stock|size|colour|color|brand|category|collection|shop|deal|sale|discount|recommend|suggest|show\s*me|looking\s*for|do\s*you\s*have|any\s*good|cheaper|expensive)\b/i.test(
      lower
    );

  return bn || en;
}

/** Short greetings / thanks — respond as a person, no product dump. */
function isPureSmallTalk(message) {
  const t = String(message || "").trim();
  if (!t) return false;
  const lower = t.toLowerCase();

  if (t.length <= 40) {
    if (
      /^(hi|hey|hello|hii|yo|gm|gn)\b[!.\s]*$/i.test(lower) ||
      /^(good\s*(morning|afternoon|evening|night))\b[!.\s]*$/i.test(lower) ||
      /^(thanks|thank\s*you|thx|ty|thankyou)\b[!.\s]*$/i.test(lower) ||
      /^(bye|goodbye|cya|see\s*ya)\b[!.\s]*$/i.test(lower) ||
      /^(ok|okay|cool|nice|great)\b[!.\s]*$/i.test(lower) ||
      /^(how\s*are\s*you|what'?s\s*up|sup)\b[!?.]*$/i.test(lower)
    ) {
      return true;
    }
    if (/^(হ্যালো|হাই|হ্যালো।|নমস্কার|আসসালাম|ধন্যবাদ|ধন্যবাদ।|ঠিক আছে)\s*$/u.test(t)) {
      return true;
    }
  }

  return false;
}

async function fetchProductsForChat(searchPhrase) {
  const q = searchPhrase.trim();
  if (!q) return [];
  try {
    const term = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT p.name_bn, p.name_en, p.slug, p.price, p.stock,
              c.slug AS category_slug, b.slug AS brand_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.is_active = 1
         AND (p.name_bn LIKE ? OR p.name_en LIKE ? OR p.slug LIKE ?)
       ORDER BY p.stock DESC, p.created_at DESC
       LIMIT ${PRODUCT_LIMIT}`,
      [term, term, term]
    );
    return rows || [];
  } catch {
    return [];
  }
}

async function fetchFeaturedProductsFallback() {
  try {
    const [rows] = await pool.query(
      `SELECT p.name_bn, p.name_en, p.slug, p.price, p.stock,
              c.slug AS category_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND p.stock > 0
       ORDER BY p.created_at DESC
       LIMIT 6`
    );
    return rows || [];
  } catch {
    return [];
  }
}

/** @param {boolean} bn */
function formatStoreKnowledge(settings, categories, brands, bn) {
  const lines = [];
  lines.push(bn ? "ওয়েবসাইট: CartNexus — পুরুষদের ফ্যাশন ও প্রয়োজনীয় জিনিস।" : "Website: CartNexus — men's fashion and lifestyle essentials.");

  if (categories.length) {
    const names = categories.map((c) => (bn ? c.name_bn || c.name_en : c.name_en || c.name_bn)).filter(Boolean);
    lines.push((bn ? "ক্যাটাগরি উদাহরণ: " : "Example categories: ") + names.slice(0, 12).join(", "));
  }
  if (brands.length) {
    const names = brands.map((b) => (bn ? b.name_bn || b.name_en : b.name_en || b.name_bn)).filter(Boolean);
    lines.push((bn ? "ব্র্যান্ড উদাহরণ: " : "Example brands: ") + names.slice(0, 12).join(", "));
  }

  if (!settings) {
    lines.push(bn ? "যোগাযোগের বিস্তারিত আপডেট করা হয়নি।" : "Contact details may be incomplete in settings.");
    return lines.join("\n");
  }

  const addr = bn ? settings.contactAddressBn || settings.contactAddressEn : settings.contactAddressEn || settings.contactAddressBn;
  if (addr) lines.push((bn ? "ঠিকানা: " : "Address: ") + String(addr).slice(0, 500));

  if (settings.contactPhone) lines.push((bn ? "ফোন: " : "Phone: ") + settings.contactPhone);

  if (settings.contactEmail) lines.push((bn ? "ইমেইল: " : "Email: ") + settings.contactEmail);

  const hours = bn ? settings.businessHoursBn || settings.businessHoursEn : settings.businessHoursEn || settings.businessHoursBn;
  if (hours) lines.push((bn ? "ব্যবসার সময়: " : "Business hours: ") + String(hours).slice(0, 400));

  const social =
    settings.socialFacebookUrl ||
    settings.socialInstagramUrl ||
    settings.socialYoutubeUrl ||
    settings.socialOtherUrl ||
    "";

  if (social || settings.whatsappDigits) {
    lines.push(
      bn ? "যোগাযোগের অপশন ফুটার ও কন্টাক্ট পেজে উপলব্ধ।" : "Additional contact links appear in the footer and on the Contact page."
    );
  }

  lines.push(bn ? "চেকআউট ও অ্যাকাউন্ট সাইটের মেনুতে।" : "Checkout and account links are available from the site navigation.");

  return lines.join("\n");
}

/** @param {any[]} rows @param {boolean} bn */
function formatProductLines(rows, bn, siteOrigin) {
  if (!rows?.length) return "";
  const prefix = bn ? "সম্পর্কিত পণ্য:\n" : "Relevant products:\n";
  const shopBase = `${siteOrigin || ""}/shop`;
  const lines = rows.map((r) => {
    const title = bn ? r.name_bn || r.name_en : r.name_en || r.name_bn;
    const stock = Number(r.stock) > 0 ? "in stock" : "may be limited";
    const bnStock = Number(r.stock) > 0 ? "স্টক আছে" : "স্টক সীমিত হতে পারে";
    const priceNote = r.price != null ? ` · ${bn ? "দাম" : "price"} ${r.price}` : "";
    const url = `${shopBase}/${encodeURIComponent(String(r.slug))}`;
    return `· ${title}${priceNote} · ${bn ? bnStock : stock} · ${url}`;
  });
  return prefix + lines.join("\n");
}

function agentFallbackSmallTalk(message, locale) {
  const bn = String(locale || "").toLowerCase().startsWith("bn");
  const lower = String(message || "").toLowerCase();

  if (/thank|ধন্যবাদ|thx/.test(lower)) {
    return bn
      ? "আপনাকে স্বাগতম! আর কিছু লাগলে বলুন — পণ্য, দাম বা স্টোর সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।"
      : "You're welcome! If you need anything else — products, prices, or how we work — just ask.";
  }
  if (/bye|goodbye|cya|বিদায়/.test(lower)) {
    return bn ? "ভালো থাকবেন! যেকোনো সময় আবার চ্যাট করুন।" : "Take care — happy to chat again anytime!";
  }
  if (/^(hi|hey|hello|hii|good\s*(morning|afternoon|evening)|হ্যালো|হাই|নমস্কার)/i.test(lower)) {
    return bn
      ? "হ্যালো! আমি CartNexus-এর সহায়ক। আপনি চাইলে পণ্য খুঁজতে পারেন, দাম জানতে পারেন, অথবা ডেলিভারি/যোগাযোগ নিয়ে জিজ্ঞাসা করতে পারেন — যেভাবে সুবিধা হয় বলুন।"
      : "Hey! I'm your CartNexus assistant. Ask me anything — find a product, check how we work, or get contact & delivery info. What would you like to know?";
  }
  if (/how\s*are\s*you|what'?s\s*up|কেমন\s*আছ/.test(lower)) {
    return bn
      ? "ভালো আছি, ধন্যবাদ জিজ্ঞাসার জন্য! আজ আপনাকে কীভাবে সাহায্য করতে পারি — পণ্য খুঁজতে, নাকি স্টোর সম্পর্কে কিছু জানতে চান?"
      : "I'm doing well, thanks for asking! What can I help you with today — shopping for something specific, or a question about the store?";
  }

  return bn
    ? "হ্যালো! আমি এখানে আপনার সাথে কথা বলতে এবং CartNexus সম্পর্কে সাহায্য করতে। পণ্য, দাম, ডেলিভারি বা যোগাযোগ — যা খুশি জিজ্ঞাসা করুন।"
    : "Hi there! I'm here to chat and help with CartNexus — products, pricing, delivery, contact… whatever you need.";
}

function fallbackReply(message, locale, settings, categories, brands, products, siteOrigin, shoppingIntent) {
  const bn = String(locale || "").toLowerCase().startsWith("bn");
  const lower = message.toLowerCase();
  const chunks = [];

  if (isPureSmallTalk(message)) {
    return agentFallbackSmallTalk(message, locale);
  }

  if (/contact|phone|email|address|ঠিকানা|ফোন|ইমেইল|যোগাযোগ/.test(lower)) {
    if (settings?.contactPhone || settings?.contactEmail) {
      chunks.push(
        bn
          ? `যোগাযোগ: ${settings.contactPhone || ""} ${settings.contactEmail ? `ইমেইল ${settings.contactEmail}` : ""}`.trim()
          : `Here's how to reach us: ${settings.contactPhone || ""}${settings.contactEmail ? ` · Email ${settings.contactEmail}` : ""}`.trim()
      );
    }
    if (settings && (bn ? settings.contactAddressBn || settings.contactAddressEn : settings.contactAddressEn)) {
      const addr = bn ? settings.contactAddressBn || settings.contactAddressEn : settings.contactAddressEn;
      chunks.push((bn ? "ঠিকানা: " : "Address: ") + String(addr).slice(0, 400));
    }
    if (!chunks.length) {
      chunks.push(
        bn ? "যোগাযোগের তথ্য সাইটের কন্টাক্ট পেজে আছে। আরও কিছু জানতে চাইলে বলুন!" : "Contact details are on our Contact page. Ask if you need anything else!"
      );
    }
  }

  if (/hour|open|close|সময়|খোলা|বন্ধ/.test(lower) && settings) {
    const h = bn ? settings.businessHoursBn || settings.businessHoursEn : settings.businessHoursEn || settings.businessHoursBn;
    if (h) chunks.push((bn ? "আমাদের সময়সূচি:\n" : "Our hours:\n") + String(h).slice(0, 400));
  }

  if (/deliver|shipping|ship|delivery|ডেলিভারি|শিপ/.test(lower)) {
    chunks.push(
      bn
        ? "ডেলিভারি সম্পর্কে বিস্তারিত FAQ ও যোগাযোগ পাতায় আছে। নির্দিষ্ট এলাকা বা সময় জানতে চাইলে সেখানে দেখুন বা আমাকে আরও প্রশ্ন করুন।"
        : "Delivery options and timelines are outlined on our FAQ and Contact pages. If you tell me your city or question, I can point you in the right direction."
    );
  }

  if (/return|refund|exchange|রিটার্ন|রিফান্ড/.test(lower)) {
    chunks.push(
      bn
        ? "রিটার্ন/রিফান্ড নীতি টার্মস ও FAQ-তে থাকতে পারে। নির্দিষ্ট অর্ডার নিয়ে হেল্প লাগলে যোগাযোগ করুন।"
        : "Returns and refunds are described in our Terms and FAQs. For a specific order, reach out via Contact — happy to summarize what I can from those pages."
    );
  }

  if (/pay|payment|cash|cod|পেমেন্ট/.test(lower)) {
    chunks.push(
      bn
        ? "পেমেন্ট অপশন চেকআউটের সময় দেখাবে। কার্ড/ক্যাশ অন ডেলিভারি সম্পর্কে নির্দিষ্ট প্রশ্ন থাকলে লিখুন।"
        : "Payment methods appear at checkout. Ask me anything specific about paying for an order and I'll help within what we publish on the site."
    );
  }

  const productBlock = shoppingIntent && products.length ? formatProductLines(products, bn, siteOrigin) : "";

  if (productBlock) chunks.push(productBlock);

  if (!chunks.length) {
    if (shoppingIntent && products.length) {
      const intro = bn ? "এখানে কিছু মিলিয়ে দেখা পণ্য:" : "Here are a few items that might match:";
      chunks.push(`${intro}\n\n${formatProductLines(products, bn, siteOrigin)}`);
    } else if (shoppingIntent && !products.length) {
      chunks.push(
        bn
          ? "এই মুহূর্তে ওই ধরনের পণ্য খুঁজে পাইনি। অন্য নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন, অথবা /shop থেকে ব্রাউজ করুন।"
          : "I couldn't find a close match in the catalog for that — try another keyword or browse /shop and categories."
      );
    } else {
      chunks.push(agentFallbackSmallTalk(message, locale));
    }
  }

  return chunks.filter(Boolean).join("\n\n");
}

function buildAgentSystemPrompt(knowledgeBlock, productLines, shoppingIntent) {
  const catalogSection =
    shoppingIntent && productLines
      ? `=== PRODUCT CATALOG (use only when helping with shopping / products; cite links exactly) ===
${productLines}`
      : `=== PRODUCT CATALOG ===
(No product list loaded for this message — the user may be chatting casually. Do NOT invent items. If they want to shop, invite them to describe what they need or browse /shop.)`;

  return `You are the CartNexus storefront assistant — a friendly, human teammate for a men's fashion e‑commerce site (Bangladesh). You are NOT a search engine that dumps lists.

Personality & behaviour:
- Have a natural conversation: greet back, acknowledge thanks, be warm and concise (2–5 short paragraphs max unless they ask for detail).
- Answer questions about CartNexus using ONLY the KNOWLEDGE section below for factual claims (contact, hours, what we sell).
- Discuss products ONLY when the user is clearly shopping or asking about items, prices, stock, sizes, recommendations, or "what do you sell".
- For greetings ("hi", "thanks", "how are you") or general chat, reply like a person — do NOT paste product lists unless they ask what to buy or what's available.
- If asked something you cannot verify from KNOWLEDGE / PRODUCT CATALOG, say you don't have that detail and suggest the Contact page or FAQ.
- Never invent prices, stock levels, or policies not implied below.
- Match the user's language: Bangla for Bangla, English for English.

${catalogSection}

=== KNOWLEDGE (store facts) ===
${knowledgeBlock}
`;
}

async function callOpenAI(systemPrompt, userMessage, locale) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.CHAT_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

  const bn = String(locale || "").toLowerCase().startsWith("bn");
  const langHint = bn
    ? "Always respond in natural Bangla when the user writes in Bangla; otherwise clear English."
    : "Respond in natural English unless the user writes primarily in Bangla — then use Bangla.";

  const body = {
    model,
    messages: [
      { role: "system", content: `${systemPrompt}\n\n${langHint}` },
      { role: "user", content: userMessage.slice(0, MAX_MESSAGE) },
    ],
    temperature: 0.72,
    max_tokens: 650,
  };

  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.error?.message || String(r.status);
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

router.post("/", async (req, res) => {
  const message = String(req.body?.message ?? "").trim().slice(0, MAX_MESSAGE);
  const locale = String(req.body?.locale ?? "en").slice(0, 12);

  if (!message) {
    return res.status(400).json({ error: "empty_message" });
  }

  const siteOrigin =
    process.env.FRONTEND_ORIGIN?.trim()?.replace(/\/$/, "") ||
    process.env.VITE_SITE_ORIGIN?.trim()?.replace(/\/$/, "") ||
    "";

  let settings;
  let categories = [];
  let brands = [];
  try {
    [settings, categories, brands] = await Promise.all([
      loadStoreSettings(),
      loadCategoriesHint(),
      loadBrandsHint(),
    ]);
  } catch {
    settings = await loadStoreSettings();
  }

  const shoppingIntent = wantsProductOrStoreShoppingHelp(message);
  const phrase = shoppingIntent ? searchPhraseFromMessage(message) : "";

  let products = [];
  if (shoppingIntent && phrase) {
    products = await fetchProductsForChat(phrase);
  }
  if (shoppingIntent && !products.length && phrase) {
    products = await fetchFeaturedProductsFallback();
  }

  const knowledgeBlock = formatStoreKnowledge(settings, categories, brands, locale.toLowerCase().startsWith("bn"));

  const productLines =
    shoppingIntent && products.length ? formatProductLines(products, locale.toLowerCase().startsWith("bn"), siteOrigin) : "";

  const systemPrompt = buildAgentSystemPrompt(knowledgeBlock, productLines, shoppingIntent);

  let reply;
  let source = "fallback";

  try {
    const ai = await callOpenAI(systemPrompt, message, locale);
    if (ai) {
      reply = ai;
      source = "openai";
    }
  } catch (e) {
    console.warn("[chat] OpenAI failed:", e.message);
  }

  if (!reply) {
    reply = fallbackReply(message, locale, settings, categories, brands, products, siteOrigin, shoppingIntent);
    source = "fallback";
  }

  res.json({
    reply,
    source,
    meta: {
      productCount: products.length,
      searchUsed: phrase || null,
      shoppingIntent,
    },
  });
});

export default router;
