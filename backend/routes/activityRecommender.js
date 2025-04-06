// backend/routes/activityRecommender.js
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
    // Use python3 and set the working directory so that relative paths inside the script resolve
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
 *   - age (e.g., '30')
 *   - time_of_day (e.g., '8') // as a string (will be handled by the Python script)
 *   - aqi (e.g., '45')
 *   - temperature (e.g., '70')
 *   - precipitation (e.g., '0')
 */
router.get('/recommend', async (req, res) => {
  const { age, time_of_day, aqi, temperature, precipitation } = req.query;
  if (!(age && time_of_day && aqi && temperature && precipitation)) {
    return res.status(400).json({
      error: 'Missing required query parameters: age, time_of_day, aqi, temperature, precipitation'
    });
  }

  // Prepare arguments for the Python script.
  const args = [age, time_of_day, aqi, temperature, precipitation];
  // Build the absolute path to the activity_recommender.py script.
  const scriptPath = path.join(__dirname, '..', 'scripts', 'activity_recommender.py');

  try {
    const outputStr = await runPythonScript(scriptPath, args);
    // In case there are extra print statements (e.g. training messages),
    // assume the last non-empty line is valid JSON.
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
