/**
 * @file controllers/hosxpController.js
 * @description Controller for HOSxP Database operations.
 */

import pool from "../config/db.js";

/**
 * Retrieves a list of wards where the doctor has patients.
 * POST /ward
 */
export const getWardList = async (req, res) => {
  const { license_id: licenseId } = req.body;

  if (!licenseId) {
    return res.status(400).json({ error: "Missing required parameter: license_id" });
  }

  // Prepend underscore as per legacy database requirements
  const licenseParam = `_${licenseId}`;

  try {
    const query = `
      SELECT
          w.name AS ward_name     
      FROM
          ipt AS i
      INNER JOIN
          doctor AS d ON i.incharge_doctor = d.code 
      INNER JOIN
          ward AS w ON i.ward = w.ward
      WHERE
          d.licenseno LIKE ?
          AND d.position_id = 1
          AND i.dchdate IS NULL 
      GROUP BY ward_name
    `;

    const [rows] = await pool.query(query, [licenseParam]);

    if (rows.length === 0) {
      return res.status(200).json({ wardList: "No patients found" });
    }

    const wardNames = rows.map((row) => row.ward_name).join("\n\n");
    res.status(200).json({ wardList: wardNames });
  } catch (err) {
    console.error(`[GetWardList] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Checks if a user is active in the doctor table.
 * POST /checkActiveUser
 */
export const checkActiveUser = async (req, res) => {
  const { license_id: licenseId } = req.body;

  if (!licenseId) {
    return res.status(400).json({ error: "Missing required parameter: license_id" });
  }

  const licenseParam = `_${licenseId}`;

  try {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM doctor
        WHERE
          licenseno LIKE ?
          AND active = 'Y'
      ) AS is_active;
    `;

    const [rows] = await pool.query(query, [licenseParam]);
    const isActive = rows[0].is_active === 1;

    if (isActive) {
      res.status(200).json({ status: true });
    } else {
      res.status(403).json({ error: "User is not active", status: false });
    }
  } catch (err) {
    console.error(`[CheckActiveUser] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Retrieves ICU Bed statistics for specific wards.
 * POST /icuBedStatus
 */
export const getIcuBedStatus = async (req, res) => {
  try {
    // Specific Ward IDs hardcoded based on business logic (10, 22, 24, 41, 19)
    const query = `
      SELECT
        w.ward AS ward_code,
        w.shortname AS ward_name,
        w.bedcount AS total_beds,
        COUNT(i.an) AS patient_count,
        (w.bedcount - COUNT(i.an)) AS available_beds
      FROM
        ipt AS i
        INNER JOIN ward AS w ON i.ward = w.ward
      WHERE
        i.ward IN (10, 17, 22, 24, 41)
        AND i.dchdate IS NULL
      GROUP BY
        w.NAME
      ORDER BY
        w.shortname;
    `;

    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(`[GetIcuBedStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};