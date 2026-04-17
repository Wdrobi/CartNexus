-- Product page: category layout, structured description JSON, color/volume variants.
-- Run once on existing databases that already have schema from phpmyadmin-setup.sql / schema.sql (pre-v2).

ALTER TABLE categories
  ADD COLUMN page_layout VARCHAR(32) NOT NULL DEFAULT 'clothing' AFTER sort_order;

UPDATE categories SET page_layout = 'footwear' WHERE slug = 'footwear';
UPDATE categories SET page_layout = 'accessories' WHERE slug IN ('watches-accessories', 'bags-wallets');
UPDATE categories SET page_layout = 'grooming' WHERE slug = 'grooming-skincare';

ALTER TABLE products
  ADD COLUMN description_sections_en JSON NULL AFTER description_en,
  ADD COLUMN description_sections_bn JSON NULL AFTER description_sections_en;

CREATE TABLE IF NOT EXISTS product_color_variants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  name_en VARCHAR(64) NOT NULL,
  name_bn VARCHAR(64) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pcv_product (product_id),
  CONSTRAINT fk_pcv_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
