// module/eventHandler.js

// Import the new service functions
import { findUserByLineId } from "../services/userService.js";
import { checkActiveUser } from "../services/hosxpService.js";
import { getBotReply } from "../services/logicService.js";

// --- Reply Message Templates ---
// Store complex replies as constants to keep logic clean
const registerReply = {
  type: "flex",
  altText: "Register with ProviderID",
  contents: {
    "type": "bubble",
    "size": "giga",
    "hero": {
      "type": "image",
      "url": "https://dh.tranghos.moph.go.th/image/provider.png",
      "size": "full"
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "uri",
            "label": "Register with providerID",
            "uri": "https://liff.line.me/2008398299-eV59j9Vd"
          },
          "style": "primary"
        }
      ]
    }
  },
};

const unauthorizedReply = {
  type: "text",
  text: "Forbidden.",
};

const errorReply = {
  type: "text",
  text: "Sorry, I couldn't process your request right now. Please try again later.",
};

// --- Factory Function ---
/**
 * Creates the handleEvent function and injects dependencies.
 */
export function createEventHandler(config) {
  const { client, logicServerUrl, logicServerApiKey, userdbApiUrl, userdbApiKey, hosxpApiUrl, hosxpApiKey } = config;

  // This is the actual event handler, now much flatter
  return async function handleEvent(event) {
    // 1. Guard Clause: Ignore non-text messages
    if (event.type !== "message" || event.message.type !== "text") {
      return null;
    }

    const { replyToken } = event;
    const { userId: lineUserId } = event.source;
    const { text: sentMessage } = event.message;

    try {
      // 2. Check if user exists
      const user = await findUserByLineId(lineUserId, {
        apiUrl: userdbApiUrl,
        apiKey: userdbApiKey,
      });

      // 3. Guard Clause: User not registered
      if (!user) {
        return client.replyMessage(replyToken, registerReply);
      }

      // 4. Check if user is active/authorized
      const isAuthorized = await checkActiveUser(user.license_id, {
        apiUrl: hosxpApiUrl,
        apiKey: hosxpApiKey,
      });

      // 5. Guard Clause: User not authorized
      if (!isAuthorized) {
        return client.replyMessage(replyToken, unauthorizedReply);
      }

      // 6. Main Logic: Get and send the bot's reply
      const replyMessage = await getBotReply(sentMessage, lineUserId, {
        apiUrl: logicServerUrl,
        apiKey: logicServerApiKey,
      });
      return client.replyMessage(replyToken, replyMessage);

    } catch (err) {
      // 7. Main Error Handling
      console.error(
        `Failed to process message for user ${lineUserId}:`,
        err.message
      );
      try {
        // Try to send a generic error reply
        await client.replyMessage(replyToken, errorReply);
      } catch (replyError) {
        console.error(
          `Failed to send error reply to token ${replyToken}:`,
          replyError.message
        );
      }
    }
  };
}