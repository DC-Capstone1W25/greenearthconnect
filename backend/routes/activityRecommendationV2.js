// backend\routes\activityRecommendationV2.js
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Workaround for __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * Helper function to run a Python script and return its output as a Promise.
 */
function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    let result = '';
    const pythonProcess = spawn('python3', [scriptPath, ...args], {
      cwd: path.dirname(scriptPath)
    });

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
}

/**
 * GET /recommend
 * Expects query parameters:
 *   - age
 *   - gender
 *   - health_condition
 *   - activity_level
 *   - preference
 *   - temperature
 *   - humidity
 *   - wind_speed
 *   - air_quality_index
 *   - crime_rate
 *   - traffic_congestion_index
 *   - community_event
 *   - health_advisory
 */
router.get('/recommend', async (req, res) => {
  const {
    age,
    gender,
    health_condition,
    activity_level,
    preference,
    temperature,
    humidity,
    wind_speed,
    air_quality_index,
    crime_rate,
    traffic_congestion_index,
    community_event,
    health_advisory
  } = req.query;

  if (!(age && gender && health_condition && activity_level && preference &&
        temperature && humidity && wind_speed && air_quality_index &&
        crime_rate && traffic_congestion_index && community_event && health_advisory)) {
    return res.status(400).json({
      error: 'Missing required query parameters: age, gender, health_condition, activity_level, preference, temperature, humidity, wind_speed, air_quality_index, crime_rate, traffic_congestion_index, community_event, health_advisory'
    });
  }

  const args = [
    age, gender, health_condition, activity_level, preference,
    temperature, humidity, wind_speed, air_quality_index,
    crime_rate, traffic_congestion_index, community_event, health_advisory
  ];

  const scriptPath = path.join(__dirname, '..', 'scripts', 'activityrecommendationv2.py');

  try {
    const outputStr = await runPythonScript(scriptPath, args);
    // Assume the last non-empty line is valid JSON.
    const lines = outputStr.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const output = JSON.parse(lastLine);
    res.json(output);
  } catch (error) {
    console.error('Error running Python script:', error);
    res.status(500).json({ error: 'Failed to process recommendation request.' });
  }
});

export default router;
