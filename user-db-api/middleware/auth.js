// middleware/auth.js
import jwt from "jsonwebtoken";
import * as fs from "fs";
import path from "path";

// Get the directory name in ES modules
const __dirname = path.resolve(path.dirname(""));

// Read the public key once when the module loads
const publicKey = fs.readFileSync(
  path.join(__dirname, "./public-key/user-db-api-public-key.pem"),
  "utf8"
);

export const verifyToken = (request, response, next) => {
  // logs
  const clientIp = request.ip || request.connection.remoteAddress; // More reliable IP
  const readableTimestamp = new Date().toString();
  const { method: requestMethod, path: requestPath, protocol: requestProtocol } = request;
  const userAgent = request.headers["user-agent"];

  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    console.log(
      `[${clientIp}] - - [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent} "Access Denied: No token provided"`
    );
    return response.status(401).send("Access Denied: No token provided");
  }

  try {
    const verified = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    
    // **IMPROVEMENT**: Attach the verified payload to the request
    request.user = verified;

    // Log success
    console.log(
      `[${clientIp}] [${verified.user}] [${verified.organization}] [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent}`
    );
    
    next(); // Pass control to the next handler
  } catch (err) {
    // Log failure
    console.log(
      `[${clientIp}] - - [${readableTimestamp}] ${requestMethod} ${requestPath} ${requestProtocol} ${userAgent} "Access Denied: Invalid token"`
    );
    response.status(403).send("Access Denied: Invalid token");
  }
};