// config/db.js
import mysql from "mysql2/promise";

// Create the connection pool.
// Node.js automatically reads variables from 'process.env'.
// These must be set in your environment before running the app.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "tis620_thai_ci",
});

// Optional: Test the connection when the module loads
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release();
  } catch (err) {
    // Check for common missing variable errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Error connecting to the database:", err.message);
      console.warn("Please ensure MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE are set correctly in your environment.");
    } else {
      console.error("Error connecting to the database:", err.message);
    }
  }
})();

export default pool;