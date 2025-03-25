// backend\routes\aqi.js
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Workaround for __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/predict', async (req, res) => {
 // console.log('Query parameters:', req.query);

  const { temperature, humidity, wind_speed, precipitation } = req.query;

  if (!temperature || !humidity || !wind_speed || !precipitation) {
    return res.status(400).json({ error: "Missing query parameters." });
  }

  // Build absolute path to the python script
  const scriptPath = path.join(__dirname, '..', 'scripts', 'aqi_prediction.py');

  const pythonProcess = spawn('python', [
    scriptPath,
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
      try {
        res.json(JSON.parse(result));
      } catch (e) {
        console.error('Error parsing JSON output:', e);
        res.status(500).json({ error: "Failed to parse prediction output." });
      }
    } else {
      res.status(500).json({ error: "Failed to process request." });
    }
  });
});

export default router;
