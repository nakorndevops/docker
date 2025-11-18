const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const port = process.env.PORT;

const https = require('https');

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "icu-frontend.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "icu-frontend.crt")),
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'icu.html'));
});

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});