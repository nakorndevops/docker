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

export default router;