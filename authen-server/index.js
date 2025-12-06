import * as fs from "fs";

const port = process.env.PORT || 3000;

const hosxpApiKey = process.env.HOSXP_API_KEY;
const hosxpApiUrl = process.env.HOSxP_API_URL;

const userDbApiKey = process.env.USER_DB_API_KEY;
const userDbApiUrl = process.env.USERDB_API_URL;

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
    key: fs.readFileSync('./cert/authen-server.key'),
    cert: fs.readFileSync('./cert/authen-server.crt'),
};
const server = https.createServer(options, app);

app.post("/lineIdAuthen", async (req, res) => {

    // 1. Check user exist
    const {
        LineUserId: lineUserId,
    } = req.body;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userDbApiKey}`,
    };

    const body = JSON.stringify({
        LineUserId: lineUserId,
    });

    const userCheck = await fetch(userDbApiUrl + "/getUser", {
        method: "POST",
        headers: headers,
        body: body,
    });

    const userData = await userCheck.json();

    if (userCheck.status !== 200) {
        return res.status(userCheck.status).json(userData); //Possible status 200, 400, 404, 500
    }

    // 2. Check user is active

    const headers2 = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hosxpApiKey}`,
    };

    const body2 = JSON.stringify({
        license_id: userData.license_id,
    });

    const checkActiveUser = await fetch(hosxpApiUrl + "/checkActiveUser", {
        method: "POST",
        headers: headers2,
        body: body2,
    });

    const isActive = await checkActiveUser.json();

    return res.status(checkActiveUser.status).json(isActive); //Possible status 200, 400, 403, 500
});

server.listen(port, () => {
    console.log(`App listening on PORT: ${port}`);
});