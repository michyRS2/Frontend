import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { FaBell, FaUser, FaBars } from 'react-icons/fa';

const NavbarGlobal = ({ onMenuClick }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="md" className="px-3">
      <Container fluid>
        <FaBars className="text-white me-3 d-md-none" size={24} onClick={onMenuClick} style={{ cursor: 'pointer' }} />
        <Navbar.Brand href="/">SoftSkills</Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="#"><FaBell /></Nav.Link>
          <Nav.Link href="#"><FaUser /></Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavbarGlobal;
