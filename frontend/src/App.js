// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

import NavBar from './components/Navbar';
import Footer from './components/Footer';
import DashboardScreen from './screens/DashboardScreen';
import MapScreen from './screens/MapScreen';
import NewsfeedScreen from './screens/NewsfeedScreen';
import RegisterScreen from './screens/RegisterScreen';
import NotFound from './components/NotFound';
import { Container } from 'react-bootstrap';
import LoginScreen from './screens/LoginScreen'; 
import Chatbot from './components/Chatbot';

const port = process.env.PORT || 5000;

// Handle GraphQL & network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error('[GraphQL error]', message);
    });
  }
  if (networkError) {
    console.error('[Network error]', networkError);
  }
});

// This link reads the token from localStorage and sets the "Authorization" header.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); 
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Base GraphQL endpoint
const httpLink = new HttpLink({
  uri: `http://localhost:${port}/graphql`,
});

// Create a single Apollo Client instance
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, authLink, httpLink]),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="app-wrapper">
          <NavBar />
          <main className="py-3">
            <Container>
              <Routes>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/newsfeed" element={<NewsfeedScreen />} />

                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/login" element={<LoginScreen />} />

                <Route path="/chat" element={<Chatbot />} />

                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </main>
          <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
