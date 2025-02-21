// backend\routes\chatRoutes.js
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    // Extract the user's message from the request body
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call the OpenAI Chat Completion API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: message }],
      }),
    });

    // Check if the response from OpenAI API is OK (status 200)
    if (!response.ok) {
      const errorDetails = await response.json(); // Extract error details
      console.error('OpenAI API error:', errorDetails);
      return res.status(response.status).json({ error: 'Failed to fetch from OpenAI API', details: errorDetails });
    }

    const data = await response.json();

    // Ensure we got a valid response from OpenAI
    if (!data.choices || data.choices.length === 0) {
      console.error('Unexpected API response structure:', data);
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    // Extract the chatbot's reply
    const chatbotReply = data.choices[0].message.content || 'Sorry, I didn’t catch that. Could you try again?';

    res.json({ reply: chatbotReply });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Something went wrong with the chatbot API.', details: error.message });
  }
});

export default router;
