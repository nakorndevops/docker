/**
 * Retrieves a service token from the MOPH API using a Health ID token.
 *
 * @param {object} credentials - The credentials for the service token request.
 * @param {string} credentials.client_id - Your application's client ID.
 * @param {string} credentials.secret_key - Your application's secret key.
 * @param {string} credentials.token - The user's Health ID token to be verified.
 * @returns {Promise<object>} A promise that resolves with the API's JSON response.
 * @throws {Error} If the request fails or the API returns an error.
 */
export async function getServiceToken({ client_id, secret_key, token }) {
  // 1. Validate that all required inputs are provided
  if (!client_id || !secret_key || !token) {
    throw new Error('Missing required parameters: client_id, secret_key, and token are all required.');
  }

  const serviceTokenUrl = 'https://provider.id.th/api/v1/services/token';

  // 2. Construct the request body as a JavaScript object
  const requestBody = {
    token_by: 'Health ID',
    client_id: client_id,
    secret_key: secret_key,
    token: token,
  };

  try {
    // 3. Send the POST request with a JSON body
    const response = await fetch(serviceTokenUrl, {
      method: 'POST',
      headers: {
        // This header is essential to tell the API you're sending JSON
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Convert the JavaScript object into a JSON string for the body
      body: JSON.stringify(requestBody),
    });

    // 4. Check for HTTP errors (e.g., 401, 403, 500)
    if (!response.ok) {
      const errorBody = await response.text(); // Get error details if available
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    // 5. Parse the successful JSON response and return it
    return await response.json();

  } catch (error) {
    console.error('Error requesting service token:', error.message);
    // Re-throw the error so the calling code can handle the failure
    throw error;
  }
}