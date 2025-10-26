// validateUser.js

/**
 * Fetches the officer code for a given license ID from the API.
 * @param {string} licenseId The license number of the officer.
 * @returns {Promise<object>} A promise that resolves to the parsed JSON data from the API.
 * @throws {Error} Throws an error if the licenseId is invalid, the network request fails, or the API returns a non-successful status.
 */

export async function validateUser(licenseId) {
  // Input Validation
  if (!licenseId || typeof licenseId !== 'string' || licenseId.trim() === '') {
    throw new Error('Invalid or missing license_id provided.');
  }

  // Configuration from Environment Variables
  const API_BASE_URL = process.env.HOSXP_API_BASE_URL || 'https://hosxp-api:3001';
  const API_TOKEN = process.env.HOSXP_API_TOKEN; // <-- NEW: Read the token

  // <-- NEW: Fail fast if the token is missing in the configuration
  if (!API_TOKEN) {
    throw new Error('API token is missing. Please check your .env configuration.');
  }

  const endpoint = `${API_BASE_URL}/validateUser`;

  // Timeout Handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`, // <-- NEW: Add the Authorization header
      },
      body: JSON.stringify({
        licenseno: licenseId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // HTTP Status Error Handling
    if (!response.ok) {
      // Check for common auth errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please check your API token.');
      }
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    // Return Parsed JSON data
    return await response.json();

  } catch (error) {
    // Network & Other Error Handling
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('The API request timed out.');
    }
    console.error('An error occurred while fetching officer code:', error.message);
    throw error;
  }
}