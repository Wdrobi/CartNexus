-- Per-admin checklist state for dashboard suggested tasks (optional).
-- Run once on existing DBs.

CREATE TABLE IF NOT EXISTS admin_task_completions (
  user_id INT UNSIGNED NOT NULL,
  task_key VARCHAR(190) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, task_key),
  KEY idx_admin_tasks_user (user_id),
  CONSTRAINT fk_admin_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
