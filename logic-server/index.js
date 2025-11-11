import jwt from "jsonwebtoken";

import * as fs from "fs";

const port = process.env.PORT;
const userDbApiUrl = process.env.USERDB_API_URL;
const hosxpApiUrl = process.env.HOSxP_API_URL;
const userDbApiKey = process.env.USER_DB_API_KEY;
const hosxpApiKey = process.env.HOSXP_API_KEY;

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

  let replyText;

  const { sentMessage, lineUserId } = request.body;
  const modifiedsentMessage = sentMessage.toLowerCase().replace(/\s/g, '');

  if (modifiedsentMessage === "ward") {

    // 1. Get license_id
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userDbApiKey}`,
    };

    const body = JSON.stringify({
      LineUserId: lineUserId,
    });

    const apiResponse = await fetch(userDbApiUrl+"/getUser", {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await apiResponse.json();
    const license_id = data.license_id;

    // 2. Get ward list

    const headersWardList = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hosxpApiKey}`,
    };

    const bodyWardList = JSON.stringify({
      license_id: license_id,
    });

    const wardResponse = await fetch(hosxpApiUrl+"/ward", {
      method: "POST",
      headers: headersWardList,
      body: bodyWardList,
    });
    const ward = await wardResponse.json();

    replyText = ward;
  } else {
    replyText = "Hello World!";
  }

  const replyMessage = {
    type: "text",
    text: replyText,
  };

  response.json(replyMessage);
});

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});