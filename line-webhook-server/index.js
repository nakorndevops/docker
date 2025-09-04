import * as fs from "fs";

const port = process.env.PORT;

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")), 
};
const server = https.createServer(options, app);

app.get('/', (req, res) => {
  res.sendStatus(200);
})

app.post('/', (req, res) => {
  res.sendStatus(200);
})


server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});