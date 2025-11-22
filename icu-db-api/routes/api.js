/**
 * @file routes/api.js
 * @description API Route definitions.
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as icuController from "../controllers/icuController.js";

const router = express.Router();

// Apply Authentication Middleware globally
router.use(verifyToken);

// --- Routes ---
router.post("/icuBedRisk", icuController.getWardRiskLevels);
router.post("/icuBedRiskUpdate", icuController.updateWardRiskLevel);

export default router;