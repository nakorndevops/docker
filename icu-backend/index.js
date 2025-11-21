// index.js
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

const app = express();
const port = process.env.PORT || 3009;

const hosxpApiKey = process.env.HOSXP_API_KEY;
const icuApiKey = process.env.ICU_API_KEY;
const userApiKey = process.env.USER_DB_API_KEY;

const hosxpApiUrl = process.env.HOSxP_API_URL;
const icuApiUrl = process.env.ICU_API_URL;
const userApiUrl = process.env.USERDB_API_URL;

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON bodies

// --- HTTPS Options ---
const __dirname = path.resolve(path.dirname(""));
const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/icu-backend.key")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/icu-backend.crt")),
};

// User Authen Middleware
const userAuthen = async (request, response, next) => {
  const { LineUserId } = request.body;

  // Check user exist
  const getUserOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userApiKey}`,
    },
    body: JSON.stringify({
      LineUserId: LineUserId,
    }),
  };
  const userApiResponse = await fetch(userApiUrl + "/getUser", getUserOptions);
  const userData = await userApiResponse.json();

  if (userApiResponse.status != 200) {
    response.status(userApiResponse.status).json(userData);
  }

  // Check Active User
  const checkUserOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hosxpApiKey}`,
    },
    body: JSON.stringify({
      license_id: userData.license_id,
    }),
  };
  const hosxpApiResponse = await fetch(hosxpApiUrl + "/checkActiveUser", checkUserOptions);
  const verifyStatus = await hosxpApiResponse.json();

  if(hosxpApiResponse.status != 200) {
    response.status(hosxpApiResponse.status).json(verifyStatus);
  }

  next();
};

app.post("/icuStatus", userAuthen, async (request, response) => {
  const icuBedStatusOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hosxpApiKey}`,
    },
  };
  const hosxoApiResponse = await fetch(hosxpApiUrl + "/icuBedStatus", icuBedStatusOptions);
  const wardsData = await hosxoApiResponse.json();

  const icuBedRiskOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${icuApiKey}`,
    },
  };
  const icuApiResponse = await fetch(icuApiUrl + "/icuBedRisk", icuBedRiskOptions);
  const riskData = await icuApiResponse.json();

  // 1. Create a lookup object from the riskData for faster access
  // This converts the array into an object where keys are 'ward_code'
  const riskLookup = riskData.reduce((acc, item) => {
    acc[item.ward_code] = item;
    return acc;
  }, {});

  // 2. Map through the wardsData and merge with the corresponding risk data
  const combinedData = wardsData.map(ward => {
    // Find the matching risk object using the ID
    const riskInfo = riskLookup[ward.ward_code] || {};

    // Return a new merged object
    return {
      ...ward,       // Spread properties from the ward object
      ...riskInfo    // Spread properties from the risk object
    };
  });

  response.json(combinedData);
});

app.post("/icuBedRiskUpdate", userAuthen, async (request, response) => {
  const { ward_code, high_risk, medium_risk, low_risk } = request.body;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${icuApiKey}`,
    },
    body: JSON.stringify({
      ward_code: ward_code,
      high_risk: high_risk,
      medium_risk: medium_risk,
      low_risk: low_risk,
    }),    
  };
  const icuApiResponse = await fetch(icuApiUrl + "/icuBedRiskUpdate", options);
  const result = await icuApiResponse .json();
  response.status(icuApiResponse.status).json(result);
});

// --- Create and Start Server ---
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`🚀 HTTPS Server listening on PORT: ${port}`);
});