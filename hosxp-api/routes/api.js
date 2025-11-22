/**
 * @file routes/api.js
 * @description API Route definitions.
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as hosxpController from "../controllers/hosxpController.js";

const router = express.Router();

// Apply Authentication Middleware globally
router.use(verifyToken);

// --- Routes ---
router.post("/ward", hosxpController.getWardList);
router.post("/checkActiveUser", hosxpController.checkActiveUser);
router.post("/icuBedStatus", hosxpController.getIcuBedStatus);

export default router;