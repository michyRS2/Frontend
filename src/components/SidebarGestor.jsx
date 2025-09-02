import React from "react";
import { Nav } from "react-bootstrap";
import { FaUsers, FaChartBar, FaCog } from "react-icons/fa";
import { Link } from "react-router-dom";

const SidebarGestor = () => (
  <Nav className="flex-column p-3 bg-light vh-100" style={{ width: "100%", height: "100%" }}>
    <Nav.Link as={Link} to="/gestor/dashboard"><FaChartBar className="me-2" />Dashboard</Nav.Link>
    <Nav.Link as={Link} to="/gestor/gerir-utilizadores"><FaUsers className="me-2" />Utilizadores</Nav.Link>
    <Nav.Link as={Link} to="/gestor/configuracoes"><FaCog className="me-2" />Configurações</Nav.Link>
  </Nav>
);
export default SidebarGestor;