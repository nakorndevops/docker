import { getAccessToken } from './module/getProviderIdAccessToken.js';
import { getServiceToken } from './module/getProviderIdServiceToken.js';
import { getProviderProfile } from './module/getProviderIdProfile.js';

import * as fs from "fs";

const port = process.env.PORT;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_id2 = process.env.CLIENT_ID2;
const client_secret2 = process.env.CLIENT_SECRET2;

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
};
const server = https.createServer(options, app);

app.post('/linkAccount', async (req, res) => {
  const LineUserId = req.body.LineUserId;
  const providerIdCode = req.body.providerIdCode;
  const redirect_uri = req.body.redirect_uri;





  // Get Access Token
  const tokenRequestParams = {
    code: providerIdCode, // This is the temporary code
    redirect_uri: redirect_uri,    // Must match your registered callback URL
    client_id: client_id,               // Your app's client ID
    client_secret: client_secret,       // Your app's client secret
  };

  let access_token;
  try {
    console.log('Attempting to get access token...');
    const tokenData = await getAccessToken(tokenRequestParams);
    access_token = tokenData.data.access_token;

    console.log('✅ Successfully retrieved token data:');
    // Now you can use tokenData.access_token to make authenticated API calls

  } catch (error) {
    console.error('🔴 Failed to get access token:', error.message);
  }

  // Get Service Token
  const serviceCredentials = {
    client_id: client_id2,
    secret_key: client_secret2,
    token: access_token,
  };

  let service_token;
  try {
    console.log('Requesting service token from MOPH API...');
    const service_data = await getServiceToken(serviceCredentials);
    service_token = service_data.data.access_token;
    console.log('✅ Successfully received response:');
    // You can now use the data returned by the API

  } catch (error) {
    console.error('🔴 Failed to request service token:', error.message);
  }

  // Get Profile
  const apiCredentials = {
    accessToken: service_token,
    clientId: client_id2,
    secretKey: client_secret2,
  };

  let profileData;

  try {
    console.log('Fetching provider profile...');
    profileData = await getProviderProfile(apiCredentials);

    console.log('✅ Successfully fetched profile data:');

  } catch (error) {
    console.error('🔴 Failed to fetch provider profile:', error.message);
  }

  res.json(profileData);
})

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});