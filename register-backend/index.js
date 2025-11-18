import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Custom Module Imports ---
import { env } from "./config/env.js"; // Validates and loads envs
import { createLinkAccountHandler } from "./controllers/linkAccountController.js";
import { createUserFoundHandler } from "./controllers/userController.js"; // 👈 Import new controller
import { createApiRouter } from "./routes/api.js"; // 👈 Import renamed router

// --- Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// --- Path Setup (for ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HTTPS Server Options ---
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "register-backend.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "register-backend.crt")),
};

// --- ✨ Dependency Injection (Wiring) ✨ ---

// 1. Create all handlers, passing in the config they need
const linkAccountHandler = createLinkAccountHandler(env);
const userFoundHandler = createUserFoundHandler(env); // 👈 Create new handler

// 2. Create the main router, passing in all handlers
const apiRouter = createApiRouter({ 
  linkAccountHandler, 
  userFoundHandler 
});

// 3. Mount the main router to the app
app.use("/", apiRouter);

// --- Server Start ---
const server = https.createServer(options, app);
server.listen(env.port, () => {
  console.log(`🚀 HTTPS Server listening on PORT: ${env.port}`);
});
