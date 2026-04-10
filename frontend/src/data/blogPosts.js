/**
 * Static blog posts for CartNexus (EN + BN). Used for listing, detail pages, and SEO JSON-LD.
 * @typedef {{ en: string; bn: string }} Localized
 * @typedef {{ slug: string; category: Localized; title: Localized; excerpt: Localized; keywords: Localized; datePublished: string; dateModified: string; author: string; readTimeMin: number; gradient: string; body: Localized }} BlogPost
 */

/** @type {BlogPost[]} */
export const BLOG_POSTS = [
  {
    slug: "mens-wardrobe-essentials-2026",
    category: { en: "Style essentials", bn: "স্টাইলের মূল জিনিস" },
    title: {
      en: "Men’s wardrobe essentials for 2026: build a smarter closet",
      bn: "২০২৬ সালের পুরুষদের ওয়ার্ডরোব: বুদ্ধিমত্তার সাথে ক্লোজেট গড়ুন",
    },
    excerpt: {
      en: "Neutral bases, one great jacket, and footwear that works weekdays and weekends — here is how to invest without clutter.",
      bn: "নিউট্রাল বেস, একটি ভালো জ্যাকেট, আর সপ্তাহে–সপ্তাহান্তে চলা জুতা—কিভাবে অপ্রয়োজনীয় জিনিস ছাড়াই বিনিয়োগ করবেন।",
    },
    keywords: {
      en: "men wardrobe essentials, men's fashion 2026, capsule closet men, CartNexus",
      bn: "পুরুষদের ওয়ার্ডরোব, পুরুষ ফ্যাশন, ক্লোজেট গাইড, কার্টনেক্সাস",
    },
    datePublished: "2026-01-08",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 7,
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    body: {
      en: `A practical wardrobe starts with pieces you can mix without thinking. Think two well-fitted tees, a crisp Oxford or poplin shirt, dark straight or tapered trousers, and one versatile layer such as a chore jacket or lightweight blazer.

Footwear anchors your look: one clean leather sneaker and one dressier option cover most Bangladesh city routines, from office commutes to evening plans.

Quality beats quantity. Natural fabrics that breathe — cotton, linen blends where appropriate — keep you comfortable in warm, humid months. Check seams, buttons, and zippers before you buy; they predict longevity.

Shop with a simple rule: if an item cannot pair with at least three things you already own, skip it unless it fills a clear gap. CartNexus curates men’s clothing and shoes so you can build this foundation step by step.`,
      bn: `বাস্তবসম্মত ওয়ার্ডরোব তৈরি হয় এমন জিনিস দিয়ে যেগুলো না ভেবেই মিলিয়ে পরা যায়। দুটি ভালো ফিটিংয়ের টি-শার্ট, একটি পরিষ্কার অক্সফোর্ড বা পপলিন শার্ট, গাঢ় সোজা বা টেপার্ড প্যান্ট, আর একটি বহুমুখী লেয়ার—যেমন কোর জ্যাকেট বা হালকা ব্লেজার।

জুতা আপনার লুককে ধরে রাখে: একটি পরিষ্কার লেদার স্নিকার আর একটি অফিস-ফ্রেন্ডলি জুতা দিয়ে ঢাকাসহ শহরজীবনের বেশিরভাগ দিন সামলানো যায়।

গুণগত মান পরিমাণের চেয়ে বড়। সুতি, প্রয়োজনে লিনেন ব্লেন্ড—গরম ও আর্দ্র আবহাওয়ায় আরাম দেয়। কেনার আগে সেলাই, বাটন ও জিপার দেখুন; এগুলোই durability বোঝায়।

একটি সহজ নিয়মে কেনাকাটা করুন: যদি কোনো জিনিস আপনার আগে থাকা কমপক্ষে তিনটির সাথে না মেলে, তাহলে এটি এড়িয়ে যান—যদি না স্পষ্ট একটি ঘাটতি পূরণ করে। কার্টনেক্সাস পুরুষদের পোশাক ও জুতা বাছাই করে যাতে আপনি ধাপে ধাপে এই ভিত গড়ে তুলতে পারেন।`,
    },
  },
  {
    slug: "how-to-choose-sneakers-for-everyday",
    category: { en: "Footwear", bn: "জুতা" },
    title: {
      en: "How to choose sneakers for everyday wear (and still look sharp)",
      bn: "রোজকার পরার জন্য স্নিকার বাছাই: স্মার্ট লুক ধরে রেখে",
    },
    excerpt: {
      en: "Midsole support, upper material, and colorways that pair with denim and chinos — a buyer’s checklist.",
      bn: "মিডসোল সাপোর্ট, আপার ম্যাটেরিয়াল, আর ডেনিম ও চিনোর সাথে মিলিয়ে যাওয়া রঙ—একটি কেনাকাটার চেকলিস্ট।",
    },
    keywords: {
      en: "men sneakers guide, everyday sneakers, leather sneakers men, CartNexus shoes",
      bn: "পুরুষ স্নিকার, রোজকার জুতা, লেদার স্নিকার, কার্টনেক্সাস",
    },
    datePublished: "2026-01-12",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    body: {
      en: `Everyday sneakers should feel good at 8pm, not just in the store. Look for a stable heel cup, enough toe room, and a midsole that absorbs concrete and stairs — especially if you walk a lot in the city.

Leather or quality synthetic uppers clean easier and age better than ultra-cheap mesh that frays. Neutral colors (white, off-white, grey, navy) pair with most men’s pants in our catalog.

Rotate two pairs if you can; it extends foam life and reduces odor. Replace when the tread is smooth or your knees start complaining — shoes are cheaper than physiotherapy.

Browse CartNexus footwear filters by size and style to shortlist pairs that match your routine, from minimal trainers to slightly chunkier silhouettes.`,
      bn: `রোজকার স্নিকার দোকানে নয়, সন্ধ্যা ৮টায়ও আরামদায়ক হওয়া উচিত। স্থিতিশীল হিল কাপ, যথেষ্ট টো রুম, আর এমন মিডসোল খুঁজুন যা কংক্রিট ও সিঁড়ি শোষণ করে—বিশেষ করে শহরে হাঁটাচলা বেশি হলে।

লেদার বা ভালো সিনথেটিক আপার সাফ করা সহজ এবং সস্তা মেশের চেয়ে ভালো বয়সে দেখায়। নিউট্রাল রঙ (সাদা, অফ-হোয়াইট, ধূসর, নেভি) আমাদের ক্যাটালগের বেশিরভাগ প্যান্টের সাথে মিলবে।

সম্ভব হলে দুই জোড়া ঘুরিয়ে পরুন; ফোমের আয়ু বাড়ে ও গন্ধ কমে। সোল মসৃণ হয়ে গেলে বা হাঁটুতে ব্যথা শুরু হলে বদলান—ফিজিওথেরাপির চেয়ে জুতা সস্তা।

সাইজ ও স্টাইল ফিল্টার দিয়ে কার্টনেক্সাসে ফুটওয়্যার ব্রাউজ করুন—মিনিমাল ট্রেইনার থেকে একটু চাঙ্কি সিলুয়েট পর্যন্ত।`,
    },
  },
  {
    slug: "office-style-smart-casual-guide",
    category: { en: "Workwear", bn: "অফিস পোশাক" },
    title: {
      en: "Office-ready smart casual: a simple formula that always works",
      bn: "অফিস-ফ্রেন্ডলি স্মার্ট ক্যাজুয়াল: একটি সহজ সূত্র যা মেলে",
    },
    excerpt: {
      en: "Shirt + chinos + loafers or derbies: tweak fabric weight and color for meetings or desk days.",
      bn: "শার্ট + চিনো + লোফার বা ডার্বি: মিটিং বা ডেস্ক ডের জন্য ফ্যাব্রিক ও রঙ ঠিক করুন।",
    },
    keywords: {
      en: "smart casual men office, business casual Bangladesh, men's workwear",
      bn: "স্মার্ট ক্যাজুয়াল, অফিস পোশাক পুরুষ, বাংলাদেশ",
    },
    datePublished: "2026-01-18",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-slate-700 via-slate-800 to-ink-950",
    body: {
      en: `Smart casual is not “jeans and any shirt.” It is intentional ease: tailored chinos or wool-blend trousers, a shirt with a proper collar, and shoes with structure — loafers, derbies, or clean leather sneakers if your office allows.

In warmer months, choose breathable cotton shirts and lighter colors; keep a navy or charcoal layer nearby for air-conditioned rooms.

Fit is the signal of professionalism. Shoulder seams should sit at the shoulder edge; trouser break should be slight or none for a modern line.

CartNexus stocks shirts, trousers, and belts so you can assemble a week of outfits without repeating the exact same combination.`,
      bn: `স্মার্ট ক্যাজুয়াল মানে “জিন্স আর যেকোনো শার্ট” নয়। এটি ইচ্ছাকৃত আরাম: টেইলার্ড চিনো বা উল-ব্লেন্ড ট্রাউজার, কলারওয়ালা শার্ট, আর গঠনযুক্ত জুতা—লোফার, ডার্বি, বা অফিসে চললে পরিষ্কার লেদার স্নিকার।

গরমে সুতি শার্ট ও হালকা রঙ বেছে নিন; এসি রুমের জন্য নেভি বা চারকোল লেয়ার কাছে রাখুন।

ফিটই প্রফেশনালিজমের সংকেত। কাঁধের সেলাই কাঁধের কিনারায় বসুক; আধুনিক লাইনের জন্য প্যান্টের ব্রেক সামান্য বা নেই।

কার্টনেক্সাসে শার্ট, ট্রাউজার ও বেল্ট পাবেন—এক সপ্তাহের আউটফিট একই কম্বিনেশন বারবার না করে সাজানো যায়।`,
    },
  },
  {
    slug: "layering-winter-mens-fashion",
    category: { en: "Seasonal", bn: "মৌসুমি" },
    title: {
      en: "Layering for men: stay warm without looking bulky",
      bn: "পুরুষদের লেয়ারিং: গরম থাকুন, ভারী দেখাবেন না",
    },
    excerpt: {
      en: "Base, mid, shell: fabric choices that work from mild Dhaka evenings to travel abroad.",
      bn: "বেস, মিড, শেল: ঢাকার হালকা শীত থেকে বিদেশ ভ্রমণ—ফ্যাব্রিক বাছাই।",
    },
    keywords: {
      en: "men layering winter, lightweight jacket men, men's outerwear",
      bn: "শীতে লেয়ার, পুরুষ জ্যাকেট, আউটারওয়্যার",
    },
    datePublished: "2026-01-25",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 5,
    gradient: "from-blue-700 via-indigo-700 to-violet-800",
    body: {
      en: `Layering is math: thin pieces add more warmth than one thick sweater that traps sweat. Start with a moisture-wicking tee or light long-sleeve, add a knit or fleece mid-layer, then a wind-resistant jacket or coat.

Contrast textures — smooth shirt, ribbed knit, matte shell — so the outfit looks considered, not accidental.

Scarves and beanies are functional jewelry; neutral colors keep the palette cohesive.

Explore CartNexus jackets and knits to build a modular system you can peel off as temperatures swing during the day.`,
      bn: `লেয়ারিং হলো হিসাব: একটা মোটা সোয়েটারের চেয়ে পাতলা কয়েকটা স্তর বেশি গরম দেয়। আর্দ্রতা টানে এমন টি বা হালকা লং-স্লিভ দিয়ে শুরু করুন, তারপর নিট বা ফ্লিস মিড-লেয়ার, শেষে বাতাসরোধী জ্যাকেট বা কোট।

টেক্সচারে ভিন্নতা রাখুন—মসৃণ শার্ট, রিবড নিট, ম্যাট শেল—যাতে লুক ইচ্ছাকৃত লাগে।

স্কার্ফ ও বিণি কাজের অলঙ্কার; নিউট্রাল রঙ প্যালেট একসাথে রাখে।

দিনে তাপমাত্রা ওঠানামায় খুলে ফেলার মতো মডুলার সিস্টেম গড়তে কার্টনেক্সাসের জ্যাকেট ও নিট দেখুন।`,
    },
  },
  {
    slug: "skincare-routine-busy-men",
    category: { en: "Grooming", bn: "গ্রুমিং" },
    title: {
      en: "A 5-minute skincare routine for busy men",
      bn: "ব্যস্ত পুরুষদের জন্য ৫ মিনিটের স্কিনকেয়ার রুটিন",
    },
    excerpt: {
      en: "Cleanse, moisturize, SPF: the minimum viable routine that protects skin in tropical sun.",
      bn: "ক্লিনজ, ময়েশ্চারাইজ, SPF: ট্রপিক্যাল রোদে ত্বকের ন্যূনতম যত্ন।",
    },
    keywords: {
      en: "men skincare routine, SPF men, grooming essentials CartNexus",
      bn: "পুরুষ স্কincare, SPF, গ্রুমিং",
    },
    datePublished: "2026-02-02",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 5,
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    body: {
      en: `You do not need twelve steps. Gentle cleanser in the morning and evening removes sweat and pollution. Follow with a lightweight moisturizer to seal hydration.

SPF every day — even indoors near windows — prevents dark spots and premature lines in strong UV climates.

Exfoliate chemically (mild AHA/BHA) once or twice a week if you are prone to clogged pores, not harsh scrubs daily.

CartNexus grooming picks focus on straightforward products that fit a bathroom shelf, not a laboratory.`,
      bn: `বারো ধাপ লাগবে না। সকাল-সন্ধ্যা হালকা ক্লিনজারে ঘাম ও দূষণ তুলুন। তারপর হালকা ময়েশ্চারাইজার দিয়ে আর্দ্রতা লক করুন।

প্রতিদিন SPF—জানালার পাশে বসেও—শক্তিশালী UV তে দাগ ও আগে ভাঁজ কমায়।

রোমখোলা ছিদ্রের সমস্যা থাকলে সপ্তাহে এক-দুইবার হালকা AHA/BHA এক্সফোলিয়েট করুন; প্রতিদিন খোঁড়াখুঁড়ি স্ক্রাব নয়।

কার্টনেক্সাসের গ্রুমিং পণ্য সরল—ল্যাব নয়, বাথরুম শেলফের জন্য।`,
    },
  },
  {
    slug: "sustainable-mens-fashion-tips",
    category: { en: "Lifestyle", bn: "লাইফস্টাইল" },
    title: {
      en: "Sustainable men’s fashion: small habits that actually matter",
      bn: "টেকসই পুরুষ ফ্যাশন: ছোট অভ্যাস যা আসলে কাজে লাগে",
    },
    excerpt: {
      en: "Buy less but better, care for fabrics, and extend garment life — without sacrificing style.",
      bn: "কম কিনুন কিন্তু ভালো, ফ্যাব্রিকের যত্ন নিন, পোশাকের আয়ু বাড়ান—স্টাইল ছাড়াই।",
    },
    keywords: {
      en: "sustainable fashion men, slow fashion tips, quality menswear",
      bn: "টেকসই ফ্যাশন, স্লো ফ্যাশন, গুণগত পোশাক",
    },
    datePublished: "2026-02-08",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-brand-700 via-teal-700 to-emerald-900",
    body: {
      en: `Sustainability starts with wear count. A shirt worn thirty times beats three disposable shirts worn twice each. Choose versatile colors and classic cuts that won’t look dated next season.

Wash cold when possible, air-dry knits, and repair small tears early — buttons and hems are cheap fixes at a tailor.

When you upgrade, pass on pieces in good condition so they stay in circulation.

CartNexus emphasizes durable construction and timeless silhouettes so your purchases work harder in real life.`,
      bn: `টেকসইতা শুরু হয় পরার সংখ্যায়। তিনটি ডিসপোজেবল শার্ট দুবার করে পরার চেয়ে একটি শার্ট তিরিশবার পরা ভালো। বহুমুখী রঙ ও ক্লাসিক কাট বেছে নিন—পরের সিজনে পুরনো দেখাবে না।

সম্ভব হলে ঠান্ডা পানিতে ধুয়ে ফেলুন, নিট এয়ার-ড্রাই করুন, ছোট ছিঁড়া দ্রুত সেলাই করুন—বাটন ও হেম টেইলরে সস্তা ঠিক।

আপগ্রেড করলে ভালো অবস্থার জিনিস কাউকে দিন যাতে চক্রাকারে চলতে থাকে।

কার্টনেক্সাস টেকসই তৈরি ও টাইমলেস সিলুয়েটে জোর দেয়—আপনার কেনা জিনিস বাস্তব জীবনে বেশি কাজে লাগে।`,
    },
  },
  {
    slug: "shoe-care-make-leather-last",
    category: { en: "Care", bn: "যত্ন" },
    title: {
      en: "Shoe care 101: make leather dress shoes and boots last years",
      bn: "জুতার যত্ন ১০১: লেদার ড্রেস শু ও বুট বছরের পর বছর",
    },
    excerpt: {
      en: "Trees, rotation, conditioning, and smart storage — protect your investment.",
      bn: "শু ট্রি, ঘোরানো, কন্ডিশনিং, স্মার্ট স্টোরেজ—বিনিয়োগ বাঁচান।",
    },
    keywords: {
      en: "leather shoe care men, shoe trees, polish routine",
      bn: "লেদার জুতা যত্ন, শু ট্রি, পলিশ",
    },
    datePublished: "2026-02-14",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 5,
    gradient: "from-amber-800 via-orange-900 to-ink-950",
    body: {
      en: `Insert cedar shoe trees after wear to absorb moisture and hold shape — especially in humid weather.

Rotate shoes so leather fibers recover between wears; daily beating in the same pair accelerates creasing and sole wear.

Clean dust first, then condition leather periodically to prevent cracking. Polish for dress codes; matte creams for casual leathers.

Find shoe care alongside footwear on CartNexus so new pairs start life with the right habits.`,
      bn: `পরার পর সিডার শু ট্রি ব্যবহার করুন—আর্দ্রতা শোষণ ও আকার ধরে রাখে, বিশেষ করে আর্দ্র আবহাওয়ায়।

জুতা ঘোরান যাতে লেদার ফাইবার বিশ্রাম পায়; একই জোড়া প্রতিদিন পরলে ভাঁজ ও সোল দ্রুত নষ্ট হয়।

আগে ধুলো তুলুন, পরে মাঝে মাঝে কন্ডিশন করুন—ফাটল রোধে। ড্রেস কোডে পলিশ; ক্যাজুয়াল লেদারে ম্যাট ক্রিম।

কার্টনেক্সাসে ফুটওয়্যারের পাশে শু কেয়ার পাবেন—নতুন জোড়া সঠিক অভ্যাস দিয়ে শুরু করুন।`,
    },
  },
  {
    slug: "gift-guide-men-bangladesh",
    category: { en: "Gifting", bn: "উপহার" },
    title: {
      en: "Gift guide: foolproof ideas for men in Bangladesh",
      bn: "উপহার গাইড: বাংলাদেশে পুরুষদের জন্য নিরাপদ আইডিয়া",
    },
    excerpt: {
      en: "Size-safe picks, grooming kits, and accessories that feel personal without guessing measurements.",
      bn: "সাইজ-সেফ পছন্দ, গ্রুমিং কিট, ব্যক্তিগত লাগে এমন অ্যাকসেসরি—মাপ না ধরেই।",
    },
    keywords: {
      en: "gifts for men Bangladesh, men's grooming gift, fashion gift ideas",
      bn: "পুরুষ উপহার বাংলাদেশ, গ্রুমিং গিফট",
    },
    datePublished: "2026-02-20",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-violet-600 via-purple-700 to-indigo-900",
    body: {
      en: `When you are unsure of size, choose belts with adjustable holes, quality socks, leather wallets, or fragrance discovery sets — high impact, lower risk.

A minimalist watch or a sturdy canvas weekender bag works across ages if you keep the design clean.

Bundle a small grooming set with a handwritten note; it reads thoughtful, not generic.

CartNexus gift-friendly categories — accessories, skincare, and staples — help you checkout quickly during busy seasons.`,
      bn: `সাইজ নিয়ে দ্বিধা থাকলে ছিদ্রযুক্ত বেল্ট, ভালো মোজা, লেদার ওয়ালেট বা ফ্র্যাগ্রেন্স সেট বেছে নিন—ঝুঁকি কম, প্রভাব বেশি।

মিনিমাল ঘড়ি বা মজবুত ক্যানভাস ব্যাগ বয়স ভেদে চলে—ডিজাইন পরিষ্কার রাখুন।

ছোট গ্রুমিং সেটের সাথে হাতের নোট—যত্ন নেওয়া মনে হবে, জেনেরিক নয়।

অ্যাকসেসরি, স্কincare ও স্টেপল—কার্টনেক্সাসে উপহার-ফ্রেন্ডলি ক্যাটাগরি ব্যস্ত মৌসুমে দ্রুত চেকআউটে সাহায্য করে।`,
    },
  },
  {
    slug: "capsule-wardrobe-minimalist-men",
    category: { en: "Minimalism", bn: "মিনিমালিজম" },
    title: {
      en: "Capsule wardrobe for men: 20 pieces, infinite outfits",
      bn: "পুরুষদের ক্যাপসুল ওয়ার্ডরোব: ২০ পিস, অসীম আউটফিট",
    },
    excerpt: {
      en: "A counted closet reduces decision fatigue. Here is a balanced mix of tops, bottoms, layers, and shoes.",
      bn: "সীমিত ক্লোজেট সিদ্ধান্তের ক্লান্তি কমায়। টপ, বটম, লেয়ার ও জুতার ভারসাম্যপূর্ণ মিশ্রণ।",
    },
    keywords: {
      en: "capsule wardrobe men, minimalist closet men, outfit formulas",
      bn: "ক্যাপসুল ওয়ার্ডরোব, মিনিমাল ক্লোজেট",
    },
    datePublished: "2026-02-26",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 8,
    gradient: "from-zinc-600 via-neutral-800 to-stone-900",
    body: {
      en: `Picture roughly four bottoms, seven tops, three layers, two pairs of shoes, plus underwear and socks — adjusted to your climate and office rules.

Stick to a tight color story: navy, grey, white, black, and one accent like olive or burgundy. Patterns should be subtle so they layer cleanly.

Lay outfits on Sunday night if Monday mornings are chaotic; photos on your phone help you remember winning combos.

Use CartNexus filters to fill gaps in your capsule without impulse buys that break your palette.`,
      bn: `প্রায় চারটি বটম, সাতটি টপ, তিনটি লেয়ার, দুই জোড়া জুতা, সাথে আন্ডারওয়্যার ও মোজা—আবহাওয়া ও অফিস নিয়ম অনুযায়ী ঠিক করুন।

রঙের গল্প টাইট রাখুন: নেভি, ধূসর, সাদা, কালো, আর একটি অ্যাকেন্ট যেমন অলিভ বা বারগান্ডি। প্যাটার্ন সূক্ষ্ম হোক যাতে লেয়ার পরিষ্কার মেলে।

সোমবার সকাল ব্যস্ত হলে রবিবার রাতে আউটফিট বের করে রাখুন; ফোনে ছবি জয়ী কম্বো মনে রাখতে সাহায্য করে।

কার্টনেক্সাস ফিল্টার দিয়ে ক্যাপসুলের ঘাটতি পূরণ করুন—ইম্পাল্স কেনা নয় যা প্যালেট ভাঙে।`,
    },
  },
  {
    slug: "denim-fit-guide-men",
    category: { en: "Fit guide", bn: "ফিট গাইড" },
    title: {
      en: "Denim fit guide for men: slim, straight, relaxed — what to pick",
      bn: "পুরুষদের ডেনিম ফিট গাইড: স্লিম, স্ট্রেট, রিল্যাক্সড—কী বেছে নেবেন",
    },
    excerpt: {
      en: "Rise, thigh room, and break explained so jeans flatter your build and shoes.",
      bn: "রাইজ, থাই রুম, ব্রেক ব্যাখ্যা—জিন্স যেন বডি ও জুতায় মেলে।",
    },
    keywords: {
      en: "men jeans fit guide, slim vs straight jeans, denim break",
      bn: "জিন্স ফিট, স্লিম স্ট্রেট জিন্স",
    },
    datePublished: "2026-03-05",
    dateModified: "2026-03-20",
    author: "CartNexus Editorial",
    readTimeMin: 6,
    gradient: "from-sky-800 via-blue-900 to-ink-950",
    body: {
      en: `Rise affects comfort and proportion: mid-rise suits most builds; low-rise can shorten the torso visually; high-rise elongates legs when paired with tucked or cropped tops.

Slim fits taper from knee to ankle; straight fits keep an even line; relaxed offers more thigh and seat room — choose based on your shape, not the trend alone.

Break is how fabric meets the shoe: no break looks modern; slight break is classic; stacking works with intentional casual styling.

Try denim from CartNexus with your usual shoes to judge length; hemming is normal — great jeans are worth tailoring.`,
      bn: `রাইজ আরাম ও অনুপাত নিয়ন্ত্রণ করে: মিড-রাইজ বেশিরভাগ বডিতে মানায়; লো-রাইজ ভিজুয়ালি টর্সো ছোট দেখাতে পারে; হাই-রাইজ টাক করা বা ক্রপ টপের সাথে পা লম্বা দেখায়।

স্লিম ফিট হাঁটু থেকে গোড়ালায় টেপার; স্ট্রেট সমান লাইন; রিল্যাক্সডে থাই ও সিটে বেশি জায়গা—ট্রেন্ড নয়, শরীর অনুযায়ী বেছে নিন।

ব্রেক হলো কাপড় কীভাবে জুতায় মিলে: নো ব্রেক আধুনিক; সামান্য ব্রেক ক্লাসিক; স্ট্যাকিং ইচ্ছাকৃত ক্যাজুয়াল স্টাইলে।

কার্টনেক্সাসের ডেনিম নিয়মিত জুতায় পরে দৈর্ঘ্য দেখুন; হেমিং স্বাভাবিক—ভালো জিন্স টেইলরিংয়ের যোগ্য।`,
    },
  },
];

const bySlug = new Map(BLOG_POSTS.map((p) => [p.slug, p]));

export function getAllPostsSorted() {
  return [...BLOG_POSTS].sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
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
