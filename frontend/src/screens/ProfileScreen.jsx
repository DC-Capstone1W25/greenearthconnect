// frontend/src/screens/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

export default function ProfileScreen() {
  const navigate = useNavigate();
  
  // Get initial values from localStorage
  const initialUsername = localStorage.getItem('username') || '';
  const initialEmail = localStorage.getItem('email') || '';
  const userId = localStorage.getItem('userId'); // Ensure you store this when logging in

  const [formData, setFormData] = useState({
    username: initialUsername,
    email: initialEmail,
    // Optionally, include password if you allow updates to that
  });
  const [success, setSuccess] = useState('');
  const [updateUser, { loading, error }] = useMutation(UPDATE_USER);

  useEffect(() => {
    // Optional: If you want to refresh form data on mount
    setFormData({
      username: initialUsername,
      email: initialEmail,
    });
  }, [initialUsername, initialEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }
    try {
      const result = await updateUser({
        variables: {
          id: userId,
          username: formData.username,
          email: formData.email,
          // Include password if desired: password: formData.password,
        },
      });
      // Update localStorage with new values
      localStorage.setItem('username', result.data.updateUser.username);
      localStorage.setItem('email', result.data.updateUser.email);
      setSuccess('Profile updated successfully!');
      // Optionally, redirect after a short delay:
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Manage Profile</h3>
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error.message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="profileUsername" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="profileEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                {/* Optionally, include password update fields */}
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
