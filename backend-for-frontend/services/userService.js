/**
 * Creates a new user in the User DB.
 * @returns {Promise<object>} The result of the creation.
 */
export async function createUser({ license_id, LineUserId, apiUrl, apiKey }) {
  const createUserOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      "license_id": license_id,
      "LineUserId": LineUserId,
    }),
  };

  try {
    const response = await fetch(apiUrl + "/createUser", createUserOptions);
    
    // Check for 409 Conflict (Duplicate User) specifically
    if (response.status === 409) {
      throw new Error('User already exists.');
    }

    if (!response.ok) {
      throw new Error(`User DB API /createUser failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createUser service:', error.message);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Checks if a user exists in the User DB.
 * This acts as a proxy, forwarding the full response.
 * @returns {Promise<{status: number, data: object}>} An object with the status and JSON data from the downstream service.
 */
export async function checkUserExists({ LineUserId, apiUrl, apiKey }) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ LineUserId: LineUserId })
  };

  try {
    const response = await fetch(apiUrl + "/checkUserExist", requestOptions);
    
    let responseData;
    try {
      // Try to parse JSON, even on an error status (e.g., 400, 500)
      // to forward the error message from the downstream service.
      responseData = await response.json();
    } catch (jsonError) {
      // If the response isn't valid JSON, create a generic error
      console.error(`Failed to parse JSON response from userdb-api: ${jsonError.message}`);
      responseData = { error: "Received an invalid response from the user service." };
      // Return the original status or 502 (Bad Gateway) if parsing failed
      return { status: response.status || 502, data: responseData };
    }
    
    // Return both the status and the parsed data
    return { status: response.status, data: responseData };

  } catch (error) {
    // This catches network errors (e.g., server down)
    console.error('Error in checkUserExists service:', error.message);
    // Throw a specific error for the controller to catch
    throw new Error('Service unavailable. Could not connect to user database.');
  }
}