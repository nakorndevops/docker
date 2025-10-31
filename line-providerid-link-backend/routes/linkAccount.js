// routes/linkAccount.js
import express from "express";

const router = express.Router();

// This "factory" creates the router and injects the handler
export function createLinkAccountRouter(linkAccountHandler) {
  router.post('/linkAccount', linkAccountHandler);
  return router;
}