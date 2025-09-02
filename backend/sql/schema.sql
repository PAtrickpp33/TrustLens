-- MySQL 8.0+ DDL aligned with Alibaba Database Manual
-- Conventions:
-- - Lowercase, underscores for names
-- - `id` BIGINT UNSIGNED primary key auto increment
-- - `gmt_create`, `gmt_modified` DATETIME columns
-- - `is_deleted` TINYINT UNSIGNED soft delete flag
-- - InnoDB + utf8mb4

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `trustlens`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `trustlens`;

-- Table: risk_mobile
DROP TABLE IF EXISTS `risk_mobile`;
CREATE TABLE `risk_mobile` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `country_code` VARCHAR(8) NOT NULL COMMENT 'E.164 country code, e.g., +1, +86',
  `national_number` VARCHAR(32) NOT NULL COMMENT 'National significant number without country code',
  `e164` VARCHAR(32) NOT NULL COMMENT 'E.164 formatted phone number',
  `risk_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-unknown,1-low,2-medium,3-high',
  `source` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Data source, e.g., user_report, blocklist, partner',
  `report_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of reports',
  `last_reported_at` DATETIME NULL DEFAULT NULL COMMENT 'Last report time',
  `notes` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Optional notes',
  `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0-no,1-yes',
  `gmt_create` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `gmt_modified` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_e164` (`e164`),
  KEY `idx_country_national` (`country_code`, `national_number`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phone risk registry';

-- Table: risk_email
DROP TABLE IF EXISTS `risk_email`;
CREATE TABLE `risk_email` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `local_part` VARCHAR(128) NOT NULL COMMENT 'Local part before @',
  `domain` VARCHAR(255) NOT NULL COMMENT 'Domain part after @, lowercased',
  `address` VARCHAR(320) NOT NULL COMMENT 'Full email address, lowercased',
  `risk_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-unknown,1-low,2-medium,3-high',
  `mx_valid` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'MX validity flag (0/1)',
  `disposable` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Disposable provider flag (0/1)',
  `source` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Data source',
  `report_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of reports',
  `last_reported_at` DATETIME NULL DEFAULT NULL COMMENT 'Last report time',
  `notes` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Optional notes',
  `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0-no,1-yes',
  `gmt_create` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `gmt_modified` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_address` (`address`),
  KEY `idx_domain` (`domain`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Email risk registry';

-- Table: risk_url
DROP TABLE IF EXISTS `risk_url`;
CREATE TABLE `risk_url` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `scheme` VARCHAR(16) NOT NULL COMMENT 'URL scheme',
  `host` VARCHAR(255) NOT NULL COMMENT 'Hostname (lowercased)',
  `registrable_domain` VARCHAR(255) NULL DEFAULT NULL COMMENT 'eTLD+1 extracted by PSL',
  `full_url` VARCHAR(2048) NOT NULL COMMENT 'Full URL (normalized)',
  `url_sha256` CHAR(64) NOT NULL COMMENT 'SHA-256 of normalized URL',
  `risk_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-unknown,1-low,2-medium,3-high',
  `phishing_flag` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Heuristic phishing flag (0/1)',
  `source` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Data source',
  `report_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of reports',
  `last_reported_at` DATETIME NULL DEFAULT NULL COMMENT 'Last report time',
  `notes` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Optional notes',
  `is_deleted` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0-no,1-yes',
  `gmt_create` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `gmt_modified` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_url_sha256` (`url_sha256`),
  KEY `idx_host` (`host`),
  KEY `idx_registrable_domain` (`registrable_domain`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='URL risk registry';

-- Table: articles
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `slug` VARCHAR(160) NOT NULL COMMENT 'URL-safe unique slug',
  `title` VARCHAR(200) NOT NULL COMMENT 'Article title',
  `summary` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Short summary',
  `content_md` MEDIUMTEXT NOT NULL COMMENT 'Markdown content',
  `is_published` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0-draft,1-published',
  `gmt_create` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  `gmt_modified` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Articles/News in Markdown';