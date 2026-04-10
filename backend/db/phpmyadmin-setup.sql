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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
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
-- পুরনো ডাটাবেজে শুধু টেবিল আপডেট: backend/db/migration_add_brands.sql একবার চালান।
