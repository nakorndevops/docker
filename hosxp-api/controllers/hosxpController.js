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
        i.ward IN (10, 17, 22, 24, 41, 53, 55)
        AND i.dchdate IS NULL
      GROUP BY
        w.NAME
      ORDER BY
        available_beds;
    `;

    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(`[GetIcuBedStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Retrieves VIP Bed statistics for specific wards.
 * POST /vipBedStatus
 */
export const getVipBedStatus = async (req, res) => {
  try {
    const query = `
      SELECT
        ward,
        occupied_beds,
        total_capacity,
        (total_capacity - occupied_beds) AS available_beds
      FROM
        (
          SELECT
            CASE
              WHEN b.bedno BETWEEN 2301 AND 2305 THEN 'พิเศษ ศัลยกรรมชาย'
              WHEN b.bedno BETWEEN 4201 AND 4207 THEN 'พิเศษ ศัลยกรรมกระดูก'
              WHEN b.bedno BETWEEN 4301 AND 4307 THEN 'พิเศษ ศัลยกรรมหญิง'
              WHEN b.bedno BETWEEN 4401 AND 4407 THEN 'พิเศษ นรีเวช'
              WHEN b.bedno BETWEEN 7401 AND 7415 THEN 'พิเศษ ER 4'
              WHEN b.bedno BETWEEN 3201 AND 3212 THEN 'พิเศษ 298 2'
              WHEN b.bedno BETWEEN 3301 AND 3312 THEN 'พิเศษ 298 3'
              WHEN b.bedno BETWEEN 3401 AND 3412 THEN 'พิเศษ 298 4'
              WHEN b.bedno BETWEEN 3501 AND 3512 THEN 'พิเศษ 298 5'
              WHEN b.bedno BETWEEN 3601 AND 3612 THEN 'พิเศษ 298 6'
              WHEN b.bedno BETWEEN 3701 AND 3712 THEN 'พิเศษ 298 7'
              ELSE 'Other'
            END AS ward,
            COUNT(DISTINCT b.bedno) AS occupied_beds,
            CASE
              WHEN b.bedno BETWEEN 2301 AND 2305 THEN 5
              WHEN b.bedno BETWEEN 4201 AND 4207 THEN 7
              WHEN b.bedno BETWEEN 4301 AND 4307 THEN 7
              WHEN b.bedno BETWEEN 4401 AND 4407 THEN 7
              WHEN b.bedno BETWEEN 7401 AND 7415 THEN 15
              WHEN b.bedno BETWEEN 3201 AND 3212 THEN 12
              WHEN b.bedno BETWEEN 3301 AND 3312 THEN 12
              WHEN b.bedno BETWEEN 3401 AND 3412 THEN 12
              WHEN b.bedno BETWEEN 3501 AND 3512 THEN 12
              WHEN b.bedno BETWEEN 3601 AND 3612 THEN 12
              WHEN b.bedno BETWEEN 3701 AND 3712 THEN 12
              ELSE 0
            END AS total_capacity
          FROM
            ipt AS i
            INNER JOIN iptadm AS b ON i.an = b.an
          WHERE
            i.dchdate IS NULL
            AND (
              b.bedno BETWEEN 2301 AND 2305
              OR b.bedno BETWEEN 4201 AND 4207
              OR b.bedno BETWEEN 4301 AND 4307
              OR b.bedno BETWEEN 4401 AND 4407
              OR b.bedno BETWEEN 7401 AND 7415
              OR b.bedno BETWEEN 3201 AND 3212
              OR b.bedno BETWEEN 3301 AND 3312
              OR b.bedno BETWEEN 3401 AND 3412
              OR b.bedno BETWEEN 3501 AND 3512
              OR b.bedno BETWEEN 3601 AND 3612
              OR b.bedno BETWEEN 3701 AND 3712
            )
          GROUP BY
            ward,
            total_capacity
        ) AS bed_summary;
    `;

    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(`[GetIcuBedStatus] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};

/**
 * Retrieves a list of wards where the doctor has patients.
 * POST /ward
 */
export const getPatientOperationData = async (req, res) => {
  const { hn: hn } = req.body;

  if (!hn) {
    return res.status(400).json({ error: "Missing required parameter: hn" });
  }

  try {
    const query = `
      SELECT
        CONCAT(DATE_FORMAT(ol.request_operation_date, '%d/%m/'), DATE_FORMAT(ol.request_operation_date, '%Y') + 543) AS operation_date,
        ol.operation_id AS operation_ids,
        ol.patient_department AS department,
        ol.hn,
        w.NAME AS ward,
        ol.an,
        p.pname,
        p.fname,
        p.lname,
        (SELECT image FROM patient_image WHERE hn = ol.hn LIMIT 1) AS image,
        ol.age_text AS age,
        GROUP_CONCAT(DISTINCT oicd.NAME SEPARATOR ', ') AS diagnosis,
        ol.operation_name AS operation,
        CONCAT(
          TRIM(SUBSTRING_INDEX(d.NAME, ',', - 1)),
          TRIM(SUBSTRING_INDEX(d.NAME, ',', 1))
        ) AS doctor,
        oroom.room_name AS room,
        ol.room_id AS room_id
      FROM
        operation_list ol
        LEFT JOIN doctor d ON ol.request_doctor = d.
        CODE LEFT JOIN patient p ON ol.hn = p.hn
        LEFT JOIN operation_room oroom ON ol.room_id = oroom.room_id
        LEFT JOIN ipt i ON ol.an = i.an
        LEFT JOIN ward w ON i.ward = w.ward
        -- 5. Diagnosis Join with Filter
        LEFT JOIN operation_diagnosis od ON ol.operation_id = od.operation_id
        AND od.diagnosis_type_id = 1
        LEFT JOIN operation_icd_10 oicd ON od.operation_icd10_id = oicd.id
      WHERE
        ol.hn = ?
        -- 6. IPD Discharge Logic
        AND (ol.patient_department != 'IPD' OR i.dchdate IS NULL)
      GROUP BY
        ol.operation_id
      ORDER BY
        ol.operation_id DESC
        LIMIT 1;
    `;

    let [rows] = await pool.query(query, [hn]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No patients found" });
    }

    if (rows.length > 0) {
      const imageDataBuffer = rows[0].image;

      if (imageDataBuffer) {
        const base64Image = Buffer.from(imageDataBuffer).toString('base64');
        const imageSrc = `data:image/jpeg;base64,${base64Image}`;
        rows[0].image = imageSrc;
      }

      res.status(200).json(rows);

    }

  } catch (err) {
    console.error(`[getPatientOperationData] Error: ${err.message}`);
    res.status(500).json({ error: "Database query failed" });
  }
};