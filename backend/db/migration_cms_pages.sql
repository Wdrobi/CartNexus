-- Editable legal/support pages (Terms, FAQs, Privacy). Run on MySQL 8+.
-- If table exists, you can skip this file.

CREATE TABLE IF NOT EXISTS cms_pages (
  page_key VARCHAR(32) NOT NULL PRIMARY KEY,
  body_html_en MEDIUMTEXT NULL,
  body_html_bn MEDIUMTEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO cms_pages (page_key, body_html_en, body_html_bn) VALUES
  ('terms', NULL, NULL),
  ('faqs', NULL, NULL),
  ('privacy', NULL, NULL);
