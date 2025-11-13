// routes/chatbot.js
import express from "express";
import * as line from "@line/bot-sdk";

const router = express.Router();

// We use a "factory" here too, to pass in the dependencies
export function createChatbotRouter(handleEvent, lineConfig) {

  // Use the LINE middleware to handle signature validation
  router.post("/chatbot", line.middleware(lineConfig), async (req, res) => {

    // Time Log
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Month is 0-indexed
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const readableTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log("User Message Received Time: ", readableTime); // Example: 2025-11-12 10:03:45

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