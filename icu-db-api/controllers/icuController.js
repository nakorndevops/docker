/**
 * @file controllers/icuController.js
 * @description Controller for ICU Database operations.
 */

import pool from "../config/db.js";

/**
 * Retrieves the current risk levels for all wards.
 * POST /icuBedRisk
 */
export const getWardRiskLevels = async (req, res) => {
  try {
    const query = `SELECT * FROM ward_occupancy;`;
    const [rows] = await pool.query(query);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error(`[GetWardRisk] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Updates the risk levels for a specific ward.
 * POST /icuBedRiskUpdate
 */
export const updateWardRiskLevel = async (req, res) => {
  // Destructure with default naming mapping
  const { 
    ward_code: wardCode, 
    high_risk: highRisk, 
    medium_risk: mediumRisk, 
    low_risk: lowRisk 
  } = req.body;

  // Validate inputs
  if (!wardCode) {
    return res.status(400).json({ error: "Missing required parameter: ward_code" });
  }

  try {
    const query = `
      UPDATE ward_occupancy
      SET high_risk = ?, medium_risk = ?, low_risk = ?
      WHERE ward_code = ?;
    `;
    
    const [result] = await pool.query(query, [highRisk, mediumRisk, lowRisk, wardCode]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ward not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "ICU status updated successfully." 
    });
  } catch (err) {
    console.error(`[UpdateWardRisk] Error: ${err.message}`);
    res.status(500).json({ error: "Database update failed" });
  }
};