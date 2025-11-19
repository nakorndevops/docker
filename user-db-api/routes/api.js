// routes/api.js
import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";
import { checkExist } from "../utils/dbHelpers.js"; // Note the new path

const router = express.Router();

// --- Configuration ---
// Read the limit from .env, parse it to an integer, or default to 2
const deviceLimit = parseInt(process.env.DEVICE_LIMIT);

// Check User Exist
router.post("/checkUserExist", verifyToken, async (request, response) => {
  const { LineUserId } = request.body;
  if (!LineUserId) {
    return response.status(400).json({ error: "LineUserId is required" });
  }

  try {
    const userFound = await checkExist(pool, 'user', 'LineUserId', LineUserId);
    response.status(200).json(userFound); // Responds with true or false
  } catch (error) {
    console.error("Critical error in /checkUserExist:", error.message);
    response.status(500).json({ error: "An internal server error occurred." });
  }
});

// Unlink User
router.post("/unlink", verifyToken, async (request, response) => {
  const { LineUserId } = request.body;
  if (!LineUserId) {
    return response.status(400).json({ error: "LineUserId is required" });
  }

  try {
    const myQuery = `DELETE FROM user WHERE LineUserId = ?;`;
    const [result] = await pool.query(myQuery, [LineUserId]);
    console.log("Unlink success");
    response.status(200).json({unlinkResult: "Your Line account was unlinked from service"});
  } catch (err) {
    console.error("Query Error [/unlink]:", err.message);
    response.status(500).json({ error: "Error executing query" });
  }
});

// Create User
router.post("/createUser", verifyToken, async (request, response) => {
  const { license_id, LineUserId } = request.body;

  if (!license_id || !LineUserId) {
    return response.status(400).json({ error: "Incomplete request parameters: license_id and LineUserId are required." });
  }

  try {
    const myQuery = `INSERT INTO user (license_id, LineUserId) VALUES (?, ?);`;
    await pool.query(myQuery, [license_id, LineUserId]);
    response.status(200).json({ success: true, message: "User created successfully." });
  } catch (err) {
    console.error("Query Error [/createUser]:", err.message);
    // Handle specific errors, e.g., duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ error: "User already exists." });
    }
    response.status(500).json({ error: "Error creating user." });
  }
});

// Get license_id from LineUserID
router.post("/getUser", verifyToken, async (request, response) => {
  const { LineUserId } = request.body;

  if (!LineUserId) {
    return response.status(400).json({ error: "LineUserId is required." });
  }

  try {
    const myQuery = `SELECT license_id, LineUserId FROM user WHERE LineUserId = ?;`;
    const [result] = await pool.query(myQuery, [LineUserId]);

    // Send the first matching object, or null if not found
    if (result.length > 0) {
      response.status(200).json(result[0]); // e.g., { license_id: "12345" }
    } else {
      response.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    console.error("Query Error [/getLicenseIdFromLineUserID]:", err.message);
    response.status(500).json({ error: "Error retrieving license_id." });
  }
});

// Current Registered Device
router.post("/deviceStatus", verifyToken, async (request, response) => {
    const { license_id } = request.body;
    const myQuery = `SELECT COUNT(LineUserId) AS deviceUsed FROM user WHERE license_id = ?;`
    const [result] = await pool.query(myQuery, [license_id]);
    const deviceUsed = result[0].deviceUsed;
    response.status(200).json( {deviceUsed: deviceUsed, deviceLimit: deviceLimit} );
});

export default router;