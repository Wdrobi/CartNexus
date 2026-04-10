/**
 * Writes backend/db/seed.sql with 10 men's fashion categories × 10 products.
 * Run: node backend/scripts/generate-mens-seed.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "db", "seed.sql");

const IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1622445275751-13fa261cba76?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1593032485979-d2e701b7c877?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600185365926-3a5ce2bd5b5c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232fdf7d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490114538077-275a67f0d028?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522312346377-d89e42dc764e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1622434641406-158d48b67cb0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1620799140408-ed534d426b47?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1610397648934-fb5731f0f29b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
];

const cats = [
  { bn: "টি-শার্ট ও পোলো", en: "T-Shirts & Polos", slug: "t-shirts-polos", sort: 1 },
  { bn: "শার্ট", en: "Shirts", slug: "shirts", sort: 2 },
  { bn: "প্যান্ট ও জিন্স", en: "Pants & Jeans", slug: "pants-jeans", sort: 3 },
  { bn: "জ্যাকেট ও আউটারওয়্যার", en: "Outerwear & Jackets", slug: "outerwear", sort: 4 },
  { bn: "অ্যাক্টিভওয়্যার", en: "Activewear", slug: "activewear", sort: 5 },
  { bn: "জুতা", en: "Footwear", slug: "footwear", sort: 6 },
  { bn: "আন্ডারওয়্যার ও মোজা", en: "Underwear & Socks", slug: "underwear-socks", sort: 7 },
  { bn: "ঘড়ি ও অ্যাক্সেসারিজ", en: "Watches & Accessories", slug: "watches-accessories", sort: 8 },
  { bn: "ব্যাগ ও ওয়ালেট", en: "Bags & Wallets", slug: "bags-wallets", sort: 9 },
  { bn: "গ্রুমিং ও স্কিনকেয়ার", en: "Grooming & Skincare", slug: "grooming-skincare", sort: 10 },
];

const productBlueprints = [
  [
    ["এসেনশিয়াল ক্রু নেক টি — সাদা", "Essential Crew Neck Tee — White", "Premium cotton, everyday fit.", "প্রিমিয়াম কটন, দৈনন্দিন ফিট।"],
    ["ক্লাসিক পোলো — কালো", "Classic Polo — Black", "Sharp collar, breathable pique.", "পোলো কলার, ব্রিদেবল পিকে।"],
    ["স্ট্রাইপ পোলো — নেভি", "Striped Polo — Navy", "Weekend-ready casual style.", "উইকএন্ড ক্যাজুয়াল স্টাইল।"],
    ["লংলাইন টি — চারকোল", "Longline Tee — Charcoal", "Modern silhouette, soft jersey.", "আধুনিক কাট, নরম জার্সি।"],
    ["হেনলি শার্ট — অলিভ", "Henley Shirt — Olive", "Three-button placket, slim fit.", "তিন বাটন, স্লিম ফিট।"],
    ["পকেট টি — স্টোন", "Pocket Tee — Stone", "Minimal chest pocket detail.", "মিনিমাল পকেট ডিটেইল।"],
    ["পারফরম্যান্স পোলো — গ্রে", "Performance Polo — Gray", "Moisture-wicking for warm days.", "ঘাম শোষণ, গরমে আরাম।"],
    ["ওভারসাইজড টি — ব্ল্যাক", "Oversized Tee — Black", "Streetwear relaxed drape.", "স্ট্রিটওয়্যার রিল্যাক্সড ফিট।"],
    ["ভি-নেক টি — সাদা", "V-Neck Tee — White", "Layer-friendly neckline.", "লেয়ার করতে সুবিধাজনক।"],
    ["টিপড কলার পোলো", "Tipped Collar Polo — Wine", "Contrast trim, smart casual.", "কনট্রাস্ট ট্রিম, স্মার্ট ক্যাজুয়াল।"],
  ],
  [
    ["অক্সফোর্ড বাটন-ডাউন — স্কাই", "Oxford Button-Down — Sky", "Crisp office-to-evening shirt.", "অফিস থেকে ইভনিং—ক্রিস্প শার্ট।"],
    ["লিনেন ব্লেন্ড শার্ট — বেইজ", "Linen Blend Shirt — Beige", "Lightweight summer staple.", "হালকা গ্রীষ্মের শার্ট।"],
    ["চেক ফ্লানেল শার্ট", "Check Flannel Shirt", "Soft brushed cotton.", "নরম ব্রাশড কটন।"],
    ["ডেনিম শার্ট — ইন্ডিগো", "Denim Shirt — Indigo", "Layer over tees or wear solo.", "টির ওপর বা একা পরুন।"],
    ["স্লিম ফিট ড্রেস শার্ট — হোয়াইট", "Slim Fit Dress Shirt — White", "Sharp collar, easy iron.", "সহজে ইস্ত্রি।"],
    ["চামব্রে শার্ট — ব্লু", "Chambray Shirt — Blue", "Casual texture, all-season.", "সব মৌসুমে ক্যাজুয়াল।"],
    ["শর্ট স্লিভ ক্যাজুয়াল শার্ট", "Short Sleeve Casual Shirt", "Vacation and weekend wear.", "ছুটি ও উইকএন্ড।"],
    ["স্ট্রাইপ ড্রেস শার্ট — নেভি", "Striped Dress Shirt — Navy", "Boardroom-ready stripes.", "ফরমাল স্ট্রাইপ।"],
    ["কর্ডুরয় ওভারশার্ট", "Corduroy Overshirt", "Textured layer for cool days.", "ঠান্ডায় টেক্সচার্ড লেয়ার।"],
    ["ব্যান্ড কলার শার্ট — ব্ল্যাক", "Band Collar Shirt — Black", "Minimal collar, modern edge.", "মিনিমাল কলার, মডার্ন লুক।"],
  ],
  [
    ["স্লিম ফিট চিনো — খাকি", "Slim Fit Chinos — Khaki", "Stretch cotton, office ready.", "স্ট্রেচ কটন।"],
    ["স্ট্রেইট লেগ জিন্স — ইন্ডিগো", "Straight Leg Jeans — Indigo", "Classic five-pocket denim.", "ক্লাসিক ফাইভ-পকেট।"],
    ["টেপার্ড ট্রাউজার — চারকোল", "Tapered Trousers — Charcoal", "Tailored ankle fit.", "টেইলার্ড অ্যাঙ্কল ফিট।"],
    ["কার্গো প্যান্ট — অলিভ", "Cargo Pants — Olive", "Utility pockets, durable twill.", "টেকসই টুইল।"],
    ["জগার্স — ব্ল্যাক", "Joggers — Black", "Tapered cuffs, soft fleece inside.", "নরম ফ্লিস ভিতরে।"],
    ["লাইটওয়েট ট্রাউজার — নেভি", "Lightweight Trousers — Navy", "Travel-friendly wrinkle resist.", "ট্রাভেল ফ্রেন্ডলি।"],
    ["রিল্যাক্সড ফিট জিন্স — লাইট ব্লু", "Relaxed Fit Jeans — Light Blue", "Room through thigh and knee.", "থাই ও হাঁটুতে আরাম।"],
    ["ড্রেস প্যান্ট — ব্ল্যাক", "Dress Pants — Black", "Flat front, sharp crease.", "ফ্ল্যাট ফ্রন্ট।"],
    ["শর্টস — স্টোন", "Chino Shorts — Stone", "9-inch inseam, summer staple.", "গ্রীষ্মের শর্টস।"],
    ["ওয়ার্কপ্যান্ট — ক্যামেল", "Work Pants — Camel", "Reinforced seams, daily grind.", "মজবুত সিম।"],
  ],
  [
    ["বোম্বার জ্যাকেট — নেভি", "Bomber Jacket — Navy", "Lightweight nylon shell.", "হালকা নাইলন শেল।"],
    ["ডেনিম জ্যাকেট — মিড ওয়াশ", "Denim Jacket — Mid Wash", "Layering essential.", "লেয়ারিং অপরিহার্য।"],
    ["পাফার ভেস্ট — ব্ল্যাক", "Puffer Vest — Black", "Core warmth without bulk.", "গরম, হালকা।"],
    ["ওয়ুল ব্লেন্ড কোট — চারকোল", "Wool Blend Coat — Charcoal", "Cold-weather sophistication.", "ঠান্ডায় স্মার্ট লুক।"],
    ["হুডিড উইন্ডব্রেকার", "Hooded Windbreaker", "Packable rain shield.", "বৃষ্টির জন্য প্যাকেবল।"],
    ["শের্পা লাইন্ড জ্যাকেট", "Sherpa Lined Jacket", "Cozy fleece interior.", "ভিতরে আরামদায়ক ফ্লিস।"],
    ["ট্রাকার জ্যাকেট — ব্রাউন", "Trucker Jacket — Brown", "Heritage workwear vibe.", "ক্লাসিক ওয়ার্কওয়্যার।"],
    ["টেকনিক্যাল শেল জ্যাকেট", "Technical Shell Jacket", "Breathable waterproof layer.", "ওয়াটারপ্রুফ, ব্রিদেবল।"],
    ["কোয়িল্টেড লাইনার জ্যাকেট", "Quilted Liner Jacket", "Slim profile insulation.", "পাতলা ইনসুলেশন।"],
    ["ফ্লিস জ্যাকেট — গ্রে", "Fleece Jacket — Gray", "Outdoor and commute friendly.", "আউটডোর ও কমিউট।"],
  ],
  [
    ["পারফরম্যান্স টি — ব্ল্যাক", "Performance Tee — Black", "Gym-to-street quick dry.", "জিম থেকে স্ট্রিট।"],
    ["রানিং শর্টস — নেভি", "Running Shorts — Navy", "Built-in liner, zip pocket.", "জিপ পকেট।"],
    ["ট্র্যাক প্যান্ট — গ্রে", "Track Pants — Gray", "Tapered legs, side stripes.", "সাইড স্ট্রাইপ।"],
    ["ট্রেনিং হুডি — চারকোল", "Training Hoodie — Charcoal", "Midweight fleece.", "মিডওয়েট ফ্লিস।"],
    ["কম্প্রেশন লেগিং", "Compression Leggings", "Muscle support base layer.", "বেস লেয়ার।"],
    ["স্পোর্টস পোলো — হোয়াইট", "Sports Polo — White", "Golf and tennis ready.", "গল্ফ ও টেনিস।"],
    ["হাইকিং শর্টস — অলিভ", "Hiking Shorts — Olive", "Durable ripstop fabric.", "রিপস্টপ ফ্যাব্রিক।"],
    ["ময়েশ্চার উইকিং ট্যাঙ্ক", "Moisture-Wicking Tank", "Hot workout days.", "জিমে হালকা।"],
    ["অ্যাথলেটিক জ্যাকেট", "Athletic Jacket", "Warm-up and cool-down layer.", "ওয়ার্ম-আপ লেয়ার।"],
    ["ইয়োগা জগার্স", "Yoga Joggers", "Four-way stretch comfort.", "স্ট্রেচ আরাম।"],
  ],
  [
    ["ক্লাসিক স্নিকার — হোয়াইট", "Classic Sneakers — White", "Leather upper, cushioned sole.", "লেদার আপার।"],
    ["রানিং শু — ব্ল্যাক/রেড", "Running Shoes — Black/Red", "Responsive foam midsole.", "ফোম মিডসোল।"],
    ["চেলসি বুট — ব্রাউন", "Chelsea Boots — Brown", "Elastic gusset, sleek profile.", "ইলাস্টিক গাসেট।"],
    ["লোফার — নেভি সুয়েড", "Loafer — Navy Suede", "Handsome slip-on dress casual.", "স্লিপ-অন।"],
    ["হাইটপ স্নিকার — ক্যামেল", "High-Top Sneaker — Camel", "Street and weekend wear.", "স্ট্রিট স্টাইল।"],
    ["ডেসার্ট চুক্কা বুট", "Desert Chukka Boot", "Suede, versatile neutral tone.", "সুয়েড।"],
    ["অ্যাথলেটিক স্লাইড", "Athletic Slides", "Post-gym recovery comfort.", "জিমের পর আরাম।"],
    ["ড্রেস শু — ব্ল্যাক", "Dress Shoes — Black", "Oxford toe cap formal.", "অক্সফোর্ড ফরমাল।"],
    ["ট্রেইল হাইকিং শু", "Trail Hiking Shoe", "Grip outsole, ankle support.", "গ্রিপ আউটসোল।"],
    ["এসপেড্রিল — বেইজ", "Espadrille — Beige", "Summer breathable casual.", "গ্রীষ্মের ক্যাজুয়াল।"],
  ],
  [
    ["কটন বক্সার ব্রিফ — মাল্টি প্যাক", "Cotton Boxer Briefs — Multi", "Soft waistband, 3-pack.", "৩-প্যাক।"],
    ["আন্ডারশার্ট — হোয়াইট", "Undershirt — White", "V-neck layer under shirts.", "শার্টের নিচে লেয়ার।"],
    ["অ্যাথলেটিক সকস — ব্ল্যাক", "Athletic Socks — Black", "Cushioned heel and toe.", "হিল ও টো কুশন।"],
    ["ড্রেস সকস — নেভি", "Dress Socks — Navy", "Fine merino blend.", "মেরিনো ব্লেন্ড।"],
    ["নো-শো সকস — গ্রে", "No-Show Socks — Gray", "Invisible with loafers.", "লোফারের সাথে।"],
    ["থার্মাল লেগgings", "Thermal Long Johns", "Cold weather base layer.", "ঠান্ডার বেস লেয়ার।"],
    ["মাইক্রোফাইবার সকস সেট", "Microfiber Sock Set", "Odor control, 5-pack.", "৫-প্যাক।"],
    ["কম্প্রেশন সকস", "Compression Socks", "Travel and recovery support.", "ট্রাভেল সাপোর্ট।"],
    ["বাম্বু ব্লেন্ড বক্সার", "Bamboo Blend Boxer", "Naturally soft and cool.", "নরম ও ঠান্ডা।"],
    ["ওয়ার্ক বুট সকস", "Work Boot Socks", "Extra padding for long shifts.", "বেশি প্যাডিং।"],
  ],
  [
    ["মিনিমাল কোয়ার্টজ ওয়াচ — সিলভার", "Minimal Quartz Watch — Silver", "Slim case, leather strap.", "লেদার স্ট্র্যাপ।"],
    ["ক্রোনোগ্রাফ স্পোর্টস ওয়াচ", "Chronograph Sports Watch", "Tachymeter bezel detail.", "ট্যাকিমিটার।"],
    ["লেদার ব্রেসলেট — ব্রাউন", "Leather Bracelet — Brown", "Stackable men's accessory.", "স্ট্যাকেবল।"],
    ["স্টিল চেইন নেকলেস", "Steel Chain Necklace", "Subtle everyday metal tone.", "এভরিডে মেটাল।"],
    ["পোলারাইজড সানগ্লাস — ব্ল্যাক", "Polarized Sunglasses — Black", "UV400 protection.", "UV400।"],
    ["টাই ক্লিপ সেট — সিলভার", "Tie Clip Set — Silver", "Matte finish gift box.", "ম্যাট ফিনিশ।"],
    ["কাফলিংকস — অনিক্স", "Cufflinks — Onyx", "Formal shirt hardware.", "ফরমাল হার্ডওয়্যার।"],
    ["বিন টুঁড়ি ক্যাপ — নেভি", "Wool Beanie — Navy", "Winter warmth.", "শীতে গরম।"],
    ["লেদার বেল্ট — ব্ল্যাক", "Leather Belt — Black", "Reversible black/brown.", "রিভার্সিবল।"],
    ["স্কার্ফ — গ্রে", "Wool Scarf — Gray", "Soft neck wrap.", "নরম স্কার্ফ।"],
  ],
  [
    ["লেদার ব্যাকপ্যাক — চারকোল", "Leather Backpack — Charcoal", "Laptop sleeve 15-inch.", "১৫\" ল্যাপটপ স্লিভ।"],
    ["ক্রসবডি ব্যাগ — ব্ল্যাক", "Crossbody Bag — Black", "Compact daily carry.", "কমপ্যাক্ট ক্যারি।"],
    ["ট্রাভেল ডাফেল — নেভি", "Travel Duffel — Navy", "Weekend getaway size.", "উইকএন্ড সাইজ।"],
    ["বাইফোল্ড ওয়ালেট — ব্রাউন", "Bifold Wallet — Brown", "RFID blocking slots.", "RFID ব্লক।"],
    ["কার্ড হোল্ডার — কার্বন", "Card Holder — Carbon", "Slim front pocket wallet.", "স্লিম ওয়ালেট।"],
    ["টোট ব্যাগ — ক্যানভাস", "Tote Bag — Canvas", "Gym and market runs.", "জিম ও বাজার।"],
    ["বেল্ট ব্যাগ — অলিভ", "Belt Bag — Olive", "Hands-free festival style.", "হ্যান্ডস ফ্রি।"],
    ["ল্যাপটপ স্লিভ — গ্রে", "Laptop Sleeve — Gray", "Padded faux leather.", "প্যাডেড স্লিভ।"],
    ["পাসপোর্ট হোল্ডার", "Passport Holder", "Travel document organizer.", "ট্রাভেল ডকুমেন্ট।"],
    ["কী অর্গানাইজার", "Key Organizer", "Quiet carry, no jingle.", "চাবির রিং।"],
  ],
  [
    ["ফেস ক্লিনজার — জেন্টল", "Face Cleanser — Gentle", "Daily grime without dryness.", "দৈনন্দিন পরিষ্কার।"],
    ["ময়েশ্চারাইজার SPF", "Moisturizer with SPF", "Lightweight sun protection.", "হালকা SPF।"],
    ["বিয়ার্ড অয়েল — স্যান্ডালউড", "Beard Oil — Sandalwood", "Softens and conditions.", "নরম করে।"],
    ["শেভিং ক্রিম — সেনসিটিভ", "Shaving Cream — Sensitive", "Rich lather, aloe blend.", "অ্যালো ব্লেন্ড।"],
    ["আফটারশেভ বাম", "Aftershave Balm", "Soothes post-shave skin.", "শেভের পর শান্ত।"],
    ["অ্যান্টি-পার্সপিরেন্ট — কুল", "Anti-Perspirant — Cool", "48h protection.", "৪৮ ঘণ্টা।"],
    ["হেয়ার ক্লে — ম্যাট", "Hair Clay — Matte", "Strong hold, natural finish.", "ম্যাট ফিনিশ।"],
    ["লিপ বাম — অ্যান SPF", "Lip Balm — SPF", "Outdoor lip care.", "আউটডোর কেয়ার।"],
    ["বডি ওয়াশ — চারকোল", "Body Wash — Charcoal", "Deep clean, fresh scent.", "ডিপ ক্লিন।"],
    ["হ্যান্ড ক্রিম", "Hand Cream", "Non-greasy for dry hands.", "শুষ্ক হাতে।"],
  ],
];

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

let pid = 0;
const productRows = [];

cats.forEach((cat, ci) => {
  productBlueprints[ci].forEach((row, pi) => {
    pid += 1;
    const [bn, en, den, dbn] = row;
    const slug = `${cat.slug}-p${pi + 1}`;
    const img = IMAGES[(ci * 10 + pi) % IMAGES.length];
    const price = 499 + ((ci * 37 + pi * 73) % 4500) + (pi % 3) * 50;
    const priceStr = price.toFixed(2);
    const compareSql = pi % 4 === 0 ? (price * 1.12).toFixed(2) : null;
    const stock = 15 + ((ci + pi * 5) % 85);
    const cid = ci + 1;
    const comparePart = compareSql === null ? "NULL" : compareSql;
    productRows.push(
      `(${cid}, '${esc(bn)}', '${esc(en)}', '${esc(slug)}', '${esc(dbn)}', '${esc(den)}', ${priceStr}, ${comparePart}, '${esc(img)}', ${stock}, 1)`
    );
  });
});

const header = `USE cartnexus;

-- Reset catalog (keeps users). Run after schema exists.
DELETE FROM products;
DELETE FROM categories;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- Admin (unchanged password: admin123)
INSERT INTO users (email, password_hash, role, name) VALUES
  (
    'admin@cartnexus.local',
    '$2b$10$Mxyam4tHwog2ckVdLdUD9.61.LUOfs8WtKUXU.Ytauzz11GW2/lDa',
    'admin',
    'Admin'
  )
  ON DUPLICATE KEY UPDATE email = email;

`;

const catSql =
  "INSERT INTO categories (name_bn, name_en, slug, sort_order) VALUES\n" +
  cats.map((c) => `  ('${esc(c.bn)}', '${esc(c.en)}', '${esc(c.slug)}', ${c.sort})`).join(",\n") +
  ";\n\n";

const prodSql =
  "INSERT INTO products (\n  category_id, name_bn, name_en, slug,\n  description_bn, description_en,\n  price, compare_at_price, image_url, stock, is_active\n) VALUES\n" +
  productRows.join(",\n") +
  ";\n";

fs.writeFileSync(out, header + catSql + prodSql, "utf8");
console.log("Wrote", out, "(" + productRows.length + " products)");
