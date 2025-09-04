import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import "../../styles/DashboardGestor.css";

const API = "https://backend-4tkw.onrender.com";

const DashboardGestor = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // --------- LOAD INICIAL ---------
  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resStats, resCursos] = await Promise.all([
          api.get(`${API}/gestor/dashboard`, { withCredentials: true }),
          api.get(`${API}/gestor/cursos`, { withCredentials: true }),
        ]);
        setStats(resStats.data);
        setCursos(Array.isArray(resCursos.data) ? resCursos.data : []);
      } catch (error) {
        console.error("Erro ao carregar dados do gestor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  // --------- AÇÕES DA TABELA ---------
  const handleEditarCurso = (curso) => {
    navigate(`/gestor/cursos/editar/${curso.ID_Curso}`);
  };

  const handleEliminarCurso = async (curso) => {
    if (window.confirm(`Confirmar eliminação do curso "${curso.Nome_Curso}"?`)) {
      try {
        await api.delete(`${API}/gestor/cursos/${curso.ID_Curso}`, {
          withCredentials: true,
        });
        setCursos((prev) => prev.filter((c) => c.ID_Curso !== curso.ID_Curso));
      } catch (error) {
        console.error("Erro ao eliminar curso:", error);
      }
    }
  };

  const handleAdicionarQuiz = (curso) => {
    navigate(`/gestor/cursos/${curso.ID_Curso}/novo-quiz`);
  };

  // --------- FILTROS / DADOS GRÁFICOS ---------
  const cursosFiltrados = cursos.filter((curso) => {
    if (filtroTipo === "todos") return true;
    return (curso.Tipo_Curso || "").toLowerCase() === filtroTipo;
  });

  const mostrarCamposSincronos = cursosFiltrados.some(
    (curso) => curso.Tipo_Curso === "síncrono"
  );

  const coresDashboard = [
    "#2c6fd1", "#ff6b35", "#38a169", "#d53e4f", "#805ad5",
    "#d69e2e", "#319795", "#e53e3e", "#00a3c4", "#0987a0"
  ];

  const dadosUtilizadores = stats
    ? [
        { nome: "Total", valor: stats.totalUtilizadores || 0 },
        { nome: "Novos este mês", valor: stats.novosUtilizadores || 0 },
        { nome: "Ativos", valor: stats.utilizadoresAtivos || 0 },
      ]
    : [];

  if (loading) return (
      <div className="dashboard-gestor loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
  );

  if (!stats) return (
      <div className="dashboard-gestor error">
        <p>Erro ao carregar estatísticas.</p>
      </div>
  );

  return (
    <div className="dashboard-gestor">
        <div className="dashboard-header">
          <h1>Dashboard do Gestor</h1>
          <p>Visão geral da plataforma e estatísticas</p>
        </div>

        {/* --------- ESTATÍSTICAS RÁPIDAS --------- */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalUtilizadores || 0}</h3>
              <p>Total de Utilizadores</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalCursos ?? cursos.length}</h3>
            <p>Total de Cursos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.novosUtilizadores || 0}</h3>
              <p>Novos Utilizadores (Mês)</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.utilizadoresAtivos || 0}</h3>
              <p>Utilizadores Ativos</p>
            </div>
          </div>
        </div>

      {/* --------- GRÁFICOS --------- */}
        <div className="charts-container">
          <div className="chart-wrapper">
            <div className="chart-header">
              <h2>Distribuição por Categoria</h2>
              <div className="chart-actions">
                <Link to="/gestor/gerircategorias" className="btn btn-outline">
                  <i className="fas fa-cog"></i> Gerir Categorias
                </Link>
                <Link to="/gestor/novacategoria" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Nova Categoria
                </Link>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                      data={stats.cursosPorCategoria}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      label
                  >
                    {stats.cursosPorCategoria.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={coresDashboard[i % coresDashboard.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        <div className="chart-wrapper">
            <div className="chart-header">
              <h2>Estatísticas de Utilizadores</h2>
              <div className="chart-actions">
                <Link to="/gestor/gerir-utilizadores" className="btn btn-outline">
                  <i className="fas fa-user-cog"></i> Gerir Utilizadores
                </Link>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosUtilizadores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#2c6fd1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      {/* --------- LISTA DE CURSOS --------- */}
        <div className="courses-section">
          <div className="section-header">
            <h2>Gestão de Cursos</h2>
            <div className="header-actions">
              <div className="filter-buttons">
                <button
                    className={filtroTipo === "todos" ? "btn active" : "btn"}
                    onClick={() => setFiltroTipo("todos")}
                >
                  <i className="fas fa-layer-group"></i> Todos
                </button>
                <button
                    className={filtroTipo === "síncrono" ? "btn active" : "btn"}
                    onClick={() => setFiltroTipo("síncrono")}
                >
                  <i className="fas fa-video"></i> Síncronos
                </button>
                <button
                    className={filtroTipo === "assíncrono" ? "btn active" : "btn"}
                    onClick={() => setFiltroTipo("assíncrono")}
                >
                  <i className="fas fa-clock"></i> Assíncronos
                </button>
              </div>
              <Link to="/gestor/criar-curso" className="btn btn-primary">
                <i className="fas fa-plus"></i> Criar Novo Curso
              </Link>
            </div>
          </div>

      <div className="table-container">
            {cursosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-book-open"></i>
                  <p>Não há cursos disponíveis.</p>
                </div>
            ) : (
                <table className="courses-table">
                  <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    {mostrarCamposSincronos && <th>Formador</th>}
                    {mostrarCamposSincronos && <th>Vagas</th>}
                    <th>Data Início</th>
                    <th>Data Fim</th>
                    <th>Estado</th>
                    <th>Quizzes</th>
                    <th>Ações</th>
                  </tr>
                  </thead>

                  <tbody>
                  {cursosFiltrados.map((curso) => {
                    const dataInicioFormatada = new Date(curso.Data_Inicio).toLocaleDateString("pt-PT");
                    const dataFimFormatada = new Date(curso.Data_Fim).toLocaleDateString("pt-PT");

                    const estadoFormatado = (() => {
                      switch ((curso.Estado_Curso || "").toLowerCase()) {
                        case "ativo":
                          return "Ativo";
                        case "em curso":
                          return "Em curso";
                        case "terminado":
                          return "Terminado";
                        default:
                          return curso.Estado_Curso || "Desconhecido";
                      }
                    })();

                    const quizzesCount = Number(
                        curso.Num_Quizzes ?? curso.num_quizzes ?? curso.quizzesCount ?? 0
                    );

                    return (
                        <tr key={curso.ID_Curso}>
                          <td className="course-name">{curso.Nome_Curso}</td>
                          <td>
                        <span className={`badge ${curso.Tipo_Curso?.toLowerCase()}`}>
                          {curso.Tipo_Curso}
                        </span>
                          </td>
                          {mostrarCamposSincronos && (
                              <td>{curso.Tipo_Curso === "síncrono" ? curso.formador?.Nome || "—" : "—"}</td>
                          )}
                          {mostrarCamposSincronos && (
                              <td>{curso.Tipo_Curso === "síncrono" ? curso.Vagas : "—"}</td>
                          )}
                          <td>{dataInicioFormatada}</td>
                          <td>{dataFimFormatada}</td>
                          <td>
                        <span className={`status-badge ${estadoFormatado.toLowerCase().replace(" ", "-")}`}>
                          {estadoFormatado}
                        </span>
                          </td>
                          <td>
                            <span className="quiz-count">{quizzesCount}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                  onClick={() => handleEditarCurso(curso)}
                                  className="btn-icon"
                                  title="Editar curso"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                  onClick={() => handleAdicionarQuiz(curso)}
                                  className="btn-icon"
                                  title="Adicionar quiz"
                              >
                                <i className="fas fa-plus-circle"></i>
                              </button>
                              <button
                                  onClick={() => handleEliminarCurso(curso)}
                                  className="btn-icon danger"
                                  title="Eliminar curso"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
  );
};

export default DashboardGestor;