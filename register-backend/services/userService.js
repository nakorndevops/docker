/**
 * @file services/userService.js
 * @description Interactions with the internal User Database API.
 */

import { URL } from 'url';

/**
 * Creates a new user record linking LINE ID and License ID.
 * @param {object} params
 * @param {string} params.licenseId - Medical License ID.
 * @param {string} params.lineUserId - LINE User ID.
 * @param {string} params.apiUrl - Base URL of the User DB API.
 * @param {string} params.apiKey - Auth key for the API.
 * @returns {Promise<object>} Response data.
 * @throws {Error} If creation fails or user exists.
 */
export async function createUser({ licenseId, lineUserId, apiUrl, apiKey }) {
  const url = new URL('/createUser', apiUrl).href;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        license_id: licenseId,
        LineUserId: lineUserId,
      }),
    });

    if (response.status === 409) {
      throw new Error('User already exists');
    }

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[User Service] Create user failed:', error.message);
    throw error;
  }
}

/**
 * Checks if the license has exceeded the allowed device limit.
 * @returns {Promise<boolean>} True if limit exceeded.
 */
export async function isDeviceLimitExceeded({ licenseId, apiUrl, apiKey }) {
  const url = new URL('/deviceStatus', apiUrl).href;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ license_id: licenseId }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.deviceUsed === undefined || data.deviceLimit === undefined) {
      throw new Error('Invalid response structure from Device Status API');
    }

    return data.deviceUsed >= data.deviceLimit;
  } catch (error) {
    console.error('[User Service] Device limit check failed:', error.message);
    // Fail safe: assume limit is NOT reached to avoid blocking users on network error? 
    // Or assume true for security? Implementing strict check here:
    throw error; 
  }
}

/**
 * Retrieves user information by LINE ID.
 * @returns {Promise<object>} { status: number, data: object }
 */
export async function getUserByLineId({ lineUserId, apiUrl, apiKey }) {
  const url = new URL('/getUser', apiUrl).href;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ LineUserId: lineUserId })
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('[User Service] Get user failed:', error.message);
    throw new Error('Service unavailable. Could not connect to user database.');
  }
}