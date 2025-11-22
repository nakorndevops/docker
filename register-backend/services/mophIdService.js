/**
 * @file services/mophIdService.js
 * @description Handles interactions with the MOPH (Ministry of Public Health) ID and Provider ID APIs.
 */

/**
 * Exchanges the temporary authorization code for a user Access Token.
 * @param {object} params
 * @param {string} params.authCode - Code received from the frontend (OAuth callback).
 * @param {string} params.redirectUri - The URI used in the initial login request.
 * @param {string} params.clientId - MOPH Auth Client ID.
 * @param {string} params.clientSecret - MOPH Auth Client Secret.
 * @param {string} params.tokenUrl - URL to fetch the token.
 * @returns {Promise<object>} The JSON response containing access_token.
 */
export async function exchangeCodeForAccessToken({ authCode, redirectUri, clientId, clientSecret, tokenUrl }) {
  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MOPH Auth Token API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[MOPH Service] Failed to get access token:', error.message);
    throw error;
  }
}

/**
 * Requests a Service Token required to access Provider Profile APIs.
 * @param {object} params
 * @param {string} params.clientId - Service Client ID.
 * @param {string} params.clientSecret - Service Client Secret.
 * @param {string} params.userAccessToken - The user's access token retrieved previously.
 * @param {string} params.serviceTokenUrl - URL to fetch the service token.
 * @returns {Promise<object>} The JSON response containing the service access_token.
 */
export async function getServiceToken({ clientId, clientSecret, userAccessToken, serviceTokenUrl }) {
  const payload = {
    token_by: 'Health ID',
    client_id: clientId,
    secret_key: clientSecret,
    token: userAccessToken,
  };

  try {
    const response = await fetch(serviceTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MOPH Service Token API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[MOPH Service] Failed to get service token:', error.message);
    throw error;
  }
}

/**
 * Fetches the Provider Profile (Organization Data).
 * @param {object} params
 * @param {string} params.serviceAccessToken - Token obtained from getServiceToken.
 * @param {string} params.clientId - Service Client ID.
 * @param {string} params.clientSecret - Service Client Secret.
 * @param {string} params.profileUrl - URL to fetch the profile.
 * @returns {Promise<object>} The provider profile data.
 */
export async function fetchProviderProfile({ serviceAccessToken, clientId, clientSecret, profileUrl }) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${serviceAccessToken}`,
    'client-id': clientId,
    'secret-key': clientSecret,
  };

  try {
    const response = await fetch(profileUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MOPH Profile API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[MOPH Service] Failed to fetch profile:', error.message);
    throw error;
  }
}