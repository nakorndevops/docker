/**
 * Creates a user by sending a POST request to the user-db-api.
 *
 * @param {string} LineUserId - The user's Line ID (Note: This param is not used in the current body or URL as specified).
 * @param {string} license_id - The license ID to send in the request body.
 * @param {string} user_db_api_key - The API key for authorization.
 * @returns {Promise<object>} The JSON response data from the API.
 * @throws {Error} Throws an error if the network request fails or the API returns a non-OK status.
 */
export async function createUser(LineUserId, license_id, user_db_api_key) {
  const url = 'https://user-db-api:3003/createUser';

  // 1. Define headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user_db_api_key}`
  };

  // 2. Define the body and stringify it
  const body = JSON.stringify({
    "license_id": license_id,
    "LineUserId": LineUserId
  });

  // 3. Use try...catch for network or request-level errors
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    // 4. Handle non-successful HTTP responses (e.g., 401, 404, 500)
    if (!response.ok) {
      let errorData;
      try {
        // Try to parse a JSON error response from the API
        errorData = await response.json();
      } catch (parseError) {
        // If the error response isn't JSON, get it as text
        errorData = await response.text();
      }
      
      console.error('API Error Response:', errorData);
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // 5. Parse and return the successful JSON response
    const data = await response.json();
    console.log('User created successfully:', data);
    return data;

  } catch (error) {
    // 6. Handle network failures (e.g., server unreachable, DNS issues)
    console.error('Fetch operation failed:', error.message);
    throw new Error(`Network or request error: ${error.message}`);
  }
}