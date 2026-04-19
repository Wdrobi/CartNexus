/**
 * Static blog posts for CartNexus (EN + BN). Used for listing, detail pages, and SEO JSON-LD.
 * @typedef {{ en: string; bn: string }} Localized
 * @typedef {{ slug: string; category: Localized; title: Localized; excerpt: Localized; keywords: Localized; datePublished: string; dateModified: string; author: string; readTimeMin: number; gradient: string; imageUrl?: string; featured?: boolean; body: Localized }} BlogPost
 */

const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900&q=82`;

/** @type {BlogPost[]} */
export const BLOG_POSTS = [
  {
    slug: "mens-wardrobe-essentials-2026",
    category: { en: "Style essentials", bn: "স্টাইলের মূল জিনিস" },
    title: {
      en: "Men’s wardrobe essentials for 2026: invest in pieces that work on CartNexus",
      bn: "২০২৬: পুরুষদের ওয়ার্ডরোব — কার্টনেক্সাসে কাজ করে এমন জিনিসে বিনিয়োগ",
    },
    excerpt: {
      en: "How to build a versatile closet with tees, shirts, trousers, and layers you can shop by category on CartNexus — fewer items, more outfits.",
      bn: "টি-শার্ট, শার্ট, প্যান্ট ও লেয়ার দিয়ে বহুমুখী ক্লোজেট—ক্যাটাগরি অনুযায়ী কার্টনেক্সাসে কিনে কম জিনিসে বেশি লুক।",
    },
    keywords: {
      en: "CartNexus men's clothing Bangladesh, wardrobe essentials, men's fashion shop online",
      bn: "কার্টনেক্সাস পুরুষ পোশাক, ওয়ার্ডরোব, অনলাইন শপ",
    },
    datePublished: "2026-01-08",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 8,
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    featured: true,
    imageUrl: IMG("1617137968427-85924c800a22"),
    body: {
      en: `CartNexus brings men’s clothing, footwear, and grooming together for Bangladesh shoppers—Bangla and English listings so you buy with confidence.

Start with neutral tees and polos from our tees and polos edit, then add Oxford and linen-blend shirts when your workplace calls for smart casual. Rotate slim or straight chinos and denim from Pants and jeans instead of repeating the same silhouette daily.

Layer with a chore jacket, overshirt, or lightweight blazer for evenings after work. Reach for leather sneakers or derbies from Footwear—they pair with dark denim and tailored trousers alike.

Warm, humid weather rewards breathable cotton and linen blends; inspect collars and seams before you check out. Use CartNexus filters by category, brand, and size to stick to navy, charcoal, white, black, plus one accent colour.

Fewer pieces that mix easily beat a cluttered closet. When you need one more item, open /shop, shortlist by size, and read copy in your preferred language.`,
      bn: `কার্টনেক্সাস বাংলাদেশের ক্রেতাদের জন্য পুরুষের পোশাক, ফুটওয়্যার ও গ্রুমিং এক প্ল্যাটফর্মে নিয়ে আসে—বাংলা ও ইংরেজি তালিকায় আত্মবিশ্বাস থেকে কেনাকাটা।

শুরু করুন নিরপেক্ষ টি ও পোলো দিয়ে (টি-শার্ট ও পোলো বিভাগ), এরপর অফিস স্মার্ট ক্যাজুয়াল হলে অক্সফোর্ড ও লিনেন ব্লেন্ড শার্ট যোগ করুন। প্যান্ট ও জিন্স থেকে স্লিম বা স্ট্রেট চিনো ও ডেনিম ঘুরিয়ে পরুন—প্রতিদিন একই লাইন রিপিট করবেন না।

সন্ধ্যার প্ল্যানের জন্য কোর জ্যাকেট, ওভারশার্ট বা হালকা ব্লেজার লেয়ার করুন। ফুটওয়্যার থেকে লেদার স্নিকার বা ডার্বি নিন—গাঢ় ডেনিম ও টেইলার্ড ট্রাউজার উভয়ের সাথেই যাবে।

