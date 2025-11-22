/**
 * @file index.js
 * @description Entry point for the Register Backend Service.
 */

import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Imports ---
import { config } from "./config/env.js";
import { createLinkAccountHandler } from "./controllers/linkAccountController.js";
import { createUserFoundHandler } from "./controllers/userController.js";
import { createConfigHandler } from "./controllers/configController.js";
import { createApiRouter } from "./routes/api.js";

// --- Constants & Setup ---
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json());

// --- SSL Configuration ---
// Fail fast if certificates are missing
const sslOptions = (() => {
  try {
    const certPath = path.join(__dirname, "cert");
    return {
      key: fs.readFileSync(path.join(certPath, "register-backend.key")),
      cert: fs.readFileSync(path.join(certPath, "register-backend.crt")),
    };
  } catch (err) {
    console.error("❌ [FATAL] Could not load SSL certificates:", err.message);
    process.exit(1);
  }
})();

// --- Dependency Injection & Wiring ---

// 1. Initialize Controllers with Config
const linkAccountHandler = createLinkAccountHandler(config);
const userFoundHandler = createUserFoundHandler(config);
const configHandler = createConfigHandler(config);

// 2. Initialize Router with Controllers
const apiRouter = createApiRouter({ 
  linkAccountHandler, 
  userFoundHandler,
  configHandler 
});

// 3. Mount Routes
app.use("/", apiRouter);

// --- Server Start ---
const server = https.createServer(sslOptions, app);

server.listen(config.app.port, () => {
  console.log("===============================================");
  console.log(`🚀 Register Backend Service Started`);
  console.log(`👉 Environment: ${config.app.nodeEnv}`);
  console.log(`👉 Port: ${config.app.port}`);
  console.log(`👉 Hospital Code Target: ${config.app.hospitalCode}`);
  console.log("===============================================");
});