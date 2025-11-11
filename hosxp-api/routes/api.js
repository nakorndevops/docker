// routes/api.js
import express from "express";
import pool from "../config/db.js"; // Import the database pool
import { verifyToken } from "../middleware/auth.js"; // Import the auth middleware

const router = express.Router();

// หาคนไข้ตาม ward
router.post("/ward", verifyToken, async (request, response) => {
  try {
    const { license_id } = request.body; // Using object destructuring
    if (!license_id) {
      return response.status(400).send("License number is required");
    }

    // NOTE: You could now also use `request.user.license` if the license
    // is part of your JWT payload, passed from the middleware.

    const licenseno = "_" + license_id;
    const myQuery = `
      SELECT
          w.name AS ward_name     
      FROM
          an_stat AS ast
      INNER JOIN
          doctor AS d ON ast.dx_doctor = d.code 
      INNER JOIN
          ward AS w ON ast.ward = w.ward
      WHERE
          d.licenseno LIKE ?
          AND d.position_id = 1
          AND ast.dchdate IS NULL 
      GROUP BY ward_name       
    `;

    const [result] = await pool.query(myQuery, [licenseno]);
    const count = result.length;
    if (!count) {
      response.send("No patient founded");
    } else {
      const namesArray = result.map(item => item.ward_name);
      const resultString = namesArray.join('\n\n');
      response.json(resultString); 
    }
  } catch (err) {
    console.error("Query Error [/ward]:", err.message);
    response.status(500).send("Error executing query");
  }
});

// Check Active User
router.post("/checkActiveUser", verifyToken, async (request, response) => {
  try {
    const { license_id } = request.body;
    if (!license_id) {
      return response.status(400).send("License number is required");
    }

    const licenseno = "_" + license_id;
    const myQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM doctor
        WHERE
          licenseno LIKE ?
          AND active = 'Y'
      ) AS is_active_user;   
    `;

    const [result] = await pool.query(myQuery, [licenseno]);
    // Send the boolean value (0 or 1) directly
    response.json(result[0].is_active_user);
  } catch (err) {
    console.error("Query Error [/checkActiveUser]:", err.message);
    response.status(500).send("Error executing query");
  }
});

export default router;