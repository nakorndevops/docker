// index.js
import fs from "fs";
import https from "https";
import path from "path";
import express from "express";

// --- Custom Module Imports ---
import { env } from "./config/env.js"; // Validates and loads envs
import { client, lineConfig } from "./config/line.js"; // Imports LINE client
import { createEventHandler } from "./module/eventHandler.js"; // Imports logic factory
import { createChatbotRouter } from "./routes/chatbot.js"; // Imports router factory

// --- App & Server Setup ---
const app = express();

// --- HTTPS Server Options ---
const __dirname = path.resolve(path.dirname(""));
const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/line-webhook-server.key")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/line-webhook-server.crt")),
};

// --- ✨ Dependency Injection ✨ ---
// 1. Create the event handler, passing in all its dependencies
const handleEvent = createEventHandler({
  client: client,
  logicServerUrl: env.logicServerUrl,
  logicServerApiKey: env.logicServerApiKey,
  userdbApiUrl: env.userdbApiUrl,
  userdbApiKey: env.userDbApiKey,
  hosxpApiUrl: env.hosxpApiUrl,
  hosxpApiKey: env.hosxpApiKey,
});

// 2. Create the router, passing in the handler it needs
const chatbotRouter = createChatbotRouter(handleEvent, lineConfig);

// --- Mount Routes ---
app.use("/", chatbotRouter); // Mount the chatbot routes

// --- Server Start ---
const server = https.createServer(options, app);
server.listen(env.port, () => {
  console.log(`✅ App listening on HTTPS PORT: ${env.port}`);
});