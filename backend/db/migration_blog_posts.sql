-- Blog posts for storefront /blog and admin CRUD.
-- Run after core schema. See db/db-changelog.txt.

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  category_en VARCHAR(128) NOT NULL DEFAULT '',
  category_bn VARCHAR(128) NOT NULL DEFAULT '',
  title_en VARCHAR(280) NOT NULL,
  title_bn VARCHAR(280) NOT NULL,
  excerpt_en VARCHAR(600) NOT NULL DEFAULT '',
  excerpt_bn VARCHAR(600) NOT NULL DEFAULT '',
  keywords_en VARCHAR(512) NOT NULL DEFAULT '',
  keywords_bn VARCHAR(512) NOT NULL DEFAULT '',
  body_en MEDIUMTEXT NOT NULL,
  body_bn MEDIUMTEXT NOT NULL,
  author VARCHAR(160) NOT NULL DEFAULT 'CartNexus Editorial',
  read_time_min SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  gradient VARCHAR(160) NOT NULL DEFAULT 'from-slate-700 via-slate-800 to-ink-950',
  image_url VARCHAR(512) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  date_published DATE NULL,
  date_modified DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_blog_pub_date (is_published, date_published),
  KEY idx_blog_featured (is_featured, date_published),
  KEY idx_blog_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
