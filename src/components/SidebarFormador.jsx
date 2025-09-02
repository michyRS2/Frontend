import React from "react";
import { Nav } from "react-bootstrap";
import { FaHome, FaBook, FaComments, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const SidebarFormador = () => (
  <Nav className="flex-column p-3 bg-light vh-100" style={{ width: "100%", height: "100%" }}>
    <Nav.Link as={Link} to="/formador/dashboard"><FaHome className="me-2" />Dashboard</Nav.Link>
    <Nav.Link as={Link} to="/formador/perfil"><FaUser className="me-2" />Perfil</Nav.Link>
  </Nav>
);

export default SidebarFormador;