গরম ও আর্দ্র আবহাওয়ায় সুতি ও লিনেন ব্লেন্ড আরাম দেয়; চেকআউটের আগে কলার ও সেলাই দেখুন। ক্যাটাগরি, ব্র্যান্ড ও সাইজ ফিল্টার দিয়ে নেভি, চারকোল, সাদা, কালো ও একটি অ্যাকেন্ট রঙে থাকুন।

এক clutter ছাড়াই কম জিনিসে বেশি লুক চান। আর একটি দরকার হলে /shop খুলে সাইজ অনুযায়ী শর্টলিস্ট করুন ও আপনার ভাষায় বিবরণ পড়ুন।`,
    },
  },
  {
    slug: "how-to-choose-sneakers-for-everyday",
    category: { en: "Footwear", bn: "জুতা" },
    title: {
      en: "Choosing everyday sneakers: a CartNexus footwear buyer’s checklist",
      bn: "রোজকার স্নিকার বাছাই: কার্টনেক্সাস ফুটওয়্যার চেকলিস্ট",
    },
    excerpt: {
      en: "Fit, upper material, cushioning, and colours that pair with our pants line—so your CartNexus sneakers earn shelf space.",
      bn: "ফিট, আপার, কুশনিং ও আমাদের প্যান্ট লাইনের সাথে মেলানো রঙ—যাতে কেনা স্নিকার দীর্ঘদিন কাজে লাগে।",
    },
    keywords: {
      en: "CartNexus sneakers men, leather sneakers Bangladesh, men's shoes online",
      bn: "কার্টনেক্সাস স্নিকার, পুরুষ জুতা, অনলাইন",
    },
    datePublished: "2026-01-12",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    imageUrl: IMG("1542291026-7eec264c27ff"),
    body: {
      en: `CartNexus lists sneakers beside dress shoes because most wardrobes need both: low-profile trainers for commuting and leather lace-ups when dress codes tighten.

Shopping Footwear on our site, prioritise heel lock and roomy toe boxes—Dhaka sidewalks reward stability. Midsoles should cushion concrete and stairs; if you walk miles daily, skip paper-thin soles sold only for aesthetics.

Smooth leather and denser synthetic uppers wipe clean after rain; cheap mesh often splits at toe flex points. White, off-white, grey, and navy align with our Pants and jeans assortment so one pair anchors several outfits.

Rotate two pairs when you can so foam recovers and odour drops. Replace when tread smooths or knees complain—new soles cost less than clinic visits.

Match EU or US sizing using charts on each product page, and filter by brand when you already know your fit.`,
      bn: `কার্টনেক্সাসে স্নিকার ও ড্রেস শু একসাথে—বেশিরভাগ ওয়ার্ডরোবেই দুটো লাগে: কমিউটের জন্য লো প্রোফাইল ট্রেইনার, ড্রেস কোড বাড়লে লেদার লেস-আপ।

সাইটে ফুটওয়্যার ব্রাউজ করতে গিয়ে হিল লক ও টো রুম গুরুত্ব দিন—ঢাকার ফুটপাথে স্থিরতা জরুরি। মিডসোল কংক্রিট ও সিঁড়ি শোষণ করুক; প্রতিদিন অনেক হাঁটলে শুধু লুকের জন্য চিকন সোল এড়িয়ে চলুন।

মসৃণ লেদার ও ঘন সিনথেটিক আপার ভিজে পরিষ্কার করা সহজ; সস্তা মেশ টো ফ্লেক্সে ছিঁড়ে যায়। সাদা, অফ হোয়াইট, ধূসর ও নেভি আমাদের প্যান্ট ও জিন্স প্যালেটের সাথে মেলে—এক জোড়ায় বহু লুক।

সম্ভব হলে দুই জোড়া ঘুরিয়ে পরুন। সোল মসৃণ বা হাঁটুতে ব্যথা হলে বদলান।

