// frontend\src\screens\RegisterScreen.jsx
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '../graphql/mutations';
import { useNavigate, Link } from 'react-router-dom';

function RegisterScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    onError: (error) => {
      setErrorMsg(error.message);
    },
    onCompleted: (data) => {
      // Assuming the mutation returns { registerUser: { token, user: { _id, username } } }
      if (data && data.registerUser) {
        localStorage.setItem('token', data.registerUser.token);
        localStorage.setItem('userId', data.registerUser.user._id);
        localStorage.setItem('username', data.registerUser.user.username);
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
    setErrorMsg('');
    await registerUser({
      variables: {
        username: formData.username,
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
              <h3 className="text-center mb-4">Register</h3>
              {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="registerUsername" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="registerEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="registerPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterScreen;
