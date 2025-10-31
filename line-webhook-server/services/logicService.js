// services/logicService.js

/**
 * Gets a reply from the main logic server.
 * @returns {object} The LINE reply message object.
 */
export async function getBotReply(sentMessage, lineUserId, { apiUrl, apiKey }) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({
    sentMessage,
    lineUserId,
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      // Log the server error for debugging
      const errorBody = await response.text();
      console.error(
        `Logic server error for user ${lineUserId}: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(`Logic server returned status ${response.status}`);
    }

    return await response.json(); // Return the reply message

  } catch (error) {
    console.error("Error calling Logic Server:", error.message);
    throw new Error("Could not get reply from logic server.");
  }
}