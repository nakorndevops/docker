/**
 * @file controllers/icuController.js
 * @description Orchestrates the retrieval and processing of ICU Ward data.
 */

import * as externalService from "../services/externalService.js";
import * as icuLogic from "../utils/icuLogic.js";

/**
 * Background Task: Syncs the normalized/corrected data back to the ICU Database.
 * This runs asynchronously to not block the UI response.
 */
async function syncRiskLevelsToDatabase(wardList, config) {
  for (const ward of wardList) {
    try {
      await externalService.updateIcuRiskLevel(ward, config);
    } catch (error) {
      console.error(`[Sync] Failed to update Ward ${ward.ward_code}:`, error.message);
    }
  }
  // console.log('[Sync] Database synchronization completed.');
}

/**
 * Controller: Aggregates dashboard data.
 * Endpoint: POST /icuStatus
 */
export const getIcuStatusHandler = (config) => async (req, res) => {
  try {
    // 1. Fetch data from external sources in parallel
    const [hosxpResult, icuRiskResult] = await Promise.all([
      externalService.fetchHosxpBedStatus(config),
      externalService.fetchIcuRiskLevels(config)
    ]);

    // 2. Fail fast if upstream services are down
    if (!hosxpResult.ok) {
      console.warn(`[ICU Controller] HOSxP Error: ${hosxpResult.status}`);
      return res.status(hosxpResult.status).json(hosxpResult.data);
    }
    if (!icuRiskResult.ok) {
      console.warn(`[ICU Controller] ICU DB Error: ${icuRiskResult.status}`);
      return res.status(icuRiskResult.status).json(icuRiskResult.data);
    }

    const rawHosxpData = hosxpResult.data;
    const rawRiskData = icuRiskResult.data;

    // 3. Process Data using Business Logic (Pure Functions)
    const mergedData = icuLogic.mergeWardData(rawHosxpData, rawRiskData);
    const capacityCorrectedData = icuLogic.applyBedCapacityOverrides(mergedData);
    const finalBalancedData = icuLogic.normalizeRiskCounts(capacityCorrectedData);

    // 4. Trigger Background Sync (Fire and Forget)
    // We update the DB with the mathematically balanced numbers so the next fetch is accurate
    syncRiskLevelsToDatabase(finalBalancedData, config);

    // 5. Send Response
    res.status(200).json(finalBalancedData);

  } catch (error) {
    console.error(`[ICU Controller] Critical Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error processing ICU data." });
  }
};

/**
 * Controller: Handles manual updates from the frontend.
 * Endpoint: POST /icuBedRiskUpdate
 */
export const updateRiskLevelHandler = (config) => async (req, res) => {
  try {
    const { ward_code, high_risk, medium_risk, low_risk } = req.body;

    if (!ward_code) {
      return res.status(400).json({ error: "Missing required field: ward_code" });
    }

    // Call service
    const updateResult = await externalService.updateIcuRiskLevel(
      { ward_code, high_risk, medium_risk, low_risk },
      config
    );

    res.status(updateResult.status).json(updateResult.data);

  } catch (error) {
    console.error(`[ICU Controller] Update Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error updating risk level." });
  }
};