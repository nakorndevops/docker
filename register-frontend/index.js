const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const port = process.env.PORT;

const https = require('https');

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "register-frontend.key")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "register-frontend.crt")),
};

app.get('/providerid-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'providerid-login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});