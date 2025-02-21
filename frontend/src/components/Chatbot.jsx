// frontend/src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // Append user's message
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: trimmedMessage, timestamp: new Date() }
    ]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const data = await response.json();

      // Append bot's reply
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.reply, timestamp: new Date() }
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
    if (!loading) {
      sendMessage();
    }
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.sender === 'user';
    return (
      <div
        key={idx}
        className={`d-flex my-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
      >
        <div
          className={`p-2 rounded ${isUser ? 'bg-primary text-white' : 'bg-light text-dark'}`}
          style={{ maxWidth: '75%', wordBreak: 'break-word' }}
        >
          {msg.text}
        </div>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-secondary text-white">Chatbot</Card.Header>
            <Card.Body style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              {messages.map(renderMessage)}
              {loading && (
                <div className="d-flex justify-content-center my-2">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </Card.Body>
            <Card.Footer>
              <Form onSubmit={handleSubmit} className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <Button variant="primary" type="submit" className="ms-2" disabled={loading}>
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Chatbot;
