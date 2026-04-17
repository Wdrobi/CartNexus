-- Optional: refresh default hero copy + images for CartNexus full-bleed banner (run once if you already have home_hero row 1).
USE cartnexus;

UPDATE home_hero SET
  headline_en = 'Style and essentials for men in Bangladesh',
  headline_bn = 'বাংলাদেশে পুরুষদের পোশাক, জুতা ও গ্রুমিং — এক জায়গায়',
  subtext_en = 'Browse clothing, shoes, and grooming with Bangla and English product details. Jump in by category or brand and shop with confidence.',
  subtext_bn = 'বাংলা ও ইংরেজিতে পণ্যের বিবরণ দেখে পোশাক, জুতা ও গ্রুমিং ব্রাউজ করুন। ক্যাটাগরি বা ব্র্যান্ড দিয়ে ফিল্টার করে নির্ভরে কেনাকাটা করুন।',
  cta_label_en = 'Shop the collection',
  cta_label_bn = 'কালেকশন দেখুন',
  cta_url = '/shop',
  image_1_url = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1920&h=1080&q=85',
  image_2_url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&h=1080&q=80',
  gradient_from = '#0f172a',
  gradient_to = '#0f766e'
WHERE id = 1;
