/**
 * @file routes/api.js
 * @description API Route definitions.
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as orController from "../controllers/orController.js";

const router = express.Router();

// Apply Authentication Middleware globally
router.use(verifyToken);

// --- Routes ---
router.post("/orPatientStatusMonitor", orController.getOrPatientStatus);
router.post("/orPatientStatusMonitorUpdate", orController.updateOrPatientStatus);

export default router;