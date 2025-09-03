/**
 * Exchanges an authorization code for an access token from the MOPH API.
 *
 * @param {object} params - The parameters for the token request.
 * @param {string} params.code - The authorization code received from the callback.
 * @param {string} params.redirect_uri - The exact redirect URI used in the initial authorization request.
 * @param {string} params.client_id - Your application's client ID.
 * @param {string} params.client_secret - Your application's client secret.
 * @returns {Promise<object>} A promise that resolves with the token data (e.g., access_token, refresh_token).
 * @throws {Error} If the request fails or the API returns an error.
 */

export async function getAccessToken({ code, redirect_uri, client_id, client_secret }) {
  // 1. Validate inputs
  if (!code || !redirect_uri || !client_id || !client_secret) {
    throw new Error('Missing required parameters: code, redirect_uri, client_id, and client_secret are all required.');
  }

  const tokenUrl = 'https://moph.id.th/api/v1/token';

  

  // 2. Prepare the request body in the required format
  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'authorization_code');
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirect_uri);
  bodyParams.append('client_id', client_id);
  bodyParams.append('client_secret', client_secret);

  try {
    // 3. Send the POST request
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        // This header is crucial for the API to understand the body format
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams,
    });
   

    // 4. Check for HTTP errors
    if (!response.ok) {
      // Try to get more details from the response body if possible
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    // 5. Parse the successful JSON response and return it
    return await response.json();

  } catch (error) {
    console.error('Error fetching access token:', error.message);
    // Re-throw the error to allow the calling function to handle it
    throw error;
  }
}