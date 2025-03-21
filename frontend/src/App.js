// frontend\src\App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { Container, Button, Modal } from 'react-bootstrap';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import Chatbot from './components/Chatbot';
import './index.css';

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

// Set the "Authorization" header using token from localStorage
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
  const [showChatModal, setShowChatModal] = useState(false);
  const toggleChatModal = () => setShowChatModal((prev) => !prev);

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
                <Route path="/profile" element={<ProfileScreen />} />
                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </main>
          <Footer />

          {/* Floating Chat Bubble Button */}
          <Button
            variant="primary"
            onClick={toggleChatModal}
            className="floating-chat-button"
          >
            Chat
          </Button>

          {/* Chatbot Modal */}
          <Modal
            show={showChatModal}
            onHide={toggleChatModal}
            centered
            className={document.body.classList.contains("dark-mode") ? "modal-dark" : ""}
          >
            <Modal.Header closeButton className={document.body.classList.contains("dark-mode") ? "modal-dark-header" : ""}>
              <Modal.Title>Greenearth Connect Chatbot</Modal.Title>
            </Modal.Header>
            <Modal.Body className={document.body.classList.contains("dark-mode") ? "modal-dark-body" : ""}>
              <Chatbot />
            </Modal.Body>
          </Modal>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
