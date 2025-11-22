/**
 * @file config/env.js
 * @description Validates and exports environment variables.
 */

import process from 'process';

// List of required environment variables
const REQUIRED_ENV_VARS = [
  "PORT",
  "HOSXP_API_KEY",
  "ICU_API_KEY",
  "USER_DB_API_KEY",
  "HOSxP_API_URL",
  "USERDB_API_URL",
  "ICU_API_URL",
  "LIFF_ID" // New: For icu.html
];

// Check for missing variables
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("------------------------------------------------");
  console.error("⛔ [FATAL ERROR] Missing required environment variables:");
  missingVars.forEach((key) => console.error(`   - ${key}`));
  console.error("------------------------------------------------");
  process.exit(1);
}

// Export structured configuration
export const config = {
  app: {
    port: process.env.PORT || 3009,
    nodeEnv: process.env.NODE_ENV || 'development',
    liffId: process.env.LIFF_ID, // Export for controller
  },
  services: {
    userDb: {
      url: process.env.USERDB_API_URL,
      key: process.env.USER_DB_API_KEY,
    },
    hosxp: {
      url: process.env.HOSxP_API_URL,
      key: process.env.HOSXP_API_KEY,
    },
    icuDb: {
      url: process.env.ICU_API_URL,
      key: process.env.ICU_API_KEY,
    }
  }
};