/**
 * @file controllers/configController.js
 * @description Serves public configuration to the frontend.
 */

/**
 * Handler to get public frontend configuration.
 * GET /config
 */
export const getConfigHandler = (config) => (req, res) => {
  res.json({
    liffId: config.app.liffId
  });
};