-- init.sql
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE user_db;
CREATE TABLE IF NOT EXISTS user (
    LineUserId VARCHAR(33) PRIMARY KEY,
    license_id VARCHAR(50) NOT NULL
);