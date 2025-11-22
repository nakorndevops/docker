/**
 * @file config/db.js
 * @description Database Connection Pool for HOSxP.
 */

import mysql from "mysql2/promise";
import { env } from "./env.js";

const pool = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Note: TIS-620 is common for older Thai hospital databases
  charset: "tis620_thai_ci", 
});

// Test Connection on Startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to HOSxP Database successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.warn("   Check if the external HOSxP server IP is reachable from this container.");
    }
  }
})();

export default pool;