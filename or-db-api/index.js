/**
 * @file index.js
 * @description Entry point for the OR DB API Service.
 */

import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Modules ---
import { env } from "./config/env.js";
import apiRoutes from "./routes/api.js";

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App Initialization ---
const app = express();
app.use(express.json());

// --- Routes ---
app.use("/", apiRoutes);

// --- SSL Configuration ---
const loadSSL = () => {
  try {
    const certDir = path.join(__dirname, "cert");
    return {
      key: fs.readFileSync(path.join(certDir, "or-db-api.key")),
      cert: fs.readFileSync(path.join(certDir, "or-db-api.crt")),
    };
  } catch (err) {
    console.error("❌ [FATAL] Could not load SSL certificates:", err.message);
    process.exit(1);
  }
};

// --- Server Start ---
try {
  const sslOptions = loadSSL();
  const server = https.createServer(sslOptions, app);

  server.listen(env.port, () => {
    console.log("=========================================");
    console.log(`🚀 OR DB API Service Started`);
    console.log(`👉 HTTPS Server listening on PORT: ${env.port}`);
    console.log(`👉 Connected to Database Host: ${env.dbHost}`);
    console.log("=========================================");
  });
} catch (err) {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
}