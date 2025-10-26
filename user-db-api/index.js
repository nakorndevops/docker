import { checkExist } from './module/checkExist.js';

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
  key: fs.readFileSync("./cert/user-db-api.key"),
  cert: fs.readFileSync("./cert/user-db-api.crt"),
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
  charset: "utf8mb4_unicode_ci", // Set the character set here
});

// --- JWT Verification Middleware ---
const publicKey = fs.readFileSync('./public-key/user-db-api-public-key.pem', 'utf8');
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
    //request.apiKeyPayload = verified;
    console.log(`[${clientIp}] [${verified.user}] [${verified.organization}] [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    next(); // Pass control to the next handler
  } catch (err) {
    console.log(`[${clientIp}] - - [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    response.status(403).send("Access Denied: Invalid token");
  }
};

// SHOW DB
app.post("/", verifyToken, async (request, response) => {
  try {
    const myQuery = `DESCRIBE user;`;
    const [result, fields] = await pool.query(myQuery);
    response.send(result);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error executing query");
  }
});

// Check User Exist
app.post("/checkUserExist", verifyToken, async (request, response) => {
  const LineUserId = request.body.LineUserId;
  // Check if LineUserId was provided
  if (!LineUserId) {
    return response.status(400).json({ error: "LineUserId is required" });
  }
  // Check does user exist
  try {
    // Use the imported function
    const userFound = await checkExist(pool, 'user', 'LineUserId', LineUserId);
    response.json(userFound);
  } catch (error) {
    console.error("Critical error in application logic:", error.message);
    response.status(500).json({ error: "An internal server error occurred." });
  }
});

// List User
app.post("/listUser", verifyToken, async (request, response) => {
  try {
    const myQuery = `SELECT * FROM user;`;
    const [result, fields] = await pool.query(myQuery);
    response.send(result);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error executing query");
  }
});

// Create User
app.post("/createUser", verifyToken, async (request, response) => {
  console.log(request.body);
  const license_id = request.body.license_id;
  const LineUserId = request.body.LineUserId;

  if (!license_id || !LineUserId) {
    return response.status(400).json({ error: "Incomplete request parameter !" });
  }

  try {
    const myQuery = `
      INSERT INTO user (license_id, LineUserId)
      VALUES (?, ?);
    `;
    const [result, fields] = await pool.query(myQuery, [license_id, LineUserId]);
    response.status(201).send(true);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error cannot create user !");
  }
});

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});