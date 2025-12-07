/**
 * @file controllers/orController.js
 * @description Controller for Operating Room Database.
 */

import pool from "../config/db.js";

/**
 * Retrieves the current operation status of patient.
 * POST /orPatientStatusMonitor
 */
export const getOrPatientStatus = async (req, res) => {
  try {
    const query = `SELECT * FROM patient_operation_status_monitor;`;
    const [rows] = await pool.query(query);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error(`[GetOrPatientStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Updates status for operating patient.
 * POST /orPatientStatusMonitorUpdate
 */
export const updateOrPatientStatus = async (req, res) => {
  // Destructure with default naming mapping
  const { 
    operation_id: operation_id, 
    hn: hn, 
    patient_fname: patient_fname, 
    patient_lname: patient_lname,
    patient_status: patient_status,
    room_id: room_id,
  } = req.body;

  // Validate inputs
  if (!operation_id) {
    return res.status(400).json({ error: "Missing required parameter: operation_id" });
  }

  try {
    const query = `
      INSERT INTO patient_operation_status_monitor (operation_id, hn, patient_fname, patient_lname, patient_status, room_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        patient_status = ?;
    `;
    
    const [result] = await pool.query(query, [operation_id, hn, patient_fname, patient_lname, patient_status, room_id, patient_status]);

    res.status(200).json({ 
      success: true, 
      message: "Patient status updated successfully." 
    });
  } catch (err) {
    console.error(`[UpdateOrPatientStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Database update failed" });
  }
};