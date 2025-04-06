// backend/routes/capstoneairquality.js
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
    const pythonProcess = spawn('python', [scriptPath, ...args]);

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
 * GET /predict
 * Expects query parameters:
 *   - forecast_start (e.g., '2024-11-30')
 *   - forecast_end (e.g., '2025-11-01')
 * 
 * Calls the capstone_airquality.py script with these parameters.
 */
router.get('/predict', async (req, res) => {
  // Extract forecast start and end dates from query parameters.
  const { forecast_start, forecast_end } = req.query;
  const args = [];

  // Use provided dates if available; otherwise, the Python script will use its defaults.
  if (forecast_start && forecast_end) {
    args.push(forecast_start, forecast_end);
  }

  // Build the absolute path to the capstone_airquality.py script.
  const scriptPath = path.join(__dirname, '..', 'scripts', 'capstone_airquality.py');

  try {
    // Run the Python script and wait for its output.
    const result = await runPythonScript(scriptPath, args);
    // Parse the script's output as JSON and send it back to the client.
    const output = JSON.parse(result);
    res.json(output);
  } catch (error) {
    console.error('Error running Python script:', error);
    res.status(500).json({ error: 'Failed to process prediction request.' });
  }
});

export default router;
