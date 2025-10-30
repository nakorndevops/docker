// File: eventHandler.js

/**
 * This "factory" function creates the handleEvent function.
 * It receives a config object with dependencies (like the client)
 * and returns the async handleEvent function, which has access
 * to those dependencies via a closure.
 */
export function createEventHandler(config) {
  // Destructure the dependencies you need from the config
  const { client, logicServerApiKey } = config;

  // This is the actual event handler logic
  return async function handleEvent(event) {
    // Ignore non-message events or non-text messages
    if (event.type !== "message" || event.message.type !== "text") {
      return null;
    }

    const LineUserID = event.source.userId;
    const replyToken = event.replyToken;
    const sentMessage = event.message.text;

    // Bot Logic Start
    const url = 'https://logic-server:3005/';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${logicServerApiKey}`
    };

    const body = JSON.stringify({
      "sentMessage": sentMessage,
      "LineUserId": LineUserID,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
    const replyMessage = await response.json();

    try {
      // Use the SDK client (from the config) to reply
      await client.replyMessage(replyToken, replyMessage);
    } catch (err) {
      console.error(`Failed to reply to token ${replyToken}:`, err.message);
    }
  };
}