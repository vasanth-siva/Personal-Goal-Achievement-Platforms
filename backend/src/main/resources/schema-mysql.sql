-- ==============================================================================
-- GoalForge MySQL 8.0 Database Schema
-- Database: goal_platform
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `goal_platform` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `goal_platform`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) DEFAULT '🚀',
    `theme_preference` VARCHAR(20) DEFAULT 'system',
    `notify_task_due` BOOLEAN DEFAULT TRUE,
    `notify_goal_completed` BOOLEAN DEFAULT TRUE,
    `notify_streak` BOOLEAN DEFAULT TRUE,
    `notify_weekly_digest` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Goals Table
CREATE TABLE IF NOT EXISTS `goals` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(2000),
    `category` VARCHAR(50) NOT NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
    `progress` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    `start_date` DATE,
    `target_date` DATE,
    `user_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_goals_user_id` (`user_id`),
    INDEX `idx_goals_category` (`category`),
    INDEX `idx_goals_status` (`status`),
    INDEX `idx_goals_priority` (`priority`),
    INDEX `idx_goals_target_date` (`target_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Goal Phases Table
CREATE TABLE IF NOT EXISTS `goal_phases` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `goal_id` BIGINT NOT NULL,
    `phase_name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000),
    `phase_order` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    `progress_percentage` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `fk_phases_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`id`) ON DELETE CASCADE,
    INDEX `idx_phases_goal_id` (`goal_id`),
    INDEX `idx_phases_order` (`goal_id`, `phase_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `phase_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(2000),
    `due_date` DATE,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `fk_tasks_phase` FOREIGN KEY (`phase_id`) REFERENCES `goal_phases` (`id`) ON DELETE CASCADE,
    INDEX `idx_tasks_phase_id` (`phase_id`),
    INDEX `idx_tasks_status` (`status`),
    INDEX `idx_tasks_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Daily Progress Table
CREATE TABLE IF NOT EXISTS `daily_progress` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `goal_id` BIGINT NULL,
    `progress_date` DATE NOT NULL,
    `progress_percentage` INT NOT NULL DEFAULT 0,
    `notes` VARCHAR(2000),
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `fk_daily_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_daily_progress_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`id`) ON DELETE CASCADE,
    INDEX `idx_daily_progress_user` (`user_id`),
    INDEX `idx_daily_progress_date` (`progress_date`),
    INDEX `idx_daily_progress_user_date` (`user_id`, `progress_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Achievements Table
CREATE TABLE IF NOT EXISTS `achievements` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000),
    `achievement_type` VARCHAR(255) NOT NULL,
    `unlocked_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_achievements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `uk_user_achievement` UNIQUE (`user_id`, `achievement_type`),
    INDEX `idx_achievements_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_user_unread` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
