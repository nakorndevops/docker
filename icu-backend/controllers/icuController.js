/**
 * @file controllers/icuController.js
 * @description Business logic for the ICU Dashboard.
 */

import * as externalService from "../services/externalService.js";

/**
 * Aggregates data from HOSxP (Bed Counts/Patients) and ICU DB (Risk Levels).
 * POST /icuStatus
 */
export const getIcuStatusHandler = (config) => async (req, res) => {
  try {
    // Parallel execution for performance
    const [hosxpResponse, icuResponse] = await Promise.all([
      externalService.getHosxpIcuBedStatus(config),
      externalService.getIcuRiskLevels(config)
    ]);

    // Validate responses
    if (!hosxpResponse.ok) {
      return res.status(hosxpResponse.status).json(hosxpResponse.data);
    }
    if (!icuResponse.ok) {
      return res.status(icuResponse.status).json(icuResponse.data);
    }

    const wardsData = hosxpResponse.data; // From HOSxP
    const riskData = icuResponse.data;    // From ICU DB

    // --- Data Merging Logic ---
    
    // 1. Create a lookup object (Hash Map) for risk data for O(1) access
    const riskLookup = riskData.reduce((acc, item) => {
      acc[item.ward_code] = item;
      return acc;
    }, {});

    // 2. Merge HOSxP data with Risk data
    const combinedData = wardsData.map(ward => {
      const riskInfo = riskLookup[ward.ward_code] || {};
      
      return {
        ...ward,       // spread ward info (code, name, total_beds, patient_count)
        ...riskInfo    // spread risk info (high, medium, low)
      };
    });

    res.status(200).json(combinedData);

  } catch (error) {
    console.error(`[ICU Controller] Get Status Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Updates the risk levels for a specific ward in the ICU DB.
 * POST /icuBedRiskUpdate
 */
export const updateRiskLevelHandler = (config) => async (req, res) => {
  try {
    const { ward_code, high_risk, medium_risk, low_risk } = req.body;

    // Basic Validation
    if (!ward_code) {
      return res.status(400).json({ error: "Missing ward_code" });
    }

    const response = await externalService.updateIcuRiskLevel(
      { ward_code, high_risk, medium_risk, low_risk }, 
      config
    );

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error(`[ICU Controller] Update Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};