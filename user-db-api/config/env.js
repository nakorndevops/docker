/**
 * @file config/env.js
 * @description Validates and exports environment variables.
 */

const requiredVars = [
    "PORT",
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "DEVICE_LIMIT"
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
    port: process.env.PORT,
    dbHost: process.env.MYSQL_HOST,
    dbUser: process.env.MYSQL_USER,
    dbPassword: process.env.MYSQL_PASSWORD,
    dbName: process.env.MYSQL_DATABASE,
    deviceLimit: parseInt(process.env.DEVICE_LIMIT, 10) || 2,
};