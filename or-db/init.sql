-- 1. Create Database
CREATE DATABASE IF NOT EXISTS or_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE or_db;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS patient_operation_status_monitor (
    operation_id INT UNSIGNED NOT NULL, 
    hn VARCHAR(20) NOT NULL,              -- Increased length for flexibility
    patient_fname VARCHAR(100),
    patient_lname VARCHAR(100),
    room_id INT UNSIGNED,
    patient_status TINYINT UNSIGNED NOT NULL, -- TINYINT is sufficient for status codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Good for auditing when the row entered
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (operation_id),
    -- INDEXING: Crucial for the Event Scheduler to run quickly without scanning the whole table
    INDEX idx_cleanup (last_updated, patient_status)
);

-- 3. Enable Event Scheduler 
-- NOTE: This often requires SUPER privileges. If this fails, enable it in your server config file (my.cnf)
-- or via your cloud provider's console (e.g., AWS RDS Parameter Group).
SET GLOBAL event_scheduler = ON;

-- 4. Create the Cleanup Event
CREATE EVENT IF NOT EXISTS cleanup_discharged_patients
ON SCHEDULE EVERY 1 HOUR
ON COMPLETION PRESERVE -- Keeps the event definition even if it's disabled temporarily
DO
  DELETE FROM patient_operation_status_monitor
  WHERE 
    -- Logic 1: Remove "Finished/Discharged" patients (Status 4, 5, 6) after 2 hours
    (patient_status IN (4, 5, 6) AND last_updated < (NOW() - INTERVAL 2 HOUR)) 
    -- Logic 2: Safety net - Remove ANY stale data older than 24 hours
    OR last_updated < (NOW() - INTERVAL 12 HOUR);