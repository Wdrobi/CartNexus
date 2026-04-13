-- One-time migration for OLD databases created before profile + addresses.
-- If you already ran this: "Duplicate column" / "already exists" means skip — DB is fine.
-- Fresh installs: use db/schema.sql or db/phpmyadmin-setup.sql (no need to run this).
USE cartnexus;

ALTER TABLE users
  ADD COLUMN phone VARCHAR(32) NULL AFTER name,
  ADD COLUMN avatar_url VARCHAR(512) NULL AFTER phone;

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
