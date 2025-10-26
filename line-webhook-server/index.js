import { checkUserExists } from './module/userdb-api-client.js';
import { LineReply } from './module/sendLineReply.js';

import * as fs from "fs";

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync("./cert/line-webhook-server.key"),
  cert: fs.readFileSync("./cert/line-webhook-server.crt"),
};
const server = https.createServer(options, app);

const port = process.env.PORT;
const line_access_token = process.env.LINE_ACCESS_TOKEN;
const hosxp_apikey = process.env.HOSXP_APIKEY;
const userdb_apikey = process.env.USER_DB_APIKEY;

app.post('/chatbot', async (request, response) => {
  const LineUserID = request.body.events[0].source.userId;
  const replyToken = request.body.events[0].replyToken;
  let replyMessage;
  let userExist;
  // Check User Exist
  try {
    userExist = await checkUserExists(LineUserID, userdb_apikey);
    console.log("API Response:", userExist);
  } catch (error) {
    console.error("Failed to check user:", error.message);
  }
  // User nor exist Reply 
  if (!userExist) {
    // Reply Message

    replyMessage = [
      {
        "type": "bubble",
        "hero": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": "https://dh.tranghos.moph.go.th/image/provider.png",
              "align": "center",
              "aspectMode": "fit",
              "size": "full"
            }
          ],
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://dh.tranghos.moph.go.th/login"
          }
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "Register with ProviderID",
                "uri": "https://dh.tranghos.moph.go.th/login"
              },
              "style": "primary"
            }
          ]
        },
        "styles": {
          "header": {
            "backgroundColor": "#00B900"
          }
        }
      }
    ];


    /*
    replyMessage = [
      {
        type: "text",
        text: "https://dh.tranghos.moph.go.th/"
      }
    ];
    */

    const dataString = JSON.stringify({
      replyToken: replyToken,
      messages: replyMessage
    });
    await LineReply(dataString, line_access_token);
  }
  response.sendStatus(200);
})

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});