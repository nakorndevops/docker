/**
 * @file config/env.js
 * @description Validates and exports environment variables.
 * Fails fast if required variables are missing.
 */

const requiredVars = [
  "PORT",
  "MYSQL_HOST",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE"
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("------------------------------------------------");
  console.error("⛔ [FATAL ERROR] Missing required environment variables:");
  missingVars.forEach((key) => console.error(`   - ${key}`));
  console.error("------------------------------------------------");
  process.exit(1);
}

export const env = {
  port: process.env.PORT || 3001,
  dbHost: process.env.MYSQL_HOST,
  dbUser: process.env.MYSQL_USER,
  dbPassword: process.env.MYSQL_PASSWORD,
  dbName: process.env.MYSQL_DATABASE,
};