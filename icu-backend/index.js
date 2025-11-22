/**
 * @file index.js
 * @description Entry point for the ICU Backend Service.
 * Orchestrates Config, Routes, and Server startup.
 */

import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Imports ---
import { config } from "./config/env.js";
import { createApiRouter } from "./routes/api.js";

// --- Constants & Path Setup ---
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json());

// --- SSL Configuration ---
const sslOptions = (() => {
  try {
    const certPath = path.join(__dirname, "cert");
    return {
      key: fs.readFileSync(path.join(certPath, "icu-backend.key")),
      cert: fs.readFileSync(path.join(certPath, "icu-backend.crt")),
    };
  } catch (err) {
    console.error("❌ [FATAL] Could not load SSL certificates:", err.message);
    process.exit(1);
  }
})();

// --- Routing ---
// Inject configuration into the router factory
const apiRouter = createApiRouter(config);
app.use("/", apiRouter);

// --- Server Start ---
const server = https.createServer(sslOptions, app);

server.listen(config.app.port, () => {
  console.log("=========================================");
  console.log(`🚀 ICU Backend Service Started`);
  console.log(`👉 Port: ${config.app.port}`);
  console.log(`👉 Environment: ${config.app.nodeEnv}`);
  console.log("=========================================");
});