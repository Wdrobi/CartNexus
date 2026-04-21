-- Email list from footer "Subscribe for updates" (public POST /api/newsletter/subscribe).
-- Run once: mysql ... < db/migration_newsletter_subscribers.sql

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'footer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_newsletter_subscribers_email (email(191)),
  KEY idx_newsletter_subscribers_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
