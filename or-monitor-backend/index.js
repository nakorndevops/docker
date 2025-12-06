import * as fs from "fs";

const port = process.env.PORT || 3000;

const hosxpApiKey = process.env.HOSXP_API_KEY;
const hosxpApiUrl = process.env.HOSxP_API_URL;

const orDbApiKey = process.env.OR_API_KEY;
const orDbApiUrl = process.env.OR_API_URL;

const authenServerUrl = process.env.AUTHEN_SERVER_URL;

const liffIdMonitor = process.env.LIFF_ID_MONITOR;
const liffIdCheckpoint = process.env.LIFF_ID_CHECKPOINT;

import express from "express";
const app = express();
app.use(express.json());

import * as https from "https";
const options = {
    key: fs.readFileSync('./cert/or-monitor-backend.key'),
    cert: fs.readFileSync('./cert/or-monitor-backend.crt'),
};
const server = https.createServer(options, app);

// Verify user middleware
const verifyUser = async (req, res, next) => {

    console.log(req.body);

    const headers = {
        "Content-Type": "application/json",
    };

    const body = JSON.stringify({
        LineUserId: req.body.LineUserId,
    });

    const userCheck = await fetch(authenServerUrl + "/lineIdAuthen", {
        method: "POST",
        headers: headers,
        body: body,
    });

    const verifyResult = await userCheck.json();

    console.log(userCheck.status);
    console.log(verifyResult);

    if (userCheck.status !== 200) {
        return res.status(userCheck.status).json(verifyResult);
    } 

    if (userCheck.status === 200) {
        next();
    }

};

app.post("/getLiffIdMonitor", async (req, res) => {
    res.json({ liffId: liffIdMonitor });
});

app.post("/getLiffIdCheckpoint", async (req, res) => {
    res.json({ liffId: liffIdCheckpoint });
});

app.post("/verifyLineId", verifyUser, async (req, res) => {
    res.status(200).json({ status: true });
});

app.post("/getOrPatientStatusMonitor", verifyUser, async (req, res) => {

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${orDbApiKey}`,
    };

    const response = await fetch(orDbApiUrl + "/orPatientStatusMonitor", {
        method: "POST",
        headers: headers,
    });

    const data = await response.json();

    res.status(response.status).json(data);
});


app.post("/updateOrPatientStatusMonitor", verifyUser, async (req, res) => {

    const {
        operation_id: operation_id,
        hn: hn,
        patient_fname: patient_fname,
        patient_lname: patient_lname,
        patient_status: patient_status,
    } = req.body;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${orDbApiKey}`,
    };

    const body = JSON.stringify({
        operation_id: operation_id,
        hn: hn,
        patient_fname: patient_fname,
        patient_lname: patient_lname,
        patient_status: patient_status,
    });

    const response = await fetch(orDbApiUrl + "/orPatientStatusMonitorUpdate", {
        method: "POST",
        headers: headers,
        body: body,
    });

    const data = await response.json();

    res.status(response.status).json(data);
});

app.post("/getOrPatientData", verifyUser, async (req, res) => {

    const {
        hn: hn,
    } = req.body;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hosxpApiKey}`,
    };

    const body = JSON.stringify({
        hn: hn,
    });

    const response = await fetch(hosxpApiUrl + "/patientOperationData", {
        method: "POST",
        headers: headers,
        body: body,
    });

    const data = await response.json();

    res.status(response.status).json(data);
});

server.listen(port, () => {
    console.log(`App listening on PORT: ${port}`);
});