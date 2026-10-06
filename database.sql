-- Student Finance Manager - MySQL schema
-- Import this in phpMyAdmin or via MySQL CLI
-- Compatible with XAMPP (MariaDB/MySQL)

-- 1) Create database
CREATE DATABASE IF NOT EXISTS `student_finance_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `student_finance_db`;

-- Improve import robustness
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- 2) Users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `student_id` VARCHAR(64) DEFAULT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Categories (per-user)
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('income','expense','both') NOT NULL DEFAULT 'expense',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_category_name` (`user_id`, `name`),
  KEY `idx_categories_user` (`user_id`),
  CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Budgets
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `client_uid` VARCHAR(64) DEFAULT NULL,
  `budget_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `linked_goal_id` INT UNSIGNED DEFAULT NULL,
  `allocated_amount` DECIMAL(12,2) NOT NULL,
  `budget_period` VARCHAR(20) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_budget_user_client` (`user_id`,`client_uid`),
  KEY `idx_budgets_user` (`user_id`),
  KEY `idx_budgets_user_category` (`user_id`, `category_id`),
  UNIQUE KEY `uniq_budget_window` (`user_id`, `category_id`, `budget_period`, `start_date`),
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_budgets_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Expenditures
DROP TABLE IF EXISTS `expenditures`;
CREATE TABLE `expenditures` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `client_uid` VARCHAR(64) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `budget_id` INT UNSIGNED DEFAULT NULL,
  `expenditure_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_expense_user_client` (`user_id`,`client_uid`),
  KEY `idx_expenditures_user_date` (`user_id`, `expenditure_date`),
  KEY `idx_expenditures_user_category_date` (`user_id`, `category_id`, `expenditure_date`),
  KEY `idx_expenditures_budget` (`budget_id`),
  CONSTRAINT `fk_expenditures_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expenditures_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenditures_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `transaction_type` ENUM('income','expense') NOT NULL,
  `source` VARCHAR(150) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_user_date` (`user_id`, `transaction_date`),
  KEY `idx_transactions_type` (`transaction_type`),
  KEY `idx_transactions_user_category_date` (`user_id`, `category_id`, `transaction_date`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) Goals
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `client_uid` VARCHAR(64) DEFAULT NULL,
  `goal_name` VARCHAR(150) NOT NULL,
  `target_amount` DECIMAL(12,2) NOT NULL,
  `current_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `deadline` DATE NOT NULL,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'medium',
  `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_goal_user_client` (`user_id`,`client_uid`),
  KEY `idx_goals_user_deadline` (`user_id`, `deadline`),
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recurring transactions
DROP TABLE IF EXISTS `recurring_transactions`;
CREATE TABLE `recurring_transactions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `transaction_type` ENUM('income','expense') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `frequency` ENUM('daily','weekly','monthly','quarterly','yearly') NOT NULL,
  `next_run_date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recurring_user_next` (`user_id`, `next_run_date`),
  CONSTRAINT `fk_recurring_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recurring_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `entity` VARCHAR(64) NOT NULL,
  `entity_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` ENUM('create','update','delete') NOT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user_time` (`user_id`, `created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now that `goals` exists, add FK from budgets.linked_goal_id to goals.id
ALTER TABLE `budgets`
  ADD KEY `idx_budgets_goal` (`linked_goal_id`),
  ADD CONSTRAINT `fk_budgets_goal` FOREIGN KEY (`linked_goal_id`) REFERENCES `goals`(`id`) ON DELETE SET NULL;

-- Optional demo data: create your account via the Register page
-- INSERT INTO users (full_name, email, password) VALUES (...);

-- Additional helpful indexes
CREATE INDEX `idx_budgets_user_window` ON `budgets`(`user_id`, `start_date`, `end_date`);
CREATE INDEX `idx_expenditures_user_budget` ON `expenditures`(`user_id`, `budget_id`);
CREATE INDEX `idx_transactions_user_date_type` ON `transactions`(`user_id`, `transaction_date`, `transaction_type`);

-- Analytical views for the app
DROP VIEW IF EXISTS `view_budget_spend`;
CREATE VIEW `view_budget_spend` AS
SELECT
  b.id            AS budget_id,
  b.user_id       AS user_id,
  COALESCE(SUM(e.amount), 0) AS spent_amount
FROM budgets b
LEFT JOIN expenditures e
  ON e.user_id = b.user_id
 AND e.expenditure_date BETWEEN b.start_date AND b.end_date
 AND (
      (b.category_id IS NOT NULL AND e.category_id = b.category_id)
   OR (b.category_id IS NULL AND e.category = b.category)
   OR (e.budget_id = b.id)
 )
GROUP BY b.id;

DROP VIEW IF EXISTS `view_user_financials`;
CREATE VIEW `view_user_financials` AS
SELECT
  u.id AS user_id,
  COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.user_id = u.id AND t.transaction_type = 'income'), 0)  AS total_income,
  COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.user_id = u.id AND t.transaction_type = 'expense'), 0) AS total_expense,
  COALESCE((SELECT SUM(g.target_amount) FROM goals g WHERE g.user_id = u.id), 0)   AS goals_target,
  COALESCE((SELECT SUM(g.current_amount) FROM goals g WHERE g.user_id = u.id), 0)  AS goals_current
FROM users u;

DROP VIEW IF EXISTS `view_category_monthly_expense`;
CREATE VIEW `view_category_monthly_expense` AS
SELECT
  user_id,
  COALESCE(category_id, 0) AS category_id,
  category,
  DATE_FORMAT(expenditure_date, '%Y-%m-01') AS month_start,
  SUM(amount) AS total_amount
FROM expenditures
GROUP BY user_id, category_id, category, month_start;

-- 7) Activities (DB-backed activity history)
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `entity_type` VARCHAR(32) NOT NULL,
  `entity_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(32) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activities_user_time` (`user_id`, `created_at`),
  KEY `idx_activities_user_entity` (`user_id`, `entity_type`, `entity_id`),
  KEY `idx_activities_user_action` (`user_id`, `action`),
  CONSTRAINT `fk_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8) SMS Parser (store raw messages and parsed outputs)
