/**
 * Retrieves a License ID based on a Line User ID by sending a POST request to the user database API.
 *
 * @param {string} LineUserID - The Line User ID to look up.
 * @param {string} userdb_apikey - The API key for authorization.
 * @returns {Promise<object>} - A promise that resolves to the JSON response from the API (e.g., { license_id: "..." }).
 * @throws {Error} - Throws an error if the network request fails or the API returns an error response.
 */
export async function getLicenseIdFromLineUserID(LineUserID, userdb_apikey) {
  const url = 'https://user-db-api:3003/getLicenseIdFromLineUserID';

  // 1. Define headers and body
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userdb_apikey}`
  };

  const body = JSON.stringify({
    LineUserID: LineUserID
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
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }

    // 4. Parse the successful JSON response
    const data = await response.json();
    console.log(response);
    console.log(data);
    return data;

  } catch (error) {
    // 5. Handle network errors or errors from the 'throw' above
    console.error('Failed to get License ID:', error.message);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}