// services/hosxpService.js

/**
 * Checks if a user is marked as 'active' in HOSxP.
 * @returns {boolean} True if the user is active, false otherwise.
 */
export async function checkActiveUser(license_id, { apiUrl, apiKey }) {
  const route = "checkActiveUser";
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      license_id: license_id,
    }),
  };

  try {
    const response = await fetch(apiUrl + route, requestOptions);
    const isActive = await response.json(); // Expects 1 (true) or 0 (false)
    return !!isActive; // Coerce 1/0 to true/false
    // return !!isActive.message; 
  } catch (error) {
    console.error("Error calling HOSxP API:", error.message);
    throw new Error("Could not check user authorization.");
  }
}