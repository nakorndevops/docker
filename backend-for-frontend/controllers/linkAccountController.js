// controllers/linkAccountController.js
import * as mophIdService from "../services/mophIdService.js";
import * as hosxpService from "../services/hosxpService.js";
import * as userService from "../services/userService.js";

// This "factory" function creates the handler and injects the config
export function createLinkAccountHandler(env) {

  // This is the actual route handler logic
  return async (req, res) => {
    const { LineUserId, providerIdCode, redirect_uri } = req.body;

    // 1. Validate Input
    if (!LineUserId || !providerIdCode || !redirect_uri) {
      return res.status(400).json({ error: "Incomplete request parameters: LineUserId, providerIdCode, and redirect_uri are required." });
    }
    if (!env.clientId) {
      console.error("Server configuration error: CLIENT_ID is not set.");
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
      // 2. Get Access Token
      console.log('Attempting to get access token...');
      const tokenParams = {
        code: providerIdCode,
        redirect_uri: redirect_uri,
        client_id: env.clientId,
        client_secret: env.clientSecret,
      };
      const tokenData = await mophIdService.getAccessToken(tokenParams);
      const access_token = tokenData.data.access_token;
      console.log('✅ Successfully retrieved access token.');

      // 3. Get Service Token
      console.log('Requesting service token...');
      const serviceCreds = {
        client_id: env.clientId2,
        secret_key: env.clientSecret2,
        token: access_token,
      };
      const serviceData = await mophIdService.getServiceToken(serviceCreds);
      const service_token = serviceData.data.access_token;
      console.log('✅ Successfully received service token.');

      // 4. Get Profile
      console.log('Fetching provider profile...');
      const apiCreds = {
        accessToken: service_token,
        clientId: env.clientId2,
        secretKey: env.clientSecret2,
      };
      const profileData = await mophIdService.getProviderProfile(apiCreds);
      const license_id = profileData.data.organization[0].license_id;
      const hcode = profileData.data.organization[0].hcode;
      console.log('✅ Successfully fetched profile data.');

      // 5. Check HCODE
      console.log('Checking Hcode...');
      if (hcode != env.hospitalCode) {
        console.warn(`🔴 Authorization failed due to mismatch hospital code ${hcode}`);
        return res.status(403).json({ error: 'Unauthorized. Mismatch hospital code.' });
      }
      console.log('✅ Hcode matched.');

      // 6. Check Device limit
      console.log('Checking device number...');
      const isExceed = await userService.isDeviceLimitReached({
        license_id: license_id,
        apiUrl: env.userdbApiUrl,
        apiKey: env.userDbApiKey,
      });
      if(isExceed) {
        return res.status(401).json({ error: '🔴 You are reach device limit.' });
      } else {
        console.log('✅ Device not exceed limit');
      }

      // 7. Check Authorization (Guard Clause)
      console.log('Checking user authorization...');
      const isAuthorized = await hosxpService.checkActiveUser({
        license_id: license_id,
        apiUrl: env.hosxpApiUrl,
        apiKey: env.hosxpApiKey,
      });

      if (!isAuthorized) {
        console.warn(`🔴 Authorization failed for license_id: ${license_id}`);
        // Send a 401 based on the logic in your old index.js
        return res.status(401).json({ error: 'User is inactive or not found.' });
      }
      console.log('✅ User is authorized.');

      // 8. Create User
      console.log('Creating user in database...');
      const createUserResult = await userService.createUser({
        license_id: license_id,
        LineUserId: LineUserId,
        apiUrl: env.userdbApiUrl,
        apiKey: env.userDbApiKey,
      });
      console.log('✅ User created successfully:', createUserResult);

      // 9. Success Response
      res.status(200).json(profileData); // Send back the profile on success

    } catch (error) {
      // 10. Global Error Handling
      console.error('🔴 Failed to link account:', error.message);

      // Send specific error for duplicate user
      if (error.message.includes('User already exists')) {
        return res.status(409).json({ error: 'User already exists.' });
      }

      // Send a generic error to the client
      res.status(500).json({ error: `An error occurred: ${error.message}` });
    }
  };
}