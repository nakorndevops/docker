/**
 * @file index.js
 * @description Entry point for the Register Frontend service.
 * Serves static HTML pages over HTTPS using Express.
 */

import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 1. Configuration & Constants ---
const DEFAULT_PORT = 3007; // Fallback port if env is missing
const CERT_DIR_NAME = 'cert';
const SSL_KEY_FILENAME = 'register-frontend.key';
const SSL_CERT_FILENAME = 'register-frontend.crt';

// --- 2. Environment Setup (ESM Fix) ---
// __dirname is not natively available in ES modules, so we derive it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Retrieve Port from Environment
const SERVER_PORT = process.env.PORT || DEFAULT_PORT;

/**
 * Loads SSL credentials from the file system.
 * Exits the process if certificates are missing.
 * @returns {object} HTTPS options object with key and cert.
 */
const loadSSLOptions = () => {
  try {
    const keyPath = path.join(__dirname, CERT_DIR_NAME, SSL_KEY_FILENAME);
    const certPath = path.join(__dirname, CERT_DIR_NAME, SSL_CERT_FILENAME);

    // Verify files exist before attempting to read
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      throw new Error(`SSL files not found in ${path.join(__dirname, CERT_DIR_NAME)}`);
    }

    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (error) {
    console.error('[FATAL] Failed to load SSL certificates:', error.message);
    process.exit(1); // Exit with error code
  }
};

// --- 3. Application Initialization ---
const app = express();

// Middleware: Parse JSON bodies (kept for consistency, though mostly used by APIs)
app.use(express.json());

// --- 4. Route Definitions ---

/**
 * Route: GET /providerid-login
 * Description: Serves the ProviderID login HTML page.
 */
app.get('/providerid-login', (req, res) => {
  const filePath = path.join(__dirname, 'providerid-login.html');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('[ERROR] Failed to serve providerid-login.html:', err.message);
      res.status(500).send('Internal Server Error');
    }
  });
});

/**
 * Route: GET /register
 * Description: Serves the Registration HTML page.
 */
app.get('/register', (req, res) => {
  const filePath = path.join(__dirname, 'register.html');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('[ERROR] Failed to serve register.html:', err.message);
      res.status(500).send('Internal Server Error');
    }
  });
});

// --- 5. Server Startup ---
try {
  const sslOptions = loadSSLOptions();
  const httpsServer = https.createServer(sslOptions, app);

  httpsServer.listen(SERVER_PORT, () => {
    console.log('=========================================');
    console.log(`🚀 Register Frontend Service Started`);
    console.log(`👉 HTTPS Server listening on PORT: ${SERVER_PORT}`);
    console.log('=========================================');
  });
} catch (error) {
  console.error('[FATAL] Failed to start server:', error.message);
  process.exit(1);
}