    -- init.sql
    CREATE DATABASE IF NOT EXISTS user_db;
    USE user_db;

    CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY,
        line_id VARCHAR(255) NOT NULL
    );