/**
 * @file routes/api.js
 * @description Defines API endpoints for the ICU Backend.
 */

import express from "express";
import { createAuthMiddleware } from "../middleware/auth.js";
import { getIcuStatusHandler, updateRiskLevelHandler } from "../controllers/icuController.js";
import { getConfigHandler } from "../controllers/configController.js";

const router = express.Router();

/**
 * Factory to create routes with dependencies injected.
 */
export function createApiRouter(config) {
  
  // --- Public Routes (No Auth) ---
  // This endpoint serves the LIFF ID to the frontend
  router.get("/config", getConfigHandler(config));

  // --- Protected Routes ---
  // Create a sub-router to apply auth middleware only to specific routes
  const protectedRoutes = express.Router();
  const authMiddleware = createAuthMiddleware(config);

  // Apply authentication middleware to all routes in this sub-router
  protectedRoutes.use(authMiddleware);

  // Get combined status (HOSxP + Risk Levels)
  protectedRoutes.post("/icuStatus", getIcuStatusHandler(config));

  // Update risk levels
  protectedRoutes.post("/icuBedRiskUpdate", updateRiskLevelHandler(config));

  // Mount protected routes to the main router
  router.use("/", protectedRoutes);

  return router;
}