পণ্য পেজের চার্ট দিয়ে ইউরো বা ইউএস সাইজ মিলিয়ে নিন; চেনা ব্র্যান্ড থাকলে ফিল্টার ব্যবহার করুন।`,
    },
  },
  {
    slug: "office-style-smart-casual-guide",
    category: { en: "Workwear", bn: "অফিস পোশাক" },
    title: {
      en: "Smart casual for Bangladesh offices: shop shirts, chinos, and shoes on CartNexus",
      bn: "বাংলাদেশের অফিসে স্মার্ট ক্যাজুয়াল: কার্টনেক্সাসে শার্ট, চিনো ও জুতা",
    },
    excerpt: {
      en: "Translate dress codes into repeatable outfits using CartNexus shirts, trousers, belts, and structured footwear—without guesswork.",
      bn: "ড্রেস কোডকে আউটফিটে রূপ দিন—কার্টনেক্সাসের শার্ট, ট্রাউজার, বেল্ট ও গঠনযুক্ত জুতায়, অনুমান ছাড়াই।",
    },
    keywords: {
      en: "CartNexus shirts chinos men, smart casual Bangladesh office, men's workwear online",
      bn: "কার্টনেক্সাস শার্ট চিনো, অফিস পোশাক, পুরুষ ওয়ার্কওয়্যার",
    },
    datePublished: "2026-01-18",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-slate-700 via-slate-800 to-ink-950",
    imageUrl: IMG("1515378791036-0648a3ef77b2"),
    body: {
      en: `Smart casual is a formula you can repeat: crisp shirts, tailored Pants and jeans, a belt that echoes your shoe leather, and shaped footwear—loafers, derbies, or policy-approved leather sneakers.

Keep a navy or charcoal knit or light jacket at your desk when AC runs cold; our shirt lineup includes breathable cotton for muggy commutes and heavier oxfords when rooms chill.

Shoulder seams should sit on the shoulder; trousers can carry a slight or no break for a clean ankle. Use measurement tables on CartNexus instead of guessing international conversions.

Bundle two trousers, three shirts, and one shoe upgrade each quarter and you stay inside typical Bangladesh office norms without impulse buys that fight the wardrobe you already built.`,
      bn: `স্মার্ট ক্যাজুয়াল একটি পুনরাবৃত্ত সূত্র: পরিষ্কার শার্ট, টেইলার্ড প্যান্ট ও জিন্স, জুতার লেদারের সাথে মিলিয়ে বেল্ট, আর গঠনযুক্ত ফুটওয়্যার—লোফার, ডারিবি বা নিয়ম অনুযায়ী লেদার স্নিকার।

এসি ঠান্ডা হলে ডেস্কে নেভি বা চারকোল নিট বা হালকা জ্যাকেট রাখুন। শার্ট লাইনে গরম কমিউটের জন্য শ্বাসযোগ্য কটন ও ঠান্ডা রুমের জন্য ভারী অক্সফোর্ড আছে।

কাঁধের সেলাই কাঁধের কিনারায়; প্যান্টে আধুনিক লাইনের জন্য ব্রেক সামান্য বা নেই। আন্তর্জাতিক সাইজ অনুমান না করে কার্টনেক্সাসের মাপ টেবিল ব্যবহার করুন।

প্রতি ত্রৈমাসিকে দুটি প্যান্ট, তিনটি শার্ট ও একটি জুতা আপগ্রেড—বেশিরভাগ বাংলাদেশি অফিস নিয়মে থাকবেন, ইম্পাল্স কেনা ছাড়াই যা আগের ওয়ার্ডরোবের সাথে লড়ে।`,
    },
  },
  {
    slug: "layering-winter-mens-fashion",
    category: { en: "Seasonal", bn: "মৌসুমি" },
    title: {
      en: "Layering jackets and knits: what to buy for cool evenings and travel",
      bn: "জ্যাকেট ও নিট লেয়ারিং: ঠান্ডা সন্ধ্যা ও ভ্রমণে কী কিনবেন",
    },
    excerpt: {
      en: "Build a modular system with CartNexus shirts, mid-layers, and outerwear—peel off as the day warms.",
      bn: "কার্টনেক্সাসের শার্ট, মিড-লেয়ার ও আউটারওয়্যার দিয়ে মডুলার সিস্টেম—দিন গরম হলে খুলে ফেলুন।",
    },
    keywords: {
      en: "CartNexus men's jackets, winter layering Bangladesh, men's knits online",
      bn: "কার্টনেক্সাস জ্যাকেট, শীতে লেয়ার, পুরুষ নিট",
    },
    datePublished: "2026-01-25",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-blue-700 via-indigo-700 to-violet-800",
    imageUrl: IMG("1617127365659-c47fa864d8bc"),
    body: {
      en: `When Dhaka evenings cool down or you fly somewhere colder, thin layers outperform one bulky sweater. Shoppers pair year-round shirts and Pants and jeans with knits and jacket-style shirts from our catalog when forecasts dip.

