// frontend\src\screens\LoginScreen.jsx
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { Link, useNavigate } from 'react-router-dom';

function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onError: (error) => {
      setErrorMsg(error.message);
    },
    onCompleted: (data) => {
      if (data && data.loginUser) {
        localStorage.setItem('token', data.loginUser.token);
        localStorage.setItem('userId', data.loginUser.user._id);
        localStorage.setItem('username', data.loginUser.user.username);
        setErrorMsg('');
        navigate('/dashboard');
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Clear previous errors
    await loginUser({
      variables: {
        email: formData.email,
        password: formData.password,
      },
    });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Login</h3>
              {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" className="mb-3">
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
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                Don't have an account? <Link to="/register">Register</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginScreen;
