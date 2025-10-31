// config/env.js

// List all required environment variables
const requiredEnv = [
  "PORT",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "CLIENT_ID2",
  "CLIENT_SECRET2",
  "USER_DB_API_KEY",
  "HOSXP_API_KEY",
  "USERDB_API_URL",
  "HOSxP_API_URL",
];

// Validate
for (const R_env of requiredEnv) {
  if (!process.env[R_env]) {
    console.error(`[Fatal Error] Environment variable ${R_env} is not set.`);
    console.error("Please set all required variables before starting the server.");
    process.exit(1); // Exit if critical config is missing
  }
}

// Export a clean config object
export const env = {
  port: process.env.PORT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientId2: process.env.CLIENT_ID2,
  clientSecret2: process.env.CLIENT_SECRET2,
  userDbApiKey: process.env.USER_DB_API_KEY,
  hosxpApiKey: process.env.HOSXP_API_KEY,
  userdbApiUrl: process.env.USERDB_API_URL,
  hosxpApiUrl: process.env.HOSxP_API_URL,
};