/**
 * @file controllers/userController.js
 * @description Proxy handler to check if a user exists in the database.
 */

import * as userService from "../services/userService.js";

/**
 * Factory function to inject configuration.
 */
export function createUserFoundHandler(config) {

  return async (req, res) => {
    const { LineUserId: lineUserId } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ error: "LineUserId is required" });
    }

    try {
      // Proxy the request to the User DB service
      const { status, data } = await userService.getUserByLineId({
        lineUserId,
        apiUrl: config.internalApis.userDb.url,
        apiKey: config.internalApis.userDb.key,
      });

      // Forward response exactly as received
      res.status(status).json(data);

    } catch (error) {
      console.error(`[UserController] Error: ${error.message}`);
      res.status(503).json({ error: "Service unavailable." });
    }
  };
}