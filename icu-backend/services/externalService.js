/**
 * @file services/externalService.js
 * @description Gateway for communicating with internal microservices 
 * (User DB, HOSxP API, ICU DB API).
 */

import { URL } from 'url';

/**
 * Generic HTTP client wrapper.
 * @param {string} url - Full endpoint URL.
 * @param {string} apiKey - Authorization Bearer token.
 * @param {object|null} body - JSON payload (optional).
 * @param {string} method - HTTP Method (default: POST).
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function sendRequest(url, apiKey, body = null, method = 'POST') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);
    
    // Attempt to parse JSON even on error status to capture backend error messages
    const responseData = await response.json().catch(() => ({})); 

    return {
      ok: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`[ExternalService] Network Error calling ${url}:`, error.message);
    // Return a structured error to prevent app crash
    return {
      ok: false,
      status: 503,
      data: { error: "Upstream service unavailable", details: error.message }
    };
  }
}

// --- User Database Service ---

export async function verifyUserByLineId(lineUserId, config) {
  const endpoint = new URL('/getUser', config.services.userDb.url).href;
  return await sendRequest(endpoint, config.services.userDb.key, { LineUserId: lineUserId });
}

// --- HOSxP Service ---

export async function checkHosxpActiveStatus(licenseId, config) {
  const endpoint = new URL('/checkActiveUser', config.services.hosxp.url).href;
  return await sendRequest(endpoint, config.services.hosxp.key, { license_id: licenseId });
}

export async function fetchHosxpBedStatus(config) {
  const endpoint = new URL('/icuBedStatus', config.services.hosxp.url).href;
  // POST with empty body as per API requirement
  return await sendRequest(endpoint, config.services.hosxp.key, {}); 
}

// --- ICU Database Service ---

export async function fetchIcuRiskLevels(config) {
  const endpoint = new URL('/icuBedRisk', config.services.icuDb.url).href;
  return await sendRequest(endpoint, config.services.icuDb.key, {});
}

export async function updateIcuRiskLevel(wardData, config) {
  const endpoint = new URL('/icuBedRiskUpdate', config.services.icuDb.url).href;
  
  // Explicitly destructure to ensure only expected data is sent
  const { ward_code, high_risk, medium_risk, low_risk } = wardData;

  return await sendRequest(endpoint, config.services.icuDb.key, {
    ward_code,
    high_risk,
    medium_risk,
    low_risk
  });
}