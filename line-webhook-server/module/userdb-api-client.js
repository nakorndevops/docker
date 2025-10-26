/**
 * Fetches user existence status from the API.
 *
 * @param {string} lineUserId The user's Line ID to check.
 * @param {string} token The JWT Bearer token for authorization.
 * @returns {Promise<object>} A promise that resolves to the JSON data from the API.
 * @throws {Error} If the network request fails or the API returns an error.
 */
export async function checkUserExists(lineUserId, token) {
  const apiUrl = "https://user-db-api:3003/checkUserExist";

  // 1. Configure the request options
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      LineUserId: lineUserId
    })
  };

  try {
    // 2. Make the API call
    const response = await fetch(apiUrl, requestOptions);

    // 3. Handle non-successful responses (e.g., 401, 404, 500)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error details
      throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    // 4. Return the JSON data from the successful response
    return await response.json();

  } catch (error) {
    console.error("Error in checkUserExists:", error.message);
    // Re-throw the error so the calling code can handle it
    throw error;
  }
}