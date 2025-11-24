/**
 * @file middleware/auth.js
 * @description Middleware to verify if the requesting LINE user is valid 
 * (Registered in UserDB AND Active in HOSxP).
 */

import * as externalService from "../services/externalService.js";

/**
 * Factory to create the auth middleware with injected config.
 * @param {object} config - Application configuration.
 */
export function createAuthMiddleware(config) {
  return async (req, res, next) => {
    const { LineUserId: lineUserId } = req.body;

    // 1. Validation
    if (!lineUserId) {
      return res.status(400).json({ error: "Missing Parameter: LineUserId" });
    }

    try {
      // 2. Check Registration (User DB)
      const userCheck = await externalService.verifyUserByLineId(lineUserId, config);
      
      if (!userCheck.ok) {
        console.warn(`[Auth] User lookup failed for: ${lineUserId} (${userCheck.status})`);
        return res.status(userCheck.status).json(userCheck.data);
      }

      const userProfile = userCheck.data;
      if (!userProfile || !userProfile.license_id) {
         return res.status(401).json({ error: "Unauthorized: User profile incomplete." });
      }

      // 3. Check Employment Status (HOSxP)
      const employmentCheck = await externalService.checkHosxpActiveStatus(userProfile.license_id, config);

      if (!employmentCheck.ok) {
        console.warn(`[Auth] Inactive Doctor License: ${userProfile.license_id}`);
        // Return 403 Forbidden specifically for inactive users
        return res.status(403).json({ error: "Access Denied: User is not active in Hospital System." });
      }

      // 4. Attach user context for downstream controllers
      req.user = userProfile;
      
      next();

    } catch (error) {
      console.error(`[Auth] Middleware System Error: ${error.message}`);
      res.status(503).json({ error: "Authentication Service Unavailable" });
    }
  };
}