-- 1. Create Database
CREATE DATABASE IF NOT EXISTS or_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE or_db;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS patient_operation_status_monitor (
    operation_id INT UNSIGNED NOT NULL, 
    hn VARCHAR(9) NOT NULL,
    patient_fname VARCHAR(100),
    patient_lname VARCHAR(100),
    patient_status INT UNSIGNED NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (operation_id)
);

-- 3. Enable Event Scheduler (Required for the auto-delete to work)
SET GLOBAL event_scheduler = ON;

-- 4. Create the Cleanup Event
-- This runs every hour to clean up rows older than 2 hours
CREATE EVENT IF NOT EXISTS cleanup_discharged_patients
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM patient_operation_status_monitor
  WHERE last_updated < (NOW() - INTERVAL 2 HOUR)
  AND patient_status IN (4, 5, 6);