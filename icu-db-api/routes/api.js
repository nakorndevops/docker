// routes/api.js
import express from "express";
import pool from "../config/db.js"; // Import the database pool
import { verifyToken } from "../middleware/auth.js"; // Import the auth middleware

const router = express.Router();

router.post("/icuBedRisk", verifyToken, async (request, response) => {
  try {
    const myQuery = `SELECT * FROM ward_occupancy;`;
    const [result] = await pool.query(myQuery);
    response.json(result);
  } catch (err) {
    console.error("Query Error [/]:", err.message);
    response.status(500).json({ error: "Error executing query" });
  }
});

router.post("/icuBedRiskUpdate", verifyToken, async (request, response) => {
  const { ward_code, high_risk, medium_risk, low_risk } = request.body;
  try {
    const myQuery = `
      UPDATE ward_occupancy
      SET high_risk = ?, medium_risk = ?, low_risk = ?
      WHERE ward_code = ?;
    `;
    const [result] = await pool.query(myQuery, [high_risk, medium_risk, low_risk, ward_code]);
    response.status(200).json({ success: true, message: "ICU status update successfully." });
  } catch (err) {
    console.error("Query Error [/]:", err.message);
    response.status(500).json({ error: "Error executing query" });
  }
});

export default router;