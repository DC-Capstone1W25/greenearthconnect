import React from 'react'
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import logo from '../assets/greeneartdconn.jpg';

export default function CustomNavbar() {
  return (
    <Navbar expand="lg" variant="dark" sticky="top">
      <Navbar.Brand href='/'>
        <img src={logo} alt='Diabetes Tracker Logo' className='logo-img' />
        GreenEarth Connect
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse
        id='basic-navbar-nav'
        className='justify-content-between'
      ></Navbar.Collapse>
      <Nav>
        <Nav.Link href="/" className='btn btn-outline-light btn-sm mr-2'>
          Dashboard 
        </Nav.Link>
        <Nav.Link href="/map" className='btn btn-outline-light btn-sm mr-2'>
          Map 
        </Nav.Link>
        <Nav.Link href="/newsfeed" className='btn btn-outline-light btn-sm mr-2'>
          Newsfeed 
        </Nav.Link>
      </Nav>
    </Navbar>
    )
}
