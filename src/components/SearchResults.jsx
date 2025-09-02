import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from "react-bootstrap";
import { FaArrowLeft, FaClock, FaUsers, FaStar, FaFilter, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../axiosConfig";
import "../styles/CursosTopico.css";

const SearchResults = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    estado: "todos",
    order: "relevancia"
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q");
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [location]);

  const performSearch = async (term) => {
    if (!term.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.get(
        `/cursos/search?query=${encodeURIComponent(term)}`
      );
      setCursos(response.data);
    } catch (err) {
      setError("Erro na pesquisa. Tente novamente.");
      console.error("Erro na busca:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleFiltroChange = (filtro, valor) => {
    setFiltros(prev => ({
      ...prev,
      [filtro]: valor
    }));
  };

  const filtrarCursos = () => {
    return cursos.filter(curso => {
      // Filtro por tipo
      if (filtros.tipo !== "todos" && curso.Tipo_Curso !== filtros.tipo) {
        return false;
      }
      
      // Filtro por estado
      if (filtros.estado !== "todos" && curso.Estado_Curso !== filtros.estado) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Ordenação
      switch (filtros.order) {
        case "nome":
          return a.Nome_Curso.localeCompare(b.Nome_Curso);
        case "data":
          return new Date(b.Data_Inicio) - new Date(a.Data_Inicio);
        case "rating":
          return (b.Rating || 0) - (a.Rating || 0);
        default:
          return 0;
      }
    });
  };

  const cursosFiltrados = filtrarCursos();

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-PT');
  };

  const calcularDuracao = (dataInicio, dataFim) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">A pesquisar cursos...</p>
      </Container>
    );
  }

  return (
    <Container className="cursos-topico-page">
      {/* Cabeçalho */}
      <div className="page-header">
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft className="me-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1>Resultados da Pesquisa</h1>
        </div>
        
        <p className="text-muted text-center mt-3">
          {cursosFiltrados.length} resultado(s) para "{searchTerm}"
        </p>
      </div>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Row>
        {/* Sidebar de Filtros */}
        <Col md={3} className="filters-sidebar">
          <div className="filters-card">
            <h5><FaFilter className="me-2" />Filtros</h5>
            
            {/* Filtro por Tipo */}
            <div className="filter-group">
              <h6>Tipo de Curso</h6>
              <Form.Check
                type="radio"
                name="tipo"
                label="Todos"
                checked={filtros.tipo === "todos"}
                onChange={() => handleFiltroChange("tipo", "todos")}
              />
              <Form.Check
                type="radio"
                name="tipo"
                label="Assíncrono"
                checked={filtros.tipo === "assíncrono"}
                onChange={() => handleFiltroChange("tipo", "assíncrono")}
              />
              <Form.Check
                type="radio"
                name="tipo"
                label="Síncrono"
                checked={filtros.tipo === "síncrono"}
                onChange={() => handleFiltroChange("tipo", "síncrono")}
              />
            </div>

            {/* Filtro por Estado */}
            <div className="filter-group">
              <h6>Estado do Curso</h6>
              <Form.Check
                type="radio"
                name="estado"
                label="Todos"
                checked={filtros.estado === "todos"}
                onChange={() => handleFiltroChange("estado", "todos")}
              />
              <Form.Check
                type="radio"
                name="estado"
                label="Ativo"
                checked={filtros.estado === "ativo"}
                onChange={() => handleFiltroChange("estado", "ativo")}
              />
              <Form.Check
                type="radio"
                name="estado"
                label="Em Curso"
                checked={filtros.estado === "em curso"}
                onChange={() => handleFiltroChange("estado", "em curso")}
              />
            </div>

            {/* Ordenação */}
            <div className="filter-group">
              <h6>Ordenar por</h6>
              <Form.Select
                value={filtros.order}
                onChange={(e) => handleFiltroChange("order", e.target.value)}
              >
                <option value="relevancia">Relevância</option>
                <option value="nome">Nome (A-Z)</option>
                <option value="data">Data mais recente</option>
                <option value="rating">Melhor avaliação</option>
              </Form.Select>
            </div>

            {/* Botão Limpar Filtros */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setFiltros({
                tipo: "todos",
                estado: "todos",
                order: "relevancia"
              })}
              className="w-100 mt-3"
            >
              Limpar Filtros
            </Button>
          </div>
        </Col>

        {/* Lista de Cursos */}
        <Col md={9}>
          {cursosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <h4>Nenhum curso encontrado</h4>
              <p className="text-muted">
                {searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Digite algo para pesquisar'}
              </p>
            </div>
          ) : (
            <Row>
              {cursosFiltrados.map(curso => (
                <Col key={curso.ID_Curso} lg={6} className="mb-4">
                  <Card className="h-100 curso-card">
                    {curso.Imagem && (
                      <Card.Img 
                        variant="top" 
                        src={curso.Imagem} 
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=Sem+Imagem";
                        }}
                      />
                    )}
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg={
                          curso.Estado_Curso === "ativo" ? "success" : 
                          curso.Estado_Curso === "em curso" ? "warning" : "secondary"
                        }>
                          {curso.Estado_Curso}
                        </Badge>
                        <Badge bg="info" text="dark">
                          {curso.Tipo_Curso}
                        </Badge>
                      </div>
                      
                      <Card.Title className="h5">{curso.Nome_Curso}</Card.Title>
                      
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between text-muted small mb-2">
                          <div className="d-flex align-items-center">
                            <FaClock className="me-1" />
                            <span>{calcularDuracao(curso.Data_Inicio, curso.Data_Fim)} dias</span>
                          </div>
                          {curso.Vagas && (
                            <div className="d-flex align-items-center">
                              <FaUsers className="me-1" />
                              <span>{curso.Vagas} vagas</span>
                            </div>
                          )}
                          <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            <span>{curso.Rating || 0}</span>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between text-muted small mb-3">
                          <span>Início: {formatarData(curso.Data_Inicio)}</span>
                          <span>Fim: {formatarData(curso.Data_Fim)}</span>
                        </div>
                        
                        <Button 
                          variant="primary" 
                          className="w-100"
                          onClick={() => navigate(`/cursos/${curso.ID_Curso}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResults;