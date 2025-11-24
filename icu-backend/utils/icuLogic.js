/**
 * @file utils/icuLogic.js
 * @description Pure business logic for processing ICU Ward statistics.
 * Handles data merging, bed capacity overrides, and risk count normalization.
 */

// Configuration: Hardcoded bed capacities per business requirements
// Mapping: { WardCode: TotalBeds }
const MANUAL_BED_OVERRIDES = {
  "10": 8,  // ICU Med
  "17": 36, // RCU
  "22": 8,  // ICU Surg
  "24": 5,  // ICU CVT
  "41": 10  // CCU
};

/**
 * Merges HOSxP patient data with ICU Database risk levels.
 * @param {Array} hosxpData - List of wards from HOSxP (contains patient_count).
 * @param {Array} icuRiskData - List of wards from ICU DB (contains risk levels).
 * @returns {Array} Combined data objects.
 */
export function mergeWardData(hosxpData, icuRiskData) {
  // Create a lookup map for O(1) access
  const riskLookupMap = icuRiskData.reduce((map, item) => {
    map[item.ward_code] = item;
    return map;
  }, {});

  return hosxpData.map((ward) => {
    const riskInfo = riskLookupMap[ward.ward_code] || { high_risk: 0, medium_risk: 0, low_risk: 0 };
    return { ...ward, ...riskInfo };
  });
}

/**
 * Applies manual overrides to total bed counts and recalculates availability.
 * @param {Array} wards - List of ward objects.
 * @returns {Array} Wards with corrected capacities.
 */
export function applyBedCapacityOverrides(wards) {
  return wards.map((ward) => {
    const manualTotal = MANUAL_BED_OVERRIDES[ward.ward_code];

    // If no override exists, return original
    if (manualTotal === undefined) return ward;

    return {
      ...ward,
      total_beds: manualTotal,
      available_beds: Math.max(0, manualTotal - ward.patient_count), // Prevent negative available beds
    };
  });
}

/**
 * Normalizes risk counts to ensure (High + Med + Low) === Patient Count.
 * Logic:
 * 1. Underflow: Add difference to High Risk.
 * 2. Overflow: Remove from Low -> Medium -> High.
 * * @param {Array} wards - List of ward objects.
 * @returns {Array} Wards with balanced risk counts.
 */
export function normalizeRiskCounts(wards) {
  return wards.map((ward) => {
    let { high_risk, medium_risk, low_risk, patient_count } = ward;
    const currentTotalRisk = high_risk + medium_risk + low_risk;

    if (currentTotalRisk < patient_count) {
      // Scenario: Data missing. Default extra patients to High Risk.
      const missingCount = patient_count - currentTotalRisk;
      high_risk += missingCount;
    } 
    else if (currentTotalRisk > patient_count) {
      // Scenario: Too many patients marked. Reduce counts starting from Low.
      let surplus = currentTotalRisk - patient_count;

      // 1. Reduce Low
      const reduceLow = Math.min(low_risk, surplus);
      low_risk -= reduceLow;
      surplus -= reduceLow;

      // 2. Reduce Medium (if surplus remains)
      if (surplus > 0) {
        const reduceMed = Math.min(medium_risk, surplus);
        medium_risk -= reduceMed;
        surplus -= reduceMed;
      }

      // 3. Reduce High (if surplus remains - unlikely but safe)
      if (surplus > 0) {
        const reduceHigh = Math.min(high_risk, surplus);
        high_risk -= reduceHigh;
        surplus -= reduceHigh;
      }
    }

    return { ...ward, high_risk, medium_risk, low_risk };
  });
}