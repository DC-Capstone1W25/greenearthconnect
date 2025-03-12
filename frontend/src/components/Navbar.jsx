// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../assets/greeneartdconn.jpg';

export default function CustomNavbar() {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [darkMode, setDarkMode] = useState(false);

  // Update token and username on route change
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUsername(localStorage.getItem('username') || '');
  }, [location]);

  // Toggle dark mode and update the body's class
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
    window.location.href = '/login';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="custom-navbar">
      <Navbar.Brand as={Link} to="/">
        <img
          src={logo}
          alt="GreenEarth Connect Logo"
          style={{ height: '50px', marginRight: '10px' }}
        />
        GreenEarth Connect
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-between">
        <Nav>
          <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/map">Map</Nav.Link>
          <Nav.Link as={Link} to="/newsfeed">Newsfeed</Nav.Link>
        </Nav>
        <Nav>
          {token ? (
            <NavDropdown
              title={
                <span>
                  <FaUserCircle style={{ marginRight: '5px' }} />
                  {username ? `Hello, ${username}` : 'My Account'}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                Manage Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as="div">
                <div className="d-flex align-items-center">
                  <span className="me-2">Dark Mode</span>
                  <Form.Check
                    type="switch"
                    id="dark-mode-switch"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                </div>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
