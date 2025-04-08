// backend\routes\newsfeed.js
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Helper function to run a Python script and return its output
function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    let result = '';
    const pythonProcess = spawn('python3', [scriptPath, ...args]);

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

// GET /api/newsfeed
router.get('/', async (req, res) => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'newsfeed.py');
  try {
    const result = await runPythonScript(scriptPath);
    const output = JSON.parse(result);
    res.json(output);
  } catch (error) {
    console.error('Error running Python script:', error);
    res.status(500).json({ error: 'Failed to fetch newsfeed data.' });
  }
});

export default router;
