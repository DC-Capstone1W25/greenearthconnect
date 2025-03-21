// backend\routes\aqi.js
const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.get('/predict', async (req, res) => {
    const { temperature, humidity, wind_speed, precipitation } = req.query;

    if (!temperature || !humidity || !wind_speed || !precipitation) {
        return res.status(400).json({ error: "Missing query parameters." });
    }

    const pythonProcess = spawn('python', [
        'scripts/aqi_prediction.py',
        temperature, humidity, wind_speed, precipitation
    ]);

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json(JSON.parse(result));
        } else {
            res.status(500).json({ error: "Failed to process request." });
        }
    });
});

module.exports = router;
