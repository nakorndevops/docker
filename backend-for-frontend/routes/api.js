import express from "express";

const router = express.Router();

/**
 * Creates the main API router and injects all handlers.
 * @param {object} handlers - An object containing all route handlers.
 * @param {function} handlers.linkAccountHandler - Handler for /linkAccount
 * @param {function} handlers.userFoundHandler - Handler for /userFound
 * @returns {object} The configured Express router.
 */
export function createApiRouter({ linkAccountHandler, userFoundHandler }) {
  router.post('/linkAccount', linkAccountHandler);
  router.post('/userFound', userFoundHandler);
  
  return router;
}