Follow a three-step stack: moisture-managing base, insulating mid-layer, wind-friendly shell or overshirt. Vary textures so the outfit looks deliberate.

Scarves and beanies deliver warmth per taka; choose neutrals that match trainers and leather shoes already in your CartNexus Footwear orders.

Check outer-layer size guides—you need room for a shirt underneath—and favour pieces you will carry on trips, not only store in a closet.`,
      bn: `ঢাকার সন্ধ্যা ঠান্ডা বা বিদেশে ঠান্ডায় গেলে পাতলা কয়েক স্তর একটা মোটা সোয়েটারের চেয়ে ভালো। গ্রাহকরা সারা বছর শার্ট ও প্যান্ট জিন্সের সাথে আবহাওয়া নামলে ক্যাটালগের নিট ও জ্যাকেট-স্টাইল শার্ট মেলান।

তিন স্তর: আর্দ্রতা টানে এমন বেস, ইনসুলেটিং মিড, বাতাসরোধী শেল বা ওভারশির্ট। টেক্সচার বদলালে লুক পরিকল্পিত লাগে।

স্কার্ফ ও বিণি দাম অনুযায়ী গরম দেয়; নিরপেক্ষ রঙ বেছে নিন যা ফুটওয়্যার থেকে নেওয়া স্নিকার ও লেদার জুতার সাথে যায়।

আউটার লেয়ারের সাইজ গাইড দেখুন—ভেতরে শার্টের জায়গা লাগবে। শুধু আলমারিতে নয়, ভ্রমণেও যা নেওয়া যায় এমন পিস বেছে নিন।`,
    },
  },
  {
    slug: "skincare-routine-busy-men",
    category: { en: "Grooming", bn: "গ্রুমিং" },
    title: {
      en: "Men’s grooming on CartNexus: a fast routine before you head to checkout",
      bn: "কার্টনেক্সাসে পুরুষ গ্রুমিং: চেকআউটের আগে দ্রুত রুটিন",
    },
    excerpt: {
      en: "Cleanse, moisturise, SPF—products that sit alongside our fashion catalog so self-care fits your cart.",
      bn: "ক্লিনজ, ময়েশ্চারাইজ, SPF—ফ্যাশন ক্যাটালগের পাশেই যেন যত্নও কার্টে উঠে।",
    },
    keywords: {
      en: "CartNexus grooming men, SPF skincare Bangladesh, men's care products online",
      bn: "কার্টনেক্সাস গ্রুমিং, পুরুষ স্কincare, অনলাইন",
    },
    datePublished: "2026-02-02",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    imageUrl: IMG("1582735689369-4fe89db7114c"),
    body: {
      en: `Grooming sits next to apparel on CartNexus because polished outfits land better on calm, protected skin.

Morning and night, cleanse gently, moisturise for your skin type, and wear broad-spectrum SPF—even near sunny windows on high-UV days. Add a mild exfoliant once or twice weekly if pores clog; skip harsh daily scrubs.

Fragrance discovery sets pair well with belts or wallets when you bundle gifts from the same order.

Read Bangla or English ingredient notes on PDPs to pick textures suited to humid Bangladesh weather.`,
      bn: `গ্রুমিং কার্টনেক্সাসে পোশাকের পাশেই রাখা হয়েছে—পরিপাটি লুক শান্ত, সুরক্ষিত ত্বকে আরও ভালো বসে।

