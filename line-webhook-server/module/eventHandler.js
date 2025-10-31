// File: eventHandler.js

/**
 * This "factory" function creates the handleEvent function.
 * It receives a config object with dependencies.
 */
export function createEventHandler(config) {
  // Destructure all dependencies, including the new logicServerUrl
  const { client, logicServerUrl, logicServerApiKey, userdbApiUrl, userdbApiKey } = config;

  // Validate that all required config is present
  if (!client || !logicServerApiKey || !logicServerUrl) {
    throw new Error(
      "Missing required config: client, logicServerApiKey, or logicServerUrl"
    );
  }

  // This is the actual event handler logic
  return async function handleEvent(event) {
    // 1. Guard Clause: Ignore non-text messages
    if (event.type !== "message" || event.message.type !== "text") {
      return null;
    }

    const { replyToken } = event;
    const { userId: lineUserId } = event.source;
    const { text: sentMessage } = event.message;

    // VerifyUser
    const userDbApiRoute = "getUser"
    const verifyUserRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userdbApiKey}`
      },
      body: JSON.stringify({
        LineUserId: lineUserId
      })
    };
    const verifyUserResponse = await fetch(userdbApiUrl + userDbApiRoute, verifyUserRequestOptions);
    const userStatus = await verifyUserResponse.json();
    console.log(userStatus);
    if (userStatus.error) {
      const replyMessage = {
        "type": "flex",
        "altText": "Register with ProviderID",
        "contents": {
          "type": "bubble",
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
        }
      }
      console.log("No user founded: ", lineUserId);
      await client.replyMessage(replyToken, replyMessage);

    } else {
      console.log("User founded: ", lineUserId);
      try {
        // 2. Bot Logic: Call the external logic server
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${logicServerApiKey}`,
        };

        const body = JSON.stringify({
          sentMessage, // Use ES6 shorthand
          lineUserId,  // Use camelCase
        });

        const response = await fetch(logicServerUrl, {
          method: "POST",
          headers: headers,
          body: body,
        });

        // 3. Response Validation: Check for server errors (e.g., 4xx, 5xx)
        if (!response.ok) {
          // Log the server error for debugging
          const errorBody = await response.text();
          console.error(
            `Logic server error for user ${lineUserId}: ${response.status} ${response.statusText}`,
            errorBody
          );
          // Throw an error to be caught by the main catch block
          throw new Error(`Logic server returned status ${response.status}`);
        }

        // 4. Parse Response and Reply
        const replyMessage = await response.json();
        await client.replyMessage(replyToken, replyMessage);

        console.log(`Successfully replied to user ${lineUserId}`);

      } catch (err) {
        // 5. Main Error Handling: Catch fetch errors, JSON parsing errors, or reply errors
        console.error(
          `Failed to process message for user ${lineUserId}:`,
          err.message
        );

        // 6. User-Facing Error: Try to send a generic error reply
        try {
          await client.replyMessage(replyToken, {
            type: "text",
            text: "Sorry, I couldn't process your request right now. Please try again later.",
          });
        } catch (replyError) {
          // If sending the error reply *also* fails, just log it.
          console.error(
            `Failed to send error reply to token ${replyToken}:`,
            replyError.message
          );
        }
      }
    }
  };
}