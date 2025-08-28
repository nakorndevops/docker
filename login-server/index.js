const path = require('path');

const fs = require('fs');

const express = require('express');
const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT;

const https = require('https');

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
};
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});