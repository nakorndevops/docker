// config/line.js
import * as line from "@line/bot-sdk";
import { env } from "./env.js"; // Import our validated envs

export const lineConfig = {
  channelAccessToken: env.lineChannelAccessToken,
  channelSecret: env.lineChannelSecret,
};

export const client = new line.Client(lineConfig);