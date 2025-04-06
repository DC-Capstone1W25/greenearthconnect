// backend\routes\aqiRegression.js
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * GET /regression
 * This route runs the air quality regression Python script and returns its JSON output.
 */
router.get('/regression', async (req, res) => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'airquality_regression.py');

  try {
    const outputStr = await runPythonScript(scriptPath);
    // Assume the last non-empty line is valid JSON.
    const lines = outputStr.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const output = JSON.parse(lastLine);
    res.json(output);
  } catch (error) {
    console.error('Error running Python script:', error);
    res.status(500).json({ error: 'Failed to process regression request.' });
  }
});

export default router;
