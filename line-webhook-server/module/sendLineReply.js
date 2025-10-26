// Import the 'https' module
import * as https from 'https';

/**
 * Sends a reply message to the LINE Messaging API.
 * This is an async function that returns a Promise.
 *
 * @param {string} dataString - The JSON string payload for the reply.
 * @param {string} line_access_token - The channel access token.
 * @returns {Promise<object>} A promise that resolves with the status code and body of the API response.
 */
export async function LineReply(dataString, line_access_token) {
  console.log("Attempting to send reply:", dataString, line_access_token);

  // Request header.
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + line_access_token,
  };

  // Options for the https.request method
  const webhookOptions = {
    hostname: "api.line.me",
    path: "/v2/bot/message/reply",
    method: "POST",
    headers: headers,
  };

  // Wrap the request in a Promise to make it compatible with async/await
  return new Promise((resolve, reject) => {
    // Define our request
    const request = https.request(webhookOptions, (res) => {
      let responseBody = '';

      // Collect data chunks as they come in
      res.on("data", (d) => {
        responseBody += d;
      });

      // When the response is complete, resolve the promise
      res.on("end", () => {
        console.log(`API Response Status: ${res.statusCode}`);
        process.stdout.write("API Response Body: " + responseBody + "\n");
        // Resolve with a useful object
        resolve({
          statusCode: res.statusCode,
          body: responseBody
        });
      });
    });

    // Handle request errors
    request.on("error", (err) => {
      console.error("Error with LINE API request:", err);
      // Reject the promise if an error occurs
      reject(err);
    });

    // Write the payload data to the request body
    request.write(dataString);
    // Finalize the request
    request.end();
  });
}
