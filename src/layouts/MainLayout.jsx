import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  Offcanvas,
  Container,
  Button,
  Form,
  Spinner
} from "react-bootstrap";
import { FaBars, FaBell, FaUser, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import api from "../axiosConfig.js";
import { FiLogOut } from "react-icons/fi";

import "../styles/MainLayout.css";

import SidebarContentFormando from "../components/SidebarFormando";
import SidebarContentGestor from "../components/SidebarGestor";
import SidebarContentFormador from "../components/SidebarFormador";
import NotificationBell from "../components/NotificationBell";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Obter a role do utilizador
  useEffect(() => {
    const checkAuthAndGetRole = async () => {
      try {
        // Primeiro, tenta obter do localStorage
        const savedRole = localStorage.getItem("role");
        if (savedRole) {
          setUserRole(savedRole);
          setLoading(false);
          return;
        }

        // Se não estiver no localStorage, verifica a autenticação
        const res = await api.get('/auth/check', {
          withCredentials: true,
        });

        const { role } = res.data.user;
        setUserRole(role);
        localStorage.setItem("role", role);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        // Se não estiver autenticado, redireciona para login
        navigate("/login");
      }
    };

    if (!location.pathname.includes("/login")) {
      checkAuthAndGetRole();
    }
  }, [location, navigate]);

  const handleLogout = async () => {
    try {
      await api.post(
        "/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login");
    } catch (err) {
      console.error("Erro ao terminar sessão:", err);
    }
  };

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Buscar cursos em tempo real
  useEffect(() => {
    if (searchTerm.length > 1) {
      const fetchCourses = async () => {
        try {
          const response = await api.get(
            `/cursos/search?query=${encodeURIComponent(
              searchTerm
            )}`
          );
          setSearchResults(response.data);
          setShowResults(true);
        } catch (err) {
          console.error("Erro na busca:", err);
          setSearchResults([]);
        }
      };

      // Debounce para evitar muitas chamadas
      const timer = setTimeout(fetchCourses, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const handleSelectCourse = (courseId, inscrito) => {
    const rota = inscrito
      ? `/cursosInscritos/${courseId}`
      : `/cursos/${courseId}`;
    navigate(rota);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && searchResults.length > 0) {
      const firstCourseId = searchResults[0].id;
      navigate(`/cursos/${firstCourseId}`);
      setSearchTerm("");
      setShowResults(false);
    } else if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  const handleSearchButtonClick = () => {
    if (searchTerm.trim() && searchResults.length > 0) {
      const firstCourseId = searchResults[0].id;
      navigate(`/cursos/${firstCourseId}`);
      setSearchTerm("");
      setShowResults(false);
    } else if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  const hideNavbarRoutes = ["/login", "/register", "/reset-password"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  const getSidebar = () => {
    if (userRole === "gestor") {
      return <SidebarContentGestor />;
    } else if (userRole === "formador") {
      return <SidebarContentFormador />;
    } else if (userRole === "formando") {
      return <SidebarContentFormando />;
    } else {
      return null;
    }
  };

  // Se estiver a carregar, mostra um spinner
  if (loading && !shouldHideNavbar) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {!shouldHideNavbar && (
        <>
          <Navbar bg="dark" variant="dark" expand={false} className="px-3">
            <Button
              variant="link"
              className="text-white me-3"
              onClick={handleShow}
            >
              <FaBars size={24} />
            </Button>
            <Navbar.Brand href="/">SoftSkills</Navbar.Brand>

            {/* Barra de Pesquisa com resultados em tempo real */}
            <div className="position-relative flex-grow-1 me-3" ref={searchRef}>
              <Form onSubmit={handleSearchSubmit}>
                <div className="input-group search-container">
                  <Form.Control
                    type="text"
                    placeholder="Pesquisar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input glassmorphism"
                    onFocus={() =>
                      searchTerm.length > 1 && setShowResults(true)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchSubmit(e);
                      }
                    }}
                  />
                  <Button
                    variant="glass"
                    type="submit"
                    className="search-button glassmorphism"
                    onClick={handleSearchButtonClick}
                  >
                    <FaSearch className="search-icon" />
                  </Button>
                </div>
              </Form>

              {/* Dropdown de resultados */}
              {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((course) => (
                    <div
                      key={course.id}
                      className="search-result-item"
                      onClick={() =>
                        handleSelectCourse(course.id, course.inscrito)
                      }
                    >
                      <div className="course-title">{course.title}</div>
                      <div className="course-info">
                        <span className="course-category">
                          {course.category || "Categoria desconhecida"}
                        </span>

                        {/* Mostrar período em vez de duração */}
                        {course.startDate && course.endDate && (
                          <span className="course-period">
                            {new Date(course.startDate).toLocaleDateString()} -{" "}
                            {new Date(course.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div
                    className="search-result-item view-all"
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                      setSearchTerm("");
                      setShowResults(false);
                    }}
                  >
                    <div className="course-title">Ver todos os resultados</div>
                  </div>
                </div>
              )}

              {/* Mensagem quando não há resultados */}
              {showResults && searchResults.length === 0 && (
                <div className="search-results-dropdown no-results">
                  Nenhum curso encontrado
                </div>
              )}
            </div>

            <Nav className="ms-auto d-flex flex-row align-items-center gap-3">
              <NotificationBell />
              <Button
                variant="link"
                className="text-white p-0"
                onClick={() => navigate("/perfil")}
              >
                <FaUser size={20} />
              </Button>
            </Nav>
          </Navbar>

          <Offcanvas show={showSidebar} onHide={handleClose} backdrop={true}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {getSidebar()}
              <div className="logout-section">
                <hr />
                <button className="logout-link" onClick={handleLogout}>
                  <FiLogOut size={20} className="me-2" />
                  Terminar sessão
                </button>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      )}

      <Container fluid className="dashboard-content">
        <div className="background-animation">
          <div id="circle-small"></div>
          <div id="circle-medium"></div>
          <div id="circle-large"></div>
          <div id="circle-xlarge"></div>
          <div id="circle-xxlarge"></div>
        </div>

        <div id="container-inside">
          <Container fluid className="dashboard-inner">
            <Outlet />
          </Container>
        </div>
      </Container>
    </>
  );
};

export default MainLayout;