-- Inventory audit log for manual stock adjustments (admin).
-- Run after core schema / migration_orders.sql.

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
