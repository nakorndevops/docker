-- init.sql
CREATE DATABASE IF NOT EXISTS icu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE icu_db;

CREATE TABLE IF NOT EXISTS ward_occupancy (
    ward_code VARCHAR(10) NOT NULL, 
    high_risk INT UNSIGNED NOT NULL DEFAULT 0,
    medium_risk INT UNSIGNED NOT NULL DEFAULT 0,
    low_risk INT UNSIGNED NOT NULL DEFAULT 0,
    
    PRIMARY KEY (ward_code)
);

INSERT IGNORE INTO ward_occupancy (ward_code) VALUES ('10'), ('17'), ('22'), ('24'), ('41'), ('53'), ('55');