import { getAccessToken } from './module/getProviderIdAccessToken.js';
import { getServiceToken } from './module/getProviderIdServiceToken.js';
import { getProviderProfile } from './module/getProviderIdProfile.js';
import { checkActiveUser } from './module/checkActiveUser.js';
import { createUser } from './module/createUser.js';

import * as fs from "fs";

const port = process.env.PORT;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_id2 = process.env.CLIENT_ID2;
const client_secret2 = process.env.CLIENT_SECRET2;

const user_db_api_key = process.env.USER_DB_API_KEY;
const hosxp_api_key = process.env.HOSXP_API_KEY;

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "line-providerid-link-backend.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "line-providerid-link-backend.crt")),
};
const server = https.createServer(options, app);

app.post('/linkAccount', async (req, res) => {
  const LineUserId = req.body.LineUserId;
  const providerIdCode = req.body.providerIdCode;
  const redirect_uri = req.body.redirect_uri;

  let tokenRequestParams;
  let access_token;
  let service_token;
  let profileData;
  let license_id;
  let userStatus;

  // Check if parameter complete
  if (!client_id) {
    res.status(500).json({error: 'No client ID !'});
  } else if (!LineUserId || !providerIdCode || !redirect_uri) {
    res.status(400).json("Incomplete request parameter !");
  } else {
    // Get Access Token
    tokenRequestParams = {
      code: providerIdCode,
      redirect_uri: redirect_uri,
      client_id: client_id, 
      client_secret: client_secret,    
    };
    try {
      console.log('Attempting to get access token...');
      const tokenData = await getAccessToken(tokenRequestParams);
      access_token = tokenData.data.access_token;
      console.log('✅ Successfully retrieved token data:');
    } catch (error) {
      console.error('🔴 Failed to get access token:', error.message);
      res.status(500).json({error: 'Failed to get access token !'});
    }
  }

  if (access_token) {
    // Get Service Token
    const serviceCredentials = {
      client_id: client_id2,
      secret_key: client_secret2,
      token: access_token,
    };

    try {
      console.log('Requesting service token from MOPH API...');
      const service_data = await getServiceToken(serviceCredentials);
      service_token = service_data.data.access_token;
      console.log('✅ Successfully received response:');
    } catch (error) {
      console.error('🔴 Failed to request service token:', error.message);
      res.status(500).json({error: 'Failed to get service token !'});
    }
  }

  if (service_token) {
    // Get Profile
    const apiCredentials = {
      accessToken: service_token,
      clientId: client_id2,
      secretKey: client_secret2,
    };

    try {
      console.log('Fetching provider profile...');
      profileData = await getProviderProfile(apiCredentials);

      console.log('✅ Successfully fetched profile data:');

    } catch (error) {
      console.error('🔴 Failed to fetch provider profile:', error.message);
      res.status(500).json({error: 'Failed to get user profile !'});
    }
  }

  if (profileData) {
    // Check active user status from HOSxP
    license_id = profileData.data.organization[0].license_id;

    try {
      console.log(`Checking active user status: ${license_id}...`);

      // Call the imported function
      userStatus = await checkActiveUser(license_id, hosxp_api_key);
      console.log('API Response:', userStatus);

    } catch (error) {
      // This will catch any errors thrown by checkActiveUser
      console.error('🔴 An error occurred:', error.message);
      res.status(500).json({error: 'Failed to check user status !'});
    }
  }

  if (userStatus) {
    // Create user if user is active
    try {
      const result = await createUser(LineUserId, license_id, user_db_api_key);
      console.log('--- Operation Successful ---');
      console.log('API Result:', result);
      if (result === true) {
        res.status(200).json(profileData);
      } else {
        res.status(500).json({error: 'Failed to create user !'});
      }
    } catch (error) {
      console.log('--- Operation Failed ---');
      console.error('Failed to create user:', error.message);
      res.status(500).json({error: 'Failed to create user !'});
    }
  } else {
    // If User is inactive or no user founded
    res.status(401).json({error: 'User is inactive or user not founded !'});
  }
})

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});