DROP TABLE IF EXISTS `sms_messages`;
CREATE TABLE `sms_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `provider` VARCHAR(64) DEFAULT NULL,                -- e.g., 'MTN MoMo', 'Airtel Money', 'Bank'
  `sender` VARCHAR(64) DEFAULT NULL,                  -- SMS sender ID/number
  `message_text` TEXT NOT NULL,                       -- raw SMS content
  `message_hash` CHAR(64) NOT NULL,                   -- SHA-256 (or similar) hash to dedupe per user
  `received_at` DATETIME DEFAULT NULL,                -- when SMS was received (if known)
  `status` ENUM('raw','parsed','saved','error') NOT NULL DEFAULT 'raw',
  `error_message` VARCHAR(255) DEFAULT NULL,
  -- Parsed structured payload (as JSON blob for traceability)
  `parsed_json` JSON DEFAULT NULL,
  -- Common normalized parsed fields for quick filtering
  `txn_type` ENUM('income','expense','fee','transfer','unknown') DEFAULT 'unknown',
  `amount` DECIMAL(12,2) DEFAULT NULL,
  `currency` VARCHAR(16) DEFAULT NULL,
  `balance` DECIMAL(12,2) DEFAULT NULL,
  `reference` VARCHAR(128) DEFAULT NULL,
  `counterparty` VARCHAR(190) DEFAULT NULL,
  `txn_time` DATETIME DEFAULT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `budget_id` INT UNSIGNED DEFAULT NULL,
  `expenditure_id` INT UNSIGNED DEFAULT NULL,         -- if saved to expenditures
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_sms_user_hash` (`user_id`, `message_hash`),
  KEY `idx_sms_user_time` (`user_id`, `received_at`),
  KEY `idx_sms_user_status` (`user_id`, `status`),
  KEY `idx_sms_user_provider` (`user_id`, `provider`),
  KEY `idx_sms_budget` (`budget_id`),
  KEY `idx_sms_expenditure` (`expenditure_id`),
  CONSTRAINT `fk_sms_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sms_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sms_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sms_expenditure` FOREIGN KEY (`expenditure_id`) REFERENCES `expenditures`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Helpful indexes for SMS queries
CREATE INDEX `idx_sms_user_created` ON `sms_messages`(`user_id`, `created_at`);
CREATE INDEX `idx_sms_user_txn_time` ON `sms_messages`(`user_id`, `txn_time`);

-- Commit and re-enable FK checks
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
