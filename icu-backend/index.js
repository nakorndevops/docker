// index.js
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

const app = express();
const port = process.env.PORT || 3009; // Use a default port

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON bodies

// --- HTTPS Options ---
const __dirname = path.resolve(path.dirname(""));
const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/icu-backend.key")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/icu-backend.crt")),
};

app.post("/", async (request, response) => {
  const replyMessage = {
    type: "text",
    text: "Hello World!", 
  };
  response.json(replyMessage);
});

// --- Create and Start Server ---
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`🚀 HTTPS Server listening on PORT: ${port}`);
});