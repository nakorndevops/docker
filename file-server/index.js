const path = require('path');

const fs = require('fs');

const express = require('express');
const app = express();
app.use(express.json());
app.use('/image', express.static(path.join(__dirname, 'image')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/http_error', express.static(path.join(__dirname, 'http_error')));

const port = process.env.PORT || 3006;

const https = require('https');

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "file-server.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "file-server.crt")),
};
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});