-- Single-row storefront / contact configuration (admin-editable).
CREATE TABLE IF NOT EXISTS store_settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  contact_address_en TEXT NULL,
  contact_address_bn TEXT NULL,
  contact_phone VARCHAR(64) NULL,
  contact_email VARCHAR(255) NULL,
  business_hours_en TEXT NULL,
  business_hours_bn TEXT NULL,
  social_facebook_url VARCHAR(512) NULL,
  social_instagram_url VARCHAR(512) NULL,
  social_youtube_url VARCHAR(512) NULL,
  social_other_url VARCHAR(512) NULL,
  map_embed_url VARCHAR(1024) NULL,
  map_external_url VARCHAR(1024) NULL,
  whatsapp_digits VARCHAR(32) NULL,
  whatsapp_prefill VARCHAR(600) NULL,
  messenger_url VARCHAR(512) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO store_settings (id) VALUES (1);
