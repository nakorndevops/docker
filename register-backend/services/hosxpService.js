/**
 * @file services/hosxpService.js
 * @description Interactions with the internal HOSxP API.
 */

import { URL } from 'url';

/**
 * Verifies if a doctor is marked as 'Active' in the HOSxP system.
 * @param {object} params
 * @param {string} params.licenseId - Doctor's license ID.
 * @param {string} params.apiUrl - Base URL of HOSxP API.
 * @param {string} params.apiKey - Auth key.
 * @returns {Promise<boolean>} True if active, false otherwise.
 */
export async function checkDoctorActiveStatus({ licenseId, apiUrl, apiKey }) {
  const url = new URL('/checkActiveUser', apiUrl).href;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ license_id: licenseId }),
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.status === true;
    }

    return false;
  } catch (error) {
    console.error('[HOSxP Service] Active check failed:', error.message);
    // Default to false (deny access) on error for security
    return false;
  }
}