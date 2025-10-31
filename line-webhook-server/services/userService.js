// services/userService.js

/**
 * Checks if a user exists in the User DB.
 * @returns {object|null} The user object if found, otherwise null.
 */
export async function findUserByLineId(lineUserId, { apiUrl, apiKey }) {
  const route = "getUser"; // The specific endpoint
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      LineUserId: lineUserId,
    }),
  };

  try {
    const response = await fetch(apiUrl + route, requestOptions);
    const userData = await response.json();

    if (userData.error) {
      console.log("No user found in UserDB:", lineUserId);
      return null; // User not found
    }
    
    console.log("User found in UserDB:", lineUserId);
    return userData; // Returns user object, e.g., { license_id: "..." }

  } catch (error) {
    console.error("Error calling User DB API:", error.message);
    throw new Error("Could not verify user.");
  }
}