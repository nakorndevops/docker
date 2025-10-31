// routes/chatbot.js
import express from "express";
import * as line from "@line/bot-sdk";

const router = express.Router();

// We use a "factory" here too, to pass in the dependencies
export function createChatbotRouter(handleEvent, lineConfig) {
  
  // Use the LINE middleware to handle signature validation
  router.post("/chatbot", line.middleware(lineConfig), async (req, res) => {
    try {
      const events = req.body.events;
      const results = await Promise.all(events.map(handleEvent));
      res.status(200).json(results);

    } catch (err) {
      console.error("Error processing webhook:", err.message, err.stack);
      // CRITICAL: Always send 200 to LINE, even on failure.
      res.sendStatus(200);
    }
  });

  return router;
}