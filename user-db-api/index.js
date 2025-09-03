import mysql from "mysql2/promise";

import * as fs from "fs";

const port = process.env.PORT;
const mysql_host = process.env.MYSQL_HOST;
const mysql_user = process.env.MYSQL_USER;
const mysql_password = process.env.MYSQL_PASSWORD;
const mysql_database = process.env.MYSQL_DATABASE;

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
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

// SHOW DB
app.post("/", async (request, response) => {
  try {
    const myQuery = `SHOW TABLES`;
    const [result, fields] = await pool.query(myQuery);
    response.send(result);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error executing query");
  }
});

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});