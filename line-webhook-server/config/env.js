// config/env.js

// Validate required variables
const requiredEnv = [
  "PORT",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "USER_DB_APIKEY",
  "HOSXP_APIKEY",
  "LOGIC_SERVER_APIKEY",
  "LOGIC_SERVER_URL",
  "USERDB_API_URL",
  "HOSxP_API_URL",
];

for (const R_env of requiredEnv) {
  if (!process.env[R_env]) {
    console.error(`[Fatal Error] Environment variable ${R_env} is not set.`);
    process.exit(1); // Exit if critical config is missing
  }
}

// Export all variables in a single object
export const env = {
  port: process.env.PORT,
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET,
  userDbApiKey: process.env.USER_DB_APIKEY,
  hosxpApiKey: process.env.HOSXP_APIKEY,
  logicServerApiKey: process.env.LOGIC_SERVER_APIKEY,
  logicServerUrl: process.env.LOGIC_SERVER_URL,
  userdbApiUrl: process.env.USERDB_API_URL,
  hosxpApiUrl: process.env.HOSxP_API_URL,
};