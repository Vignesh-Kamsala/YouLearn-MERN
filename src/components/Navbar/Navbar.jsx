import React from 'react';
import './Navbar.css';
import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';

function Navbar() {
  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm px-3">
      <Container fluid>
        <BootstrapNavbar.Brand href="/" className="d-flex align-items-center">
          <span className="logo-icon me-2">Y</span>
          <span className="logo-text">YouLearn</span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="/dashboard" className="text-primary fw-semibold">Dashboard</Nav.Link>
            <Nav.Link href="/" className="text-dark fw-semibold">Home</Nav.Link>
            <button className="profile-btn ms-3">
              <i className="bi bi-person-fill"></i>
            </button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
