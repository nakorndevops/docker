import express from "express";

const router = express.Router();

/**
 * Configures the main API router.
 * @param {object} handlers - Controller functions.
 */
export function createApiRouter({ linkAccountHandler, userFoundHandler, configHandler }) {
  
  // Public Config Endpoint
  router.get('/config', configHandler);

  // Business Logic Endpoints
  router.post('/linkAccount', linkAccountHandler);
  router.post('/userFound', userFoundHandler);
  
  return router;
}