/**
 * @file middleware/auth.js
 * @description JWT Verification Middleware using RSA256 public key.
 */

import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load Public Key
const PUBLIC_KEY_PATH = path.join(PROJECT_ROOT, "public-key", "icu-db-api-public-key.pem");
let publicKey;

try {
  publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
} catch (error) {
  console.error(`❌ [FATAL] Could not read public key at ${PUBLIC_KEY_PATH}`);
  process.exit(1);
}

/**
 * Express Middleware to verify JWT tokens.
 */
export const verifyToken = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const url = req.originalUrl;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn(`[${clientIp}] ⛔ Access Denied (No Token): ${method} ${url}`);
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    req.user = verified;
    next();
  } catch (err) {
    console.warn(`[${clientIp}] ⛔ Access Denied (Invalid Token): ${method} ${url}`);
    return res.status(403).json({ error: "Access Denied: Invalid token" });
  }
};