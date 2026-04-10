-- Run once on existing CartNexus DB (already has products table).
-- Adds brands + optional brand_id on products, seeds 10 brands, assigns products round-robin.

USE cartnexus;

CREATE TABLE IF NOT EXISTS brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO brands (name_bn, name_en, slug, sort_order) VALUES
  ('নেক্সাস লাইন', 'Nexus Line', 'nexus-line', 1),
  ('অ্যাটলাস অ্যান্ড কো', 'Atlas & Co', 'atlas-co', 2),
  ('নর্থবাউন্ড', 'Northbound', 'northbound', 3),
  ('আরবান থ্রেড', 'Urban Thread', 'urban-thread', 4),
  ('মেরিডিয়ান', 'Meridian', 'meridian', 5),
  ('আয়রন অ্যান্ড ওক', 'Iron & Oak', 'iron-oak', 6),
  ('স্টুডিও ফর্ম', 'Studio Form', 'studio-form', 7),
  ('প্যাসিফিক রো', 'Pacific Row', 'pacific-row', 8),
  ('ফোর্জ অ্যাথলেটিক', 'Forge Athletic', 'forge-athletic', 9),
  ('লেজার অ্যান্ড সন্স', 'Ledger & Sons', 'ledger-sons', 10)
ON DUPLICATE KEY UPDATE name_bn = VALUES(name_bn), name_en = VALUES(name_en), sort_order = VALUES(sort_order);

-- If you see "Duplicate column name 'brand_id'", skip the next two ALTERs.
ALTER TABLE products
  ADD COLUMN brand_id INT UNSIGNED NULL AFTER category_id,
  ADD KEY idx_products_brand (brand_id);

ALTER TABLE products
  ADD CONSTRAINT fk_products_brand FOREIGN KEY (brand_id)
    REFERENCES brands (id) ON DELETE SET NULL;

UPDATE products SET brand_id = MOD(id - 1, 10) + 1 WHERE brand_id IS NULL;