সকাল ও সন্ধ্যায় নরম ক্লিনজার, ত্বকের ধরন অনুযায়ী ময়েশ্চারাইজার, আর প্রতিদিন ব্রড-স্পেকট্রাম SPF—উচ্চ UV দিনে জানালার পাশেও। বিটর লাগলে সপ্তাহে এক দুবার হালকা এক্সফোলিয়েন্ট; প্রতিদিন কঠোর স্ক্রাব নয়।

ফ্র্যাগ্রেন্স ডিসকভারি সেট বেল্ট বা ওয়ালেটের সাথে উপহার বান্ডিলে ভালো মেলে।

আর্দ্র বাংলাদেশের আবহাওয়ায় উপযোগী টেক্সচার বেছে নিতে পণ্য পেজে বাংলা বা ইংরেজি উপাদান পড়ুন।`,
    },
  },
  {
    slug: "sustainable-mens-fashion-tips",
    category: { en: "Lifestyle", bn: "লাইফস্টাইল" },
    title: {
      en: "Buying less, wearing more: how CartNexus focuses on lasting menswear",
      bn: "কম কিনুন, বেশি পরুন: কার্টনেক্সাস টেকসই পুরুষ পোশাকে কেন জোর দেয়",
    },
    excerpt: {
      en: "Wear counts beat haul counts—choose versatile CartNexus pieces that pair across categories.",
      bn: "হালের চেয়ে পরার সংখ্যা বড়—ক্যাটাগরি জুড়ে মেলে এমন বহুমুখী পণ্য বেছে নিন।",
    },
    keywords: {
      en: "CartNexus quality menswear, durable men's clothing Bangladesh, slow fashion tips",
      bn: "কার্টনেক্সাস গুণগত পোশাক, টেকসই ফ্যাশন",
    },
    datePublished: "2026-02-08",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-brand-700 via-teal-700 to-emerald-900",
    imageUrl: IMG("1515886657613-9f3515b0c78f"),
    body: {
      en: `Sustainable shopping on CartNexus means maximising wears per hanger: versatile shirts, chinos, denim, and knits that still coordinate next season.

Neutral palettes let a new shirt talk to trousers you bought months earlier. Cold-water washes, air-dried knits, and early button repairs stretch garment life.

When you upgrade, donate pieces that still have wear left so they stay in circulation.

Shop for gaps that real weeks expose—office days, events, commutes—not flash markdowns that clash with colours you already own.`,
      bn: `কার্টনেক্সাসে টেকসই কেনাকাটা মানে প্রতি হ্যাঙারে বেশি পরা: বহুমুখী শার্ট, চিনো, ডেনিম ও নিট যা পরের সিজনেও মিলবে।

নিরপেক্ষ প্যালেটে নতুন শার্ট কয়েক মাস আগের প্যান্টের সাথে কথা বলে। ঠান্ডা পানিতে ধোয়া, নিট এয়ার-ড্রাই ও দ্রুত বাটন সেলাই জীবন বাড়ায়।

আপগ্রেড করলে পরার যোগ্য জিনিস দান করুন যাতে চক্রাকারে চলতে থাকে।

সপ্তাহের বাস্তব চাহিদা—অফিস, অনুষ্ঠান, কমিউট—অনুযায়ী ঘাটতি কিনুন; ফ্ল্যাশ ডিসকাউন্ট নয় যা আপনার রঙের গল্প ভাঙে।`,
    },
  },
  {
    slug: "shoe-care-make-leather-last",
    category: { en: "Care", bn: "যত্ন" },
    title: {
      en: "Protect leather shoes you bought on CartNexus: care that pays for itself",
      bn: "কার্টনেক্সাসে নেওয়া লেদার জুতা বাঁচান: যত্ন যা নিজেকে টেকায়",
    },
    excerpt: {
      en: "Trees, rotation, cleaning, conditioning—extend the life of dress shoes and sneakers from our footwear range.",
      bn: "শু ট্রি, ঘোরানো, পরিষ্কার, কন্ডিশন—ফুটওয়্যার রেঞ্জের ড্রেস শু ও স্নিকারের আয়ু বাড়ান।",
    },
    keywords: {
      en: "CartNexus shoe care, leather shoe maintenance men, men's footwear Bangladesh",
      bn: "কার্টনেক্সাস জুতা যত্ন, লেদার রক্ষণাবেক্ষণ",
    },
    datePublished: "2026-02-14",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-amber-800 via-orange-900 to-ink-950",
    imageUrl: IMG("1521572163474-6864f9cf17ab"),
    body: {
      en: `Leather footwear from CartNexus lasts longer when you rotate pairs and let hides dry between wears in humid weather.

