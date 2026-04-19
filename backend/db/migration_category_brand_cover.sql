-- Category & brand tiles on home: optional custom cover image (URL or /uploads/...).
ALTER TABLE categories
  ADD COLUMN cover_image VARCHAR(512) NULL AFTER page_layout;

ALTER TABLE brands
  ADD COLUMN cover_image VARCHAR(512) NULL AFTER sort_order;
