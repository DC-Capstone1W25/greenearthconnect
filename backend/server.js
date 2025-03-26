// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'jsonwebtoken';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';
import schema from './graphql/index.js';
import connectDB from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import aqiRoutes from './routes/aqi.js'; // Import the AQI route

// Workaround to obtain __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
const corsOptions = {
  origin: '*', // 'https://greenearthconnect-2.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // set to true if you need cookies or other credentials
};

// Apply CORS to all routes
app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// GraphQL endpoint with dynamic context (JWT authentication)
app.use(
  '/graphql',
  graphqlHTTP((req) => {
    let token = req.headers.authorization || '';
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('Invalid token:', err.message);
      }
    }

    return {
      schema,
      graphiql: true, // set to false in production
      context: { user },
    };
  })
);

// Mount the chatbot REST endpoint at /api/chat
app.use('/api/chat', chatRoutes);

// Mount the AQI prediction endpoint at /api/aqi
app.use('/api/aqi', aqiRoutes);

// Serve static files from the React build folder (from frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Catch-all route to serve index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`.green.bold);
});
