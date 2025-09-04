import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaClock, FaUsers, FaStar, FaFilter } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../axiosConfig";
import "../../styles/CursoStyles.css";

const CursosTopico = () => {
  const { topicoId } = useParams();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [topico, setTopico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    estado: "todos",
    order: "relevancia"
  });

  useEffect(() => {
    carregarDados();
  }, [topicoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar cursos do tópico
      const resCursos = await api.get(`/topicos/${topicoId}/cursos`);
      setCursos(resCursos.data);
      
      // Carregar informações do tópico
      const resTopicos = await api.get("/topicos");
      const topicoEncontrado = resTopicos.data.find(t => t.ID_Topico === parseInt(topicoId));
      setTopico(topicoEncontrado);
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>A carregar cursos...</p>
        </div>
    );
  }

   return (
      <div className="curso-page">
        <div className="curso-container">
          {/* Cabeçalho */}
          <div className="curso-header">
            <button className="btn-voltar" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              <span className="ms-2">Voltar</span>
            </button>
            <h1>Cursos de {topico?.Nome || "Tópico Desconhecido"}</h1>
            <p>{cursosFiltrados.length} curso(s) disponível(s)</p>
          </div>

          <div className="cursos-layout">
            {/* Sidebar de Filtros */}
            <div className="filtros-sidebar">
              <h5><i className="fas fa-filter"></i> Filtros</h5>

              {/* Filtro por Tipo */}
              <div className="filter-group">
                <h6>Tipo de Curso</h6>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="tipo"
                      checked={filtros.tipo === "todos"}
                      onChange={() => handleFiltroChange("tipo", "todos")}
                  />
                  <span>Todos</span>
                </label>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="tipo"
                      checked={filtros.tipo === "assíncrono"}
                      onChange={() => handleFiltroChange("tipo", "assíncrono")}
                  />
                  <span>Assíncrono</span>
                </label>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="tipo"
                      checked={filtros.tipo === "síncrono"}
                      onChange={() => handleFiltroChange("tipo", "síncrono")}
                  />
                  <span>Síncrono</span>
                </label>
              </div>

              {/* Filtro por Estado */}
              <div className="filter-group">
                <h6>Estado do Curso</h6>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="estado"
                      checked={filtros.estado === "todos"}
                      onChange={() => handleFiltroChange("estado", "todos")}
                  />
                  <span>Todos</span>
                </label>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="estado"
                      checked={filtros.estado === "ativo"}
                      onChange={() => handleFiltroChange("estado", "ativo")}
                  />
                  <span>Ativo</span>
                </label>
                <label className="filtro-radio">
                  <input
                      type="radio"
                      name="estado"
                      checked={filtros.estado === "em curso"}
                      onChange={() => handleFiltroChange("estado", "em curso")}
                  />
                  <span>Em Curso</span>
                </label>
              </div>

              {/* Ordenação */}
              <div className="filter-group">
                <h6>Ordenar por</h6>
                <select
                    value={filtros.order}
                    onChange={(e) => handleFiltroChange("order", e.target.value)}
                    className="form-select"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="nome">Nome (A-Z)</option>
                  <option value="data">Data mais recente</option>
                  <option value="rating">Melhor avaliação</option>
                </select>
              </div>

              {/* Botão Limpar Filtros */}
              <button
                  className="btn-voltar"
                  onClick={() => setFiltros({
                    tipo: "todos",
                    estado: "todos",
                    order: "relevancia"
                  })}
                  style={{ width: '100%', marginTop: '1rem' }}
              >
                Limpar Filtros
              </button>
            </div>

            {/* Lista de Cursos */}
            <div className="cursos-main">
              {cursosFiltrados.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-folder-open"></i>
                    <h4>Nenhum curso encontrado</h4>
                    <p>Tente ajustar os filtros para ver mais resultados</p>
                  </div>
              ) : (
                  <div className="cursos-grid">
                    {cursosFiltrados.map(curso => (
                        <div key={curso.ID_Curso} className="curso-card">
                          {curso.Imagem && (
                              <img
                                  src={curso.Imagem}
                                  alt={curso.Nome_Curso}
                                  className="curso-imagem"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/300x200?text=Sem+Imagem";
                                  }}
                              />
                          )}
                          <div className="curso-info">
                            <div className="curso-badges">
                        <span className={`badge ${curso.Estado_Curso === "ativo" ? "status-active" : curso.Estado_Curso === "em curso" ? "status-pending" : "badge-secondary"}`}>
                          {curso.Estado_Curso}
                        </span>
                              <span className="badge badge-info">
                          {curso.Tipo_Curso}
                        </span>
                            </div>
                            <h3>{curso.Nome_Curso}</h3>

                            <div className="curso-details">
                              <div className="curso-meta">
                                <div>
                                  <i className="fas fa-clock"></i>
                                  <span>{calcularDuracao(curso.Data_Inicio, curso.Data_Fim)} dias</span>
                                </div>
                                {curso.Vagas && (
                                    <div>
                                      <i className="fas fa-users"></i>
                                      <span>{curso.Vagas} vagas</span>
                                    </div>
                                )}
                                <div>
                                  <i className="fas fa-star"></i>
                                  <span>{curso.Rating || 0}</span>
                                </div>
                              </div>

                              <div className="curso-dates">
                                <span>Início: {formatarData(curso.Data_Inicio)}</span>
                                <span>Fim: {formatarData(curso.Data_Fim)}</span>
                              </div>

                              <button
                                  className="btn-voltar"
                                  onClick={() => navigate(`/cursos/${curso.ID_Curso}`)}
                                  style={{ width: '100%' }}
                              >
                                Ver Detalhes
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CursosTopico;