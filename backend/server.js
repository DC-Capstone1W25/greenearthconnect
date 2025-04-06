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
import aqiRoutes from './routes/aqi.js';
import capstoneAqiRoutes from './routes/capstoneairquality.js';
import activityRoutes from './routes/activityRecommender.js';
import activityRoutesV2 from './routes/activityRecommendationV2.js';
import aqiRegressionRoutes from './routes/aqiRegression.js';

// Workaround to obtain __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// Configure CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB();

// GraphQL endpoint with dynamic JWT authentication context
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
      graphiql: true,
      context: { user },
    };
  })
);

// Mount REST endpoints
app.use('/api/chat', chatRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/aqi/capstone', capstoneAqiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/activity/v2', activityRoutesV2);
app.use('/api/aqiRegress', aqiRegressionRoutes);

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Serve plots folder
const plotsPath = path.join(__dirname, 'plots');
console.log(`Serving static files from plots folder at: ${plotsPath}`);
app.use('/plots', express.static(plotsPath));

// Catch-all route for React Router (placed after API and static routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`.green.bold);
});
