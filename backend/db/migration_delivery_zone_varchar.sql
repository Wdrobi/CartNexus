-- Allow arbitrary delivery zone keys (e.g. new regions) while keeping defaults for existing rows.
-- Run on MySQL 8+ after migration_orders.sql.

ALTER TABLE orders
  MODIFY delivery_zone VARCHAR(64) NOT NULL DEFAULT 'inside_dhaka';
