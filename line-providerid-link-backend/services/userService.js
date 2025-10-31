// services/userService.js

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