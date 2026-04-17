-- One-time: home hero banner (2 rotating images), editable from admin.
-- Fresh installs: already in db/schema.sql + db/phpmyadmin-setup.sql
USE cartnexus;

CREATE TABLE IF NOT EXISTS home_hero (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  headline_en VARCHAR(280) NOT NULL DEFAULT 'Style and essentials for men in Bangladesh',
  headline_bn VARCHAR(280) NOT NULL DEFAULT '',
  subtext_en TEXT,
  subtext_bn TEXT,
  cta_label_en VARCHAR(160) NOT NULL DEFAULT 'Shop the collection',
  cta_label_bn VARCHAR(160) NOT NULL DEFAULT '',
  cta_url VARCHAR(512) NOT NULL DEFAULT '/shop',
  image_1_url VARCHAR(512) NULL,
  image_2_url VARCHAR(512) NULL,
  gradient_from VARCHAR(16) NOT NULL DEFAULT '#0f172a',
  gradient_to VARCHAR(16) NOT NULL DEFAULT '#0f766e',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO home_hero (
  id,
  headline_en,
  headline_bn,
  subtext_en,
  subtext_bn,
  cta_label_en,
  cta_label_bn,
  cta_url,
  image_1_url,
  image_2_url,
  gradient_from,
  gradient_to
) VALUES (
  1,
  'Style and essentials for men in Bangladesh',
  'বাংলাদেশে পুরুষদের পোশাক, জুতা ও গ্রুমিং — এক জায়গায়',
  'Browse clothing, shoes, and grooming with Bangla and English product details. Jump in by category or brand and shop with confidence.',
  'বাংলা ও ইংরেজিতে পণ্যের বিবরণ দেখে পোশাক, জুতা ও গ্রুমিং ব্রাউজ করুন। ক্যাটাগরি বা ব্র্যান্ড দিয়ে ফিল্টার করে নির্ভরে কেনাকাটা করুন।',
  'Shop the collection',
  'কালেকশন দেখুন',
  '/shop',
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1920&h=1080&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&h=1080&q=80',
  '#0f172a',
  '#0f766e'
)
ON DUPLICATE KEY UPDATE id = id;
