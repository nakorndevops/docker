/**
 * @file middleware/auth.js
 * @description Middleware to verify if the requesting user is registered and active.
 */

import * as externalService from "../services/externalService.js";

/**
 * Middleware factory to create the authenticator with config injection.
 */
export function createAuthMiddleware(config) {
  return async (req, res, next) => {
    const { LineUserId: lineUserId } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ error: "Missing LineUserId" });
    }

    try {
      // 1. Check if User exists in User DB
      const userResponse = await externalService.getUserByLineId(lineUserId, config);
      
      if (!userResponse.ok) {
        console.warn(`[Auth] User not found or error: ${lineUserId}`);
        return res.status(userResponse.status).json(userResponse.data);
      }

      const userData = userResponse.data;
      if (!userData || !userData.license_id) {
         return res.status(401).json({ error: "User profile incomplete" });
      }

      // 2. Check if User is Active in HOSxP
      const hosxpResponse = await externalService.checkHosxpActiveUser(userData.license_id, config);

      if (!hosxpResponse.ok) {
        console.warn(`[Auth] User not active in HOSxP: ${userData.license_id}`);
        return res.status(hosxpResponse.status).json(hosxpResponse.data);
      }

      // Attach user info to request for downstream controllers if needed
      req.user = userData;
      
      next();

    } catch (error) {
      console.error(`[Auth] Middleware Error: ${error.message}`);
      res.status(503).json({ error: "Authentication service unavailable" });
    }
  };
}