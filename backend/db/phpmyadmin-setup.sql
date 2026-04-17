-- =============================================================================
-- CartNexus — phpMyAdmin / XAMPP এ একবার চালান (SQL ট্যাব বা Import)
-- এরর: Table 'cartnexus.users' doesn't exist → এই ফাইল দিয়ে ঠিক হবে
-- =============================================================================

CREATE DATABASE IF NOT EXISTS cartnexus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cartnexus;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NULL,
  avatar_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  label VARCHAR(64) NOT NULL DEFAULT 'Home',
  recipient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) NULL,
  city VARCHAR(128) NOT NULL,
  area VARCHAR(128) NULL,
  postal_code VARCHAR(32) NULL,
  country VARCHAR(64) NOT NULL DEFAULT 'Bangladesh',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user ON user_addresses (user_id);

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

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  page_layout VARCHAR(32) NOT NULL DEFAULT 'clothing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  brand_id INT UNSIGNED NULL,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description_bn TEXT,
  description_en TEXT,
  description_sections_en JSON NULL,
  description_sections_bn JSON NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2) NULL,
  image_url VARCHAR(512) NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id)
    REFERENCES brands (id) ON DELETE SET NULL,
  KEY idx_products_category (category_id),
  KEY idx_products_brand (brand_id),
  KEY idx_products_active (is_active)
);

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

CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NULL,
  qty_delta INT NOT NULL,
  qty_after INT UNSIGNED NOT NULL,
  reason VARCHAR(32) NOT NULL DEFAULT 'adjustment',
  note VARCHAR(512) NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_inv_mov_product (product_id),
  KEY idx_inv_mov_created (created_at),
  CONSTRAINT fk_inv_mov_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_mov_variant FOREIGN KEY (variant_id) REFERENCES product_color_variants (id) ON DELETE SET NULL,
  CONSTRAINT fk_inv_mov_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  order_number VARCHAR(40) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_zone VARCHAR(64) NOT NULL DEFAULT 'inside_dhaka',
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL DEFAULT 'cod',
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_orders_user (user_id),
  UNIQUE KEY uq_orders_number (order_number),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name_en VARCHAR(255) NOT NULL,
  product_name_bn VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  image_url VARCHAR(512) NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  qty INT UNSIGNED NOT NULL,
  size VARCHAR(32) NOT NULL DEFAULT 'ONE',
  variant_id INT UNSIGNED NULL,
  variant_name_en VARCHAR(64) NULL,
  variant_name_bn VARCHAR(64) NULL,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_task_completions (
  user_id INT UNSIGNED NOT NULL,
  task_key VARCHAR(190) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, task_key),
  KEY idx_admin_tasks_user (user_id),
  CONSTRAINT fk_admin_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- অ্যাডমিন: ইউজারনেম admin বা ইমেইল admin@cartnexus.local | পাসওয়ার্ড admin123
INSERT INTO users (email, password_hash, role, name) VALUES
  (
    'admin@cartnexus.local',
    '$2b$10$Mxyam4tHwog2ckVdLdUD9.61.LUOfs8WtKUXU.Ytauzz11GW2/lDa',
    'admin',
    'Admin'
  )
  ON DUPLICATE KEY UPDATE email = email;

-- পূর্ণ ক্যাটালগ: ১০টি ব্র্যান্ড, ১০টি ক্যাটাগরি × ১০টি পণ্য (Unsplash ছবি)।
-- phpMyAdmin → Import → backend/db/seed.sql চালান (users অপরিবর্তিত থাকে; products/categories/brands রিসেট হবে)।
-- পুরনো ডাটাবেজ (আগে শুধু users+categories+products ছিল): migration_add_brands.sql ও migration_profile_addresses.sql একবার।
-- নতুন ইনস্টল: এই ফাইল + seed.sql = migration লাগবে না যদি সব টেবিল এখান থেকেই তৈরি হয়।
