// services/hosxpService.js

/**
 * Checks if a user is active in HOSxP.
 * @returns {Promise<boolean>} True if active (1), false otherwise (0 or error).
 */
export async function checkActiveUser({ license_id, apiUrl, apiKey }) {
  const checkAuthorizedOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    // The HOSxP API expects 'license_id', not '_license_id'.
    // The LIKE logic is handled by the API server itself.
    body: JSON.stringify({
      license_id: license_id, 
    }),
  };

  try {
    const response = await fetch(apiUrl + "/checkActiveUser", checkAuthorizedOptions);
    const isActive = await response.json(); // Expects true or false
    if(response.status == 200) {
      return isActive.status;
    } else {
      return false;
    }    
    /*
    if (!response.ok) {
       throw new Error(`HOSxP API /checkActiveUser failed with status ${response.status}`);
    }
    */

    
    // return !!authorizedStatus; // Convert 1/0 to true/false
    // return authorizedStatus.status; 
  } catch (error) {
    console.error('Error in checkActiveUser service:', error.message);
    throw new Error('Failed to check user authorization.');
  }
}