/**
 * @file controllers/linkAccountController.js
 * @description Handles the complex orchestration of linking a Provider ID to a Line Account.
 */

import * as mophService from "../services/mophIdService.js";
import * as hosxpService from "../services/hosxpService.js";
import * as userService from "../services/userService.js";

/**
 * Factory function to inject configuration dependencies.
 * @param {object} config - The full application configuration object.
 */
export function createLinkAccountHandler(config) {
  
  return async (req, res) => {
    // 1. Input Validation
    // 'providerIdCode' is the OAuth authorization code from the frontend
    const { LineUserId: lineUserId, providerIdCode: authCode, redirect_uri: redirectUri } = req.body;

    if (!lineUserId || !authCode || !redirectUri) {
      return res.status(400).json({ 
        error: "Missing required parameters: LineUserId, providerIdCode, or redirect_uri." 
      });
    }

    try {
      // --- Step 1: Exchange Auth Code for User Access Token ---
      console.log(`[LinkAccount] 1. Exchanging auth code for user token...`);
      const userTokenData = await mophService.exchangeCodeForAccessToken({
        authCode,
        redirectUri,
        clientId: config.moph.authClientId,
        clientSecret: config.moph.authClientSecret,
        tokenUrl: config.moph.authTokenUrl
      });
      const userAccessToken = userTokenData.data.access_token;

      // --- Step 2: Get Service Token (Server-to-Server) ---
      console.log(`[LinkAccount] 2. Requesting service token...`);
      const serviceTokenData = await mophService.getServiceToken({
        clientId: config.moph.serviceClientId,
        clientSecret: config.moph.serviceClientSecret,
        userAccessToken: userAccessToken,
        serviceTokenUrl: config.moph.serviceTokenUrl
      });
      const serviceAccessToken = serviceTokenData.data.access_token;

      // --- Step 3: Fetch Provider Profile ---
      console.log(`[LinkAccount] 3. Fetching provider profile...`);
      const profileData = await mophService.fetchProviderProfile({
        serviceAccessToken: serviceAccessToken,
        clientId: config.moph.serviceClientId,
        clientSecret: config.moph.serviceClientSecret,
        profileUrl: config.moph.profileUrl
      });

      // Extract Critical Info
      const organization = profileData.data.organization[0];
      if (!organization) {
        throw new Error("No organization data found in provider profile.");
      }

      const { license_id: licenseId, hcode: hospitalCode } = organization;

      // --- Step 4: Validate Hospital Code ---
      console.log(`[LinkAccount] 4. Verifying Hospital Code: ${hospitalCode}...`);
      if (String(hospitalCode) !== String(config.app.hospitalCode)) {
        console.warn(`[LinkAccount] ⛔ Hospital Code Mismatch. Expected: ${config.app.hospitalCode}, Got: ${hospitalCode}`);
        return res.status(403).json({ error: 'Unauthorized. Hospital code does not match this facility.' });
      }

      // --- Step 5: Check Device Limit (User DB) ---
      console.log(`[LinkAccount] 5. Checking device limits for License: ${licenseId}...`);
      const isLimitExceeded = await userService.isDeviceLimitExceeded({
        licenseId,
        apiUrl: config.internalApis.userDb.url,
        apiKey: config.internalApis.userDb.key
      });

      if (isLimitExceeded) {
        console.warn(`[LinkAccount] ⛔ Device limit reached for ${licenseId}`);
        return res.status(401).json({ error: 'Maximum device limit reached for this license.' });
      }

      // --- Step 6: Check Authorization in HOSxP ---
      console.log(`[LinkAccount] 6. Checking Active Status in HOSxP...`);
      const isActive = await hosxpService.checkDoctorActiveStatus({
        licenseId,
        apiUrl: config.internalApis.hosxp.url,
        apiKey: config.internalApis.hosxp.key
      });

      if (!isActive) {
        console.warn(`[LinkAccount] ⛔ User ${licenseId} is not active in HOSxP.`);
        return res.status(403).json({ error: 'Forbidden. Your account is not active in the hospital system.' });
      }

      // --- Step 7: Persist User Link ---
      console.log(`[LinkAccount] 7. Creating user record...`);
      await userService.createUser({
        licenseId,
        lineUserId,
        apiUrl: config.internalApis.userDb.url,
        apiKey: config.internalApis.userDb.key
      });

      console.log(`[LinkAccount] ✅ Success! Account linked for ${licenseId}.`);
      
      // Return the profile data to the frontend for display
      res.status(200).json(profileData);

    } catch (error) {
      // Handle known "User exists" error specifically
      if (error.message.includes('User already exists')) {
        console.warn(`[LinkAccount] ⚠️ Duplicate user attempt.`);
        return res.status(409).json({ error: 'User is already registered.' });
      }

      // Generic Error Handler
      console.error(`[LinkAccount] 🔴 Error: ${error.message}`);
      res.status(500).json({ error: 'An internal server error occurred while processing your request.' });
    }
  };
}