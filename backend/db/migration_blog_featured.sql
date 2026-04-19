-- Featured post on /blog (admin checkbox) + sort order on the public list.
-- Run after migration_blog_posts.sql. If you see "Duplicate column name is_featured", skip this file — already applied.

ALTER TABLE blog_posts
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published;

ALTER TABLE blog_posts
  ADD KEY idx_blog_featured (is_featured, date_published);
