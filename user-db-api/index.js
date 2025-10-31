// index.js
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import apiRoutes from "./routes/api.js"; // Import all your API routes

// --- Setup ---
const app = express();
const port = process.env.PORT || 3002; // Use a default port

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON bodies

// --- HTTPS Options ---
const __dirname = path.resolve(path.dirname(""));
const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/user-db-api.key")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/user-db-api.crt")),
};

// --- Mount Routes ---
// All routes from routes/api.js will be available from the root path
app.use("/", apiRoutes);

// --- Create and Start Server ---
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`🚀 HTTPS Server listening on PORT: ${port}`);
});