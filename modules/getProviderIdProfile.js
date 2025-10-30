/**
 * Fetches a user profile from the provider's service API.
 *
 * @param {object} credentials - The authentication credentials.
 * @param {string} credentials.accessToken - The Bearer token for authorization.
 * @param {string} credentials.clientId - The application's client ID.
 * @param {string} credentials.secretKey - The application's secret key.
 * @returns {Promise<object>} A promise that resolves with the user profile data.
 * @throws {Error} If the request fails, credentials are missing, or the API returns an error.
 */
export async function getProviderProfile({ accessToken, clientId, secretKey }) {
  // 1. Validate that all required credentials are provided
  if (!accessToken || !clientId || !secretKey) {
    throw new Error('Missing required credentials: accessToken, clientId, and secretKey are all required.');
  }

  const profileUrl = 'https://provider.id.th/api/v1/services/profile';

  // 2. Construct the headers object
  const headers = {
    // Although a GET request has no body, this header is often expected by APIs
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    // Custom headers are typically case-insensitive, but match the API's expected format
    'client-id': clientId,
    'secret-key': secretKey,
  };

  try {
    // 3. Send the GET request
    const response = await fetch(profileUrl, {
      method: 'GET', // This is a GET request, so no 'body' is included
      headers: headers,
    });

    // 4. Check for HTTP errors (e.g., 401 Unauthorized, 404 Not Found)
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    // 5. Parse the successful JSON response and return it
    return await response.json();

  } catch (error) {
    console.error('Error fetching provider profile:', error.message);
    // Re-throw the error to allow the calling function to handle it
    throw error;
  }
}