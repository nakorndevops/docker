/**
 * @file controllers/icuController.js
 * @description Business logic for the ICU Dashboard.
 */

import * as externalService from "../services/externalService.js";

// 1. Wrap logic in an async function
async function updateRiskLevels(data, config) {

  // 2. Use for...of loop (Not forEach) to handle await correctly
  for (const ward of data) {
    try {
      // Destructure only the fields you need for the payload
      const { ward_code, high_risk, medium_risk, low_risk } = ward;

      console.log(`Updating Ward ${ward_code}...`);

      // 3. Call the external service
      const response = await externalService.updateIcuRiskLevel(
        { ward_code, high_risk, medium_risk, low_risk },
        config
      );

      console.log(`Success Ward ${ward_code}:`, response);

    } catch (error) {
      console.error(`Failed to update Ward ${ward.ward_code}:`, error);
    }
  }

  console.log('All updates completed.');
}

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

    // Correct bed
    const realBed = {
      "10": 8, // ICU Med
      "17": 36, // RCU
      "22": 8, // ICU Surg
      "24": 5, // ICU CVT
      "41": 10 // CCU
    };

    const correctedData = combinedData.map(ward => {
      // 1. Look up the correct total_beds using the ward_code
      const correctTotal = realBed[ward.ward_code];

      // 2. If a correction exists in realBed, update the object
      if (correctTotal !== undefined) {
        return {
          ...ward, // Copy existing properties (name, risk counts, etc.)
          total_beds: correctTotal,
          available_beds: correctTotal - ward.patient_count // Recalculate available
        };
      }

      // 3. If no correction found, return the original object
      return ward;
    });

    const balancedData = correctedData.map(ward => {
      // Create a copy of the risk values to modify
      let { high_risk, medium_risk, low_risk, patient_count } = ward;

      // Calculate the current sum of risks
      const currentSum = high_risk + medium_risk + low_risk;

      // Case 1: Sum is LESS than patient count (Underflow)
      if (currentSum < patient_count) {
        const missing = patient_count - currentSum;
        // Rule: Add difference to high_risk
        high_risk += missing;
      }

      // Case 2: Sum is GREATER than patient count (Overflow)
      else if (currentSum > patient_count) {
        let surplus = currentSum - patient_count;

        // Rule: Decrease Low -> then Medium -> then High

        // 1. Try to remove from Low
        if (surplus > 0) {
          const deductLow = Math.min(low_risk, surplus); // Don't take more than exists
          low_risk -= deductLow;
          surplus -= deductLow;
        }

        // 2. Try to remove from Medium (if surplus remains)
        if (surplus > 0) {
          const deductMed = Math.min(medium_risk, surplus);
          medium_risk -= deductMed;
          surplus -= deductMed;
        }

        // 3. Try to remove from High (if surplus remains)
        if (surplus > 0) {
          const deductHigh = Math.min(high_risk, surplus);
          high_risk -= deductHigh;
          surplus -= deductHigh;
        }
      }

      // Return the updated object
      return {
        ...ward,
        high_risk,
        medium_risk,
        low_risk
      };
    });

    // Run the function
    updateRiskLevels(balancedData, config);

    res.status(200).json(balancedData);

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