Use cedar shoe trees to absorb moisture and preserve toe shape. Brush dust away before creams; condition every few weeks to prevent cracking; adjust polish intensity to your office dress code.

Store pairs out of direct sun in breathable bags—never stack heavy boxes on toe caps.

Add shoe-care items beside socks or insoles in the same basket to protect soles and uppers you already invested in.`,
      bn: `কার্টনেক্সাসের লেদার ফুটওয়্যার দীর্ঘ চলে যখন জোড়া ঘোরান ও আর্দ্র আবহাওয়ায় পরের মধ্যে লেদার শুকায়।

সিডার শু ট্রি দিয়ে আর্দ্রতা টানুন ও টো আকার ধরে রাখুন। ক্রিমের আগে ধুলো ব্রাশ করুন; কয়েক সপ্তাহে কন্ডিশন করুন—ফাটল রোধে। অফিস ড্রেস কোড অনুযায়ী পলিশ।

সরাসরি রোদ এড়িয়ে শ্বাসযোগ্য ব্যাগে রাখুন—টো ক্যাপের ওপর ভারী বাক্স চাপাবেন না।

মোজা বা ইনসোলের সাথে একই বাস্কেটে শু কেয়ার যোগ করুন—যে সোল ও আপারে ইতিমধ্যে বিনিয়োগ করেছেন তা রক্ষা পাবে।`,
    },
  },
  {
    slug: "gift-guide-men-bangladesh",
    category: { en: "Gifting", bn: "উপহার" },
    title: {
      en: "Corporate and personal gifting from CartNexus: safe picks that still feel thoughtful",
      bn: "কর্পোরেট ও ব্যক্তিগত উপহার: কার্টনেক্সাস থেকে নিরাপদ কিন্তু মন দেওয়া পছন্দ",
    },
    excerpt: {
      en: "Belts, wallets, grooming kits, and staples when you do not know his size—ordered from one Bangladesh‑friendly storefront.",
      bn: "বেল্ট, ওয়ালেট, গ্রুমিং কিট ও স্টেপল—সাইজ না জানলেও; একই দোকান থেকে অর্ডার।",
    },
    keywords: {
      en: "CartNexus gifts men Bangladesh, men's accessories gift, grooming gift set",
      bn: "কার্টনেক্সাস উপহার, পুরুষ অ্যাকসেসরি, বাংলাদেশ",
    },
    datePublished: "2026-02-20",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-violet-600 via-purple-700 to-indigo-900",
    imageUrl: IMG("1507003211169-0a1dd7228f2d"),
    body: {
      en: `When you are unsure of sizing, belts with multiple holes, slim wallets, cardholders, and premium socks ship fast from CartNexus accessories and make high-impact gifts.

Neutral colours keep office dress codes happy; for closer friends, a footwear gift card mentally notes that fit is personal.

During Eid, wedding season, or year-end peaks, add delivery notes at checkout so couriers reach busy households on time.

One storefront for fashion plus grooming cuts multiple delivery fees and keeps gifting organised.`,
      bn: `সাইজ নিয়ে দ্বিধা হলে ছিদ্রযুক্ত বেল্ট, স্লিম ওয়ালেট, কার্ডহোল্ডার ও প্রিমিয়াম মোজা কার্টনেক্সাস অ্যাকসেসরি থেকে দ্রুত যায় ও উপহার হিসেবে প্রভাব ফেলে।

