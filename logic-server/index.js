import jwt from "jsonwebtoken";

import * as fs from "fs";

const port = process.env.PORT;

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync('./cert/logic-server.key'),
  cert: fs.readFileSync('./cert/logic-server.crt'),
};
const server = https.createServer(options, app);

// --- JWT Verification Middleware ---
const publicKey = fs.readFileSync('./public-key/logic-server-api-public-key.pem', 'utf8');
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
    console.log(`[${clientIp}] [${verified.user}] [${verified.organization}] [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    next(); // Pass control to the next handler
  } catch (err) {
    console.log(`[${clientIp}] - - [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`);
    response.status(403).send("Access Denied: Invalid token");
  }
};

app.post("/", verifyToken, async (request, response) => {
  console.log(request.body.sentMessage);
  const replyMessage = {
    type: "text",
    text: "Hello World!", 
  };
  response.json(replyMessage);
});

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});