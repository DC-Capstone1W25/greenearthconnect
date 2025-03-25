// frontend/src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

function Chatbot({ aqiTrendData }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // Track dark mode state based on document.body's classes
  const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark-mode'));
  const messagesEndRef = useRef(null);

  // Update dark mode state if document.body's classes change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.body.classList.contains('dark-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // Append the user's message
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: trimmedMessage, timestamp: new Date() }
    ]);
    setLoading(true);

    try {
      // Use a relative URL instead of hardcoding "http://localhost:5000"
      const response = await axios.post('/api/chat', { message: trimmedMessage });
      const reply = response.data.reply;
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: reply, timestamp: new Date() }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to chatbot. Please try again later.', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
      setInputMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) sendMessage();
  };

  // Render messages with dark mode styling
  const renderMessage = (msg, idx) => {
    const isUser = msg.sender === 'user';
    return (
      <div
        key={idx}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            backgroundColor: isUser
              ? (darkMode ? '#3d79f5' : '#007bff')
              : (darkMode ? '#495057' : '#f1f0f0'),
            color: '#fff',
            padding: '10px 15px',
            borderRadius: '20px',
            maxWidth: '70%',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  };

  // Define colors for card and input based on dark mode
  const cardBg = darkMode ? 'dark' : 'light';
  const cardText = darkMode ? 'light' : 'dark';
  const cardBodyBg = darkMode ? '#343a40' : '#f8f9fa';
  const inputBg = darkMode ? '#495057' : '#fff';
  const inputColor = darkMode ? '#fff' : '#000';

  return (
    <Card bg={cardBg} text={cardText}>
      <Card.Header className={`bg-${cardBg} border-0`}>Chatbot</Card.Header>
      <Card.Body style={{ height: '400px', overflowY: 'auto', backgroundColor: cardBodyBg }}>
        {messages.map(renderMessage)}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Spinner animation="border" size="sm" variant={darkMode ? 'light' : 'primary'} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card.Body>
      <Card.Footer className={`bg-${cardBg} border-0`}>
        <Form onSubmit={handleSubmit} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              backgroundColor: inputBg,
              border: 'none',
              color: inputColor
            }}
          />
          <Button variant="primary" type="submit" className="ms-2" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Form>
      </Card.Footer>
    </Card>
  );
}

export default Chatbot;
