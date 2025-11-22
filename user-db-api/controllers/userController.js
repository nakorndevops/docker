/**
 * @file controllers/userController.js
 * @description Controller for handling User DB operations.
 */

import pool from "../config/db.js";
import { env } from "../config/env.js";

/**
 * Removes a user link (Unlink).
 * DELETE /unlink
 */
export const unlinkUser = async (req, res) => {
  const { LineUserId: lineUserId } = req.body;

  if (!lineUserId) {
    return res.status(400).json({ error: "Missing required parameter: LineUserId" });
  }

  try {
    const query = `DELETE FROM user WHERE LineUserId = ?;`;
    const [result] = await pool.query(query, [lineUserId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found to unlink." });
    }

    console.log(`User unlinked: ${lineUserId}`);
    res.status(200).json({ message: "Line account unlinked successfully." });
  } catch (err) {
    console.error(`[Unlink] Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Creates a new user mapping.
 * POST /createUser
 */
export const createUser = async (req, res) => {
  // Destructure and rename for internal consistency
  const { license_id: licenseId, LineUserId: lineUserId } = req.body;

  if (!licenseId || !lineUserId) {
    return res.status(400).json({ 
      error: "Missing required parameters: license_id and LineUserId." 
    });
  }

  try {
    const query = `INSERT INTO user (license_id, LineUserId) VALUES (?, ?);`;
    await pool.query(query, [licenseId, lineUserId]);
    
    res.status(200).json({ success: true, message: "User created successfully." });
  } catch (err) {
    // Handle Duplicate Entry
    if (err.code === 'ER_DUP_ENTRY') {
      console.warn(`[CreateUser] Duplicate entry for ${lineUserId}`);
      return res.status(409).json({ error: "User already exists." });
    }
    
    console.error(`[CreateUser] Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Retrieves user details by Line ID.
 * POST /getUser
 */
export const getUser = async (req, res) => {
  const { LineUserId: lineUserId } = req.body;

  if (!lineUserId) {
    return res.status(400).json({ error: "Missing required parameter: LineUserId" });
  }

  try {
    const query = `SELECT license_id, LineUserId FROM user WHERE LineUserId = ?;`;
    const [rows] = await pool.query(query, [lineUserId]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    console.error(`[GetUser] Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Checks current device usage for a license.
 * POST /deviceStatus
 */
export const getDeviceStatus = async (req, res) => {
  const { license_id: licenseId } = req.body;

  if (!licenseId) {
    return res.status(400).json({ error: "Missing required parameter: license_id" });
  }

  try {
    const query = `SELECT COUNT(LineUserId) AS deviceUsed FROM user WHERE license_id = ?;`;
    const [rows] = await pool.query(query, [licenseId]);
    
    const deviceUsed = rows[0].deviceUsed;
    
    res.status(200).json({ 
      deviceUsed: deviceUsed, 
      deviceLimit: env.deviceLimit 
    });
  } catch (err) {
    console.error(`[DeviceStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};