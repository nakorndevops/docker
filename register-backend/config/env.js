/**
 * @file config/env.js
 * @description Validates and exports environment variables, including new frontend config.
 */

import process from 'process';

const REQUIRED_ENV_VARS = [
  "PORT",
  "CLIENT_ID",       
  "CLIENT_SECRET",   
  "CLIENT_ID2",      
  "CLIENT_SECRET2",  
  "USER_DB_API_KEY",
  "HOSXP_API_KEY",
  "USERDB_API_URL",
  "HOSxP_API_URL",
  "HCODE",
  "LIFF_ID_LOGIN",    
  "LIFF_ID_REGISTER"  
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("------------------------------------------------");
  console.error("⛔ [FATAL ERROR] Missing required environment variables:");
  missingVars.forEach((key) => console.error(`   - ${key}`));
  console.error("------------------------------------------------");
  process.exit(1);
}

export const config = {
  app: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    hospitalCode: process.env.HCODE,
    // Frontend Configuration
    liffIdLogin: process.env.LIFF_ID_LOGIN,
    liffIdRegister: process.env.LIFF_ID_REGISTER,
  },
  moph: {
    authClientId: process.env.CLIENT_ID,
    authClientSecret: process.env.CLIENT_SECRET,
    authTokenUrl: 'https://moph.id.th/api/v1/token',
    
    serviceClientId: process.env.CLIENT_ID2,
    serviceClientSecret: process.env.CLIENT_SECRET2,
    serviceTokenUrl: 'https://provider.id.th/api/v1/services/token',
    profileUrl: 'https://provider.id.th/api/v1/services/profile',
  },
  internalApis: {
    userDb: {
      url: process.env.USERDB_API_URL,
      key: process.env.USER_DB_API_KEY,
    },
    hosxp: {
      url: process.env.HOSxP_API_URL,
      key: process.env.HOSXP_API_KEY,
    }
  }
};