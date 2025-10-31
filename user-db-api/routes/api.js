// routes/api.js
import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";
import { checkExist } from "../utils/dbHelpers.js"; // Note the new path

const router = express.Router();

// SHOW DB (Example: DESCRIBE user)
router.post("/", verifyToken, async (request, response) => {
  try {
    const myQuery = `DESCRIBE user;`;
    const [result] = await pool.query(myQuery);
    response.json(result);
  } catch (err) {
    console.error("Query Error [/]:", err.message);
    response.status(500).json({ error: "Error executing query" });
  }
});

// Check User Exist
router.post("/checkUserExist", verifyToken, async (request, response) => {
  const { LineUserId } = request.body;
  if (!LineUserId) {
    return response.status(400).json({ error: "LineUserId is required" });
  }

  try {
    const userFound = await checkExist(pool, 'user', 'LineUserId', LineUserId);
    response.json(userFound); // Responds with true or false
  } catch (error) {
    console.error("Critical error in /checkUserExist:", error.message);
    response.status(500).json({ error: "An internal server error occurred." });
  }
});

// List User
router.post("/listUser", verifyToken, async (request, response) => {
  try {
    const myQuery = `SELECT * FROM user;`;
    const [result] = await pool.query(myQuery);
    response.json(result);
  } catch (err) {
    console.error("Query Error [/listUser]:", err.message);
    response.status(500).json({ error: "Error executing query" });
  }
});

// Create User
router.post("/createUser", verifyToken, async (request, response) => {
  const { license_id, LineUserId } = request.body;
  console.log(request.body);

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

export default router;