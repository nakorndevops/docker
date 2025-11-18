// services/mophIdService.js

/**
 * Exchanges an authorization code for an access token.
 * (Based on your getProviderIdAccessToken.js)
 */
export async function getAccessToken({ code, redirect_uri, client_id, client_secret }) {
  if (!code || !redirect_uri || !client_id || !client_secret) {
    throw new Error('getAccessToken: Missing required parameters.');
  }

  const tokenUrl = 'https://moph.id.th/api/v1/token';
  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    client_id,
    client_secret,
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
      const errorBody = await response.text();
      throw new Error(`MOPH Token API failed with status ${response.status}: ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching access token:', error.message);
    throw error;
  }
}

/**
 * Retrieves a service token from the MOPH API.
 * (Based on your getProviderIdServiceToken.js)
 */
export async function getServiceToken({ client_id, secret_key, token }) {
  if (!client_id || !secret_key || !token) {
    throw new Error('getServiceToken: Missing required parameters.');
  }

  const serviceTokenUrl = 'https://provider.id.th/api/v1/services/token';
  const requestBody = {
    token_by: 'Health ID',
    client_id,
    secret_key,
    token,
  };

  try {
    const response = await fetch(serviceTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MOPH Service Token API failed with status ${response.status}: ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error requesting service token:', error.message);
    throw error;
  }
}

/**
 * Fetches a user profile from the provider's service API.
 * (Based on your getProviderIdProfile.js)
 */
export async function getProviderProfile({ accessToken, clientId, secretKey }) {
  if (!accessToken || !clientId || !secretKey) {
    throw new Error('getProviderProfile: Missing required credentials.');
  }

  const profileUrl = 'https://provider.id.th/api/v1/services/profile';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'client-id': clientId,
    'secret-key': secretKey,
  };

  try {
    const response = await fetch(profileUrl, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MOPH Profile API failed with status ${response.status}: ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider profile:', error.message);
    throw error;
  }
}