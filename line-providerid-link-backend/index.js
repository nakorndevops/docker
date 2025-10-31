// index.js
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Custom Module Imports ---
import { env } from "./config/env.js"; // Validates and loads envs
import { createLinkAccountHandler } from "./controllers/linkAccountController.js";
import { createLinkAccountRouter } from "./routes/linkAccount.js";

// --- Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// --- Path Setup (for ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HTTPS Server Options ---
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "line-providerid-link-backend.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "line-providerid-link-backend.crt")),
};

// --- ✨ Dependency Injection (Wiring) ✨ ---

// 1. Create the handler, passing in the config it needs
const linkAccountHandler = createLinkAccountHandler(env);

// 2. Create the router, passing in the handler it uses
const linkAccountRouter = createLinkAccountRouter(linkAccountHandler);

// 3. Mount the router to the app
app.use("/", linkAccountRouter);

// --- Server Start ---
const server = https.createServer(options, app);
server.listen(env.port, () => {
  console.log(`🚀 HTTPS Server listening on PORT: ${env.port}`);
});