নিরপেক্ষ রঙ অফিস ড্রেস কোডে নিরাপদ; কাছের বন্ধুর জন্য ফুটওয়্যার গিফট কার্ড ভাবুন—ফিট ব্যক্তিগত।

ইদ, বিয়ে মৌসুম বা বছর শেষে চেকআউটে ডেলিভারি নোট দিন যাতে ব্যস্ত বাড়িতে সময়মতো পৌঁছায়।

ফ্যাশন ও গ্রুমিং এক দোকানে—একাধিক ডেলিভারি ফি কমে উপহার সাজানো সহজ।`,
    },
  },
  {
    slug: "capsule-wardrobe-minimalist-men",
    category: { en: "Minimalism", bn: "মিনিমালিজম" },
    title: {
      en: "Capsule wardrobe: curate fewer CartNexus pieces for more weekly outfits",
      bn: "ক্যাপসুল ওয়ার্ডরোব: কম পণ্যে বেশি সপ্তাহিক লুক—কার্টনেক্সাসে বাছাই কীভাবে",
    },
    excerpt: {
      en: "Anchor colours, repeatable formulas, and filters so every new item earns its hanger space.",
      bn: "অ্যাঙ্কার রঙ, পুনরাবৃত্ত ফর্মুলা ও ফিল্টার—যাতে নতুন জিনিস প্রতিটি হ্যাঙারের যোগ্য।",
    },
    keywords: {
      en: "CartNexus capsule wardrobe men, minimalist closet Bangladesh, men's basics online",
      bn: "কার্টনেক্সাস ক্যাপসুল, মিনিমাল ক্লোজেট",
    },
    datePublished: "2026-02-26",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 8,
    gradient: "from-zinc-600 via-neutral-800 to-stone-900",
    imageUrl: IMG("1617127365659-c47fa864d8bc"),
    body: {
      en: `A capsule wardrobe is decision leverage: two or three trouser silhouettes from Pants and jeans, four or five shirts that span office and weekend, two footwear profiles, plus knit or overshirt layers when the AC runs cold.

Anchor navy, charcoal, white, cream, black, and one accent like olive or burgundy. Keep patterns subtle so layers stack cleanly.

On Sunday evenings, lay out five looks, snap photos, and list true gaps—then filter CartNexus so you only buy what solves a hole, not whatever a model wears in a banner.

Purposeful carts mean fewer returns and quicker weekday mornings.`,
      bn: `ক্যাপসুল ওয়ার্ডরোব মানে সিদ্ধান্তের লিভারেজ: প্যান্ট ও জিন্স থেকে দুই তিনটি ট্রাউজার সিলুয়েট, অফিস ও উইকএন্ড মিলিয়ে চার পাঁচটি শার্ট, দুই ধরনের ফুটওয়্যার, এসি ঠান্ডা হলে নিট বা ওভারশির্ট।

নেভি, চারকোল, সাদা, ক্রিম, কালো ও একটি অ্যাকেন্ট যেমন অলিভ বা বারগান্ডি। প্যাটার্ন সূক্ষ্ম রাখুন যাতে লেয়ার পরিষ্কার মেলে।

রবিবার সন্ধ্যায় পাঁচটি লুক বের করে ছবি তুলুন ও সত্যিকারের ঘাটতি লিখুন—তারপর কার্টনেক্সাস ফিল্টার দিয়ে শুধু সেই ফিল করুন, ব্যানারের মডেল যা পরেছে তা নয়।

