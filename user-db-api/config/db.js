// config/db.js
import mysql from "mysql2/promise";

// Create the connection pool.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4_unicode_ci", // As per your original file
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
    console.warn("Please ensure MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE are set correctly.");
  }
})();

export default pool;