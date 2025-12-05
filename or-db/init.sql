-- init.sql
CREATE DATABASE IF NOT EXISTS or_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE or_db;

CREATE TABLE IF NOT EXISTS patient_operation_status_monitor (
    operation_id INT UNSIGNED NOT NULL, 
    hn VARCHAR(9),
    patient_fname VARCHAR(100),
    patient_lname VARCHAR(100),
    patient_status VARCHAR(50),
    PRIMARY KEY (operation_id)
);