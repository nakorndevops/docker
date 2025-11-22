/**
 * @file services/externalService.js
 * @description Handles communication with external internal microservices 
 * (User DB, HOSxP API, ICU DB API).
 */

import { URL } from 'url';

/**
 * generic helper for fetching data with error handling
 */
async function fetchApi(url, apiKey, body = null, method = 'POST') {
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
    
    // Parse JSON regardless of status to get error messages if available
    const data = await response.json().catch(() => ({})); 

    return {
      ok: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error(`[ExternalService] Fetch failed for ${url}:`, error.message);
    throw new Error(`Service Unavailable: ${error.message}`);
  }
}

// --- User DB Services ---

export async function getUserByLineId(lineUserId, config) {
  const url = new URL('/getUser', config.services.userDb.url).href;
  return await fetchApi(url, config.services.userDb.key, { LineUserId: lineUserId });
}

// --- HOSxP Services ---

export async function checkHosxpActiveUser(licenseId, config) {
  const url = new URL('/checkActiveUser', config.services.hosxp.url).href;
  return await fetchApi(url, config.services.hosxp.key, { license_id: licenseId });
}

export async function getHosxpIcuBedStatus(config) {
  const url = new URL('/icuBedStatus', config.services.hosxp.url).href;
  // No body needed for this specific endpoint based on previous code
  return await fetchApi(url, config.services.hosxp.key, {}); 
}

// --- ICU DB Services ---

export async function getIcuRiskLevels(config) {
  const url = new URL('/icuBedRisk', config.services.icuDb.url).href;
  return await fetchApi(url, config.services.icuDb.key, {});
}

export async function updateIcuRiskLevel(payload, config) {
  const url = new URL('/icuBedRiskUpdate', config.services.icuDb.url).href;
  const { ward_code, high_risk, medium_risk, low_risk } = payload;
  
  return await fetchApi(url, config.services.icuDb.key, {
    ward_code,
    high_risk,
    medium_risk,
    low_risk
  });
}