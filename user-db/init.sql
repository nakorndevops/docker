-- init.sql
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE user_db;
CREATE TABLE IF NOT EXISTS user (
    line_id VARCHAR(33) PRIMARY KEY,
    code VARCHAR(15) NOT NULL
);