/**
 * @file controllers/configController.js
 * @description Serves public configuration to the frontend.
 */

/**
 * Factory function to create the config handler.
 */
export function createConfigHandler(config) {
  return (req, res) => {
    // Only return what is safe and necessary for the frontend
    res.json({
      loginLiffId: config.app.liffIdLogin,
      registerLiffId: config.app.liffIdRegister,
      clientId: config.moph.authClientId
    });
  };
}