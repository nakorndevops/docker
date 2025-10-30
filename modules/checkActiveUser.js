/**
 * Checks if a user is active by sending a POST request to the user database API.
 *
 * @param {string} license_id - The license ID to check.
 * @param {string} hosxp_api_key - The API key for authorization.
 * @returns {Promise<object>} - A promise that resolves to the JSON response from the API.
 * @throws {Error} - Throws an error if the network request fails or the API returns an error response.
 */
export async function checkActiveUser(license_id, hosxp_api_key) {
  const url = 'https://hosxp-api:3001/checkActiveUser';

  // 1. Define headers and body
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${hosxp_api_key}`
  };

  const body = JSON.stringify({
    license_id: license_id
  });

  // 2. Use try...catch for error handling
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    // 3. Check for non-successful HTTP status codes (e.g., 401, 404, 500)
    if (!response.ok) {
      // Try to get more details from the response body, if available
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }

    // 4. Parse the successful JSON response
    const data = await response.json();
    return data;

  } catch (error) {
    // 5. Handle network errors or errors from the 'throw' above
    console.error('Failed to check active user:', error.message);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}