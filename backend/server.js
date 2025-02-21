// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'jsonwebtoken';
import colors from 'colors';
import schema from './graphql/index.js';
import connectDB from './config/db.js';
import chatRoutes from './routes/chatRoutes.js'; 

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// GraphQL endpoint with dynamic context (JWT authentication)
app.use(
  '/graphql',
  graphqlHTTP((req) => {
    let token = req.headers.authorization || '';

    // Remove "Bearer " if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    let user = null;
    if (token) {
      try {
        // Decode token using the secret from .env
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('Invalid token:', err.message);
      }
    }

    return {
      schema,
      graphiql: true, // Enables GraphiQL interface
      context: { user }, // Attach user to context for resolvers
    };
  })
);

// Mount the chatbot REST endpoint at /api/chat
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('API is running with GraphQL + JWT and Chatbot!');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`.green.bold);
});