লক্ষ্যভিত্তিক কার্ট মানে কম রিটার্ন ও দ্রুত সপ্তাহের সকাল।`,
    },
  },
  {
    slug: "denim-fit-guide-men",
    category: { en: "Fit guide", bn: "ফিট গাইড" },
    title: {
      en: "Denim fits on CartNexus: slim, straight, relaxed—and how they pair with our shoes",
      bn: "কার্টনেক্সাসে ডেনিম ফিট: স্লিম, স্ট্রেট, রিল্যাক্সড—জুতার সাথে মেলানো",
    },
    excerpt: {
      en: "Rise, thigh room, and length—choose jeans that match the trainers and boots you already wear from our catalog.",
      bn: "রাইজ, থাই রুম, দৈর্ঘ্য—ক্যাটালগের ট্রেইনার ও বুটের সাথে মিলিয়ে জিন্স বেছে নিন।",
    },
    keywords: {
      en: "CartNexus men's jeans Bangladesh, denim fit guide men, jeans and sneakers",
      bn: "কার্টনেক্সাস জিন্স, ডেনিম ফিট গাইড",
    },
    datePublished: "2026-03-05",
    dateModified: "2026-04-19",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-sky-800 via-blue-900 to-ink-950",
    imageUrl: IMG("1542272604-787c3835535d"),
    body: {
      en: `CartNexus denim listings spell out rise, leg shape, and stretch—read them like maps, not guesses.

Slim fits taper below the knee for a modern line with low-profile sneakers or sleek derbies. Straight fits keep parallel lines for heritage outfits and work boots. Relaxed fits offer thigh and seat room; pair chunkier soles if the silhouette feels top-heavy.

Break—the fabric stack at your shoe—should be intentional: none or slight break with trainers; a touch more stack if you cuff deliberately.

Try jeans with the same footwear you wear weekly from our catalog; hem when needed—tailoring upgrades a mid-price jean into a daily favourite.`,
      bn: `কার্টনেক্সাস ডেনিম লিস্টিংয়ে রাইজ, লেগ শেইপ ও স্ট্রেচ স্পষ্ট—অনুমান নয়, মানচিত্র হিসেবে পড়ুন।

স্লিম ফিট হাঁটুর নিচে টেপার—লো প্রোফাইল স্নিকার বা স্লিক ডার্বির সাথে আধুনিক লাইন। স্ট্রেট ফিট প্যারালেল লাইন—হেরিটেজ লুক ও ওয়ার্ক বুট। রিল্যাক্সড ফিট থাই ও সিটে জায়গা দেয়; সিলুয়েট ভারী লাগলে একটু চাঙ্কি সোল।

ব্রেক—জুতায় কাপড় জমা—ইচ্ছাকৃত হোক: স্নিকারে নাই বা সামান্য; ইচ্ছাকৃত কাফ হলে একটু বেশি স্ট্যাক।

সাপ্তাহিক পরা ফুটওয়্যার দিয়ে জিন্স ট্রাই করুন; প্রয়োজনে হেম—টেইলরিং মাঝারি দামের জিনিসকে দৈনন্দিন পছন্দ বানায়।`,
    },
  },
];

const bySlug = new Map(BLOG_POSTS.map((p) => [p.slug, p]));

export function getAllPostsSorted() {
  return [...BLOG_POSTS].sort((a, b) => {
    const af = a.featured ? 1 : 0;
    const bf = b.featured ? 1 : 0;
    if (bf !== af) return bf - af;
    return a.datePublished < b.datePublished ? 1 : -1;
  });
}

/** Oldest → newest by publish date (for prev/next navigation). */
export function getPostsChronological() {
  return [...BLOG_POSTS].sort(
    (a, b) => a.datePublished.localeCompare(b.datePublished) || a.slug.localeCompare(b.slug),
  );
}

/** Previous = older article; next = newer article (by publication date). */
export function getAdjacentBySlug(slug) {
  const ordered = getPostsChronological();
  const i = ordered.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? ordered[i - 1] : null,
    next: i < ordered.length - 1 ? ordered[i + 1] : null,
  };
}

export function getPostBySlug(slug) {
  return bySlug.get(slug) ?? null;
}

export function getRelatedPosts(slug, limit = 3) {
  const post = getPostBySlug(slug);
  if (!post) return getAllPostsSorted().slice(0, limit);
  const sameCat = BLOG_POSTS.filter((p) => p.slug !== slug && p.category.en === post.category.en);
  const rest = BLOG_POSTS.filter((p) => p.slug !== slug && p.category.en !== post.category.en);
  const merged = [...sameCat, ...rest];
  return merged.slice(0, limit);
}

export function pickLocalized(localized, lang) {
  return lang?.startsWith("bn") ? localized.bn : localized.en;
}
