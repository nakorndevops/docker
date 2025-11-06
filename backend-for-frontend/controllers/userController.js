import * as userService from "../services/userService.js";

/**
 * Creates a handler for checking if a user exists.
 * This handler acts as a proxy to the userdb-api.
 */
export function createUserFoundHandler(env) {

    return async (req, res) => {
        const { LineUserId } = req.body;

        // --- 1. Input Validation ---
        if (!LineUserId) {
            return res.status(400).json({ error: "LineUserId is required" });
        }

        try {
            // --- 2. Call Service ---
            // The service will proxy the request, including status and data
            const { status, data } = await userService.checkUserExists({
                LineUserId: LineUserId,
                apiUrl: env.userdbApiUrl,
                apiKey: env.userDbApiKey,
            });

            // --- 3. Response Forwarding ---
            // Forward the exact status and JSON body from the downstream service
            res.status(status).json(data);

        } catch (error) {
            // --- 4. Network Error Handling ---
            // This catches errors if the service is down
            console.error(`Critical error calling userdb-api: ${error.message}`);
            res.status(503).json({ error: "Service unavailable. Could not connect to user database." });
        }
    };
}