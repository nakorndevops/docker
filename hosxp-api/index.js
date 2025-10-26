import mysql from "mysql2/promise";

import jwt from "jsonwebtoken";

import * as fs from "fs";

const port = process.env.PORT;
const mysql_host = process.env.MYSQL_HOST;
const mysql_user = process.env.MYSQL_USER;
const mysql_password = process.env.MYSQL_PASSWORD;
const mysql_database = process.env.MYSQL_DATABASE;

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync('./cert/hosxp-api.key'),
  cert: fs.readFileSync('./cert/hosxp-api.crt'),
};
const server = https.createServer(options, app);

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: mysql_host,
  user: mysql_user,
  database: mysql_database,
  password: mysql_password,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "tis620_thai_ci", // Set the character set here
});

// --- JWT Verification Middleware ---
const publicKey = fs.readFileSync('./public-key/hosxp-api-public-key.pem', 'utf8');
const verifyToken = (request, response, next) => {

  // logs
  const clientIp = request.connection.remoteAddress; // Get client IP
  const requestTimestamp = Date.now(); // Get timestamp in milliseconds
  const readableTimestamp = new Date(requestTimestamp).toString(); // Convert to ISO string for readability
  const requestMethod = request.method;
  const requestPath = request.path;
  const requestProtocol = request.protocol;
  const userAgent = request.headers['user-agent'];

  const authHeader = request.headers['authorization'];
  // The token is expected to be in the format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return response.status(401).send("Access Denied: No token provided");
  }

  try {
    const verified = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    // You can attach the verified payload to the request if you need it in your route handler
    console.log(`[${clientIp}] [${verified.user}] [${verified.organization}] [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    next(); // Pass control to the next handler
  } catch (err) {
    console.log(`[${clientIp}] - - [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    response.status(403).send("Access Denied: Invalid token");
  }
};

// หาคนไข้ตาม ward
app.post("/ward", verifyToken, async (request, response) => {
  try {
    const license = request.body.license;
    if (!license) {
      return response.status(400).send("License number is required");
    }
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
            d.licenseno  = ?
            AND ast.dchdate IS NULL 
        GROUP BY ward_name      
      `;

    const [result, fields] = await pool.query(myQuery, [license]);
    response.send(result);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error executing query");
  }
});

// Check Active User
app.post("/checkActiveUser", verifyToken, async (request, response) => {
  try {
    const license = request.body.license_id;
    if (!license) {
      return response.status(400).send("License number is required");
    }
    const licenseno = "_" + license;
    const myQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM doctor
        WHERE
          licenseno LIKE ?
          AND active = 'Y'
      ) AS is_active_user;   
      `;
    const [result, fields] = await pool.query(myQuery, [licenseno]);
    response.send(result[0].is_active_user);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error executing query");
  }
});

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});