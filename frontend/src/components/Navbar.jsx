import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/greeneartdconn.jpg';

export default function CustomNavbar() {
  // Use useLocation to trigger re-renders on route changes
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));

  // When the location changes, update the token from localStorage
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); // update state so Navbar reflects change immediately
    window.location.href = '/login';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
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
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="outline-light" size="sm" as={Link} to="/login">
              Login
            </Button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
