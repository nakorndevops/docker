/**
 * @file routes/api.js
 * @description API Route definitions mapping endpoints to controllers.
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// Apply Auth Middleware globally to all routes defined below
router.use(verifyToken);

// User Management Routes
router.post("/unlink", userController.unlinkUser);
router.post("/createUser", userController.createUser);
router.post("/getUser", userController.getUser);

// Device/License Status Routes
router.post("/deviceStatus", userController.getDeviceStatus);

export default router;