-- Checkout orders (guest or logged-in customer). Run once on existing DBs.

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
