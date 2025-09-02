import React, { useEffect, useState } from "react";
import api from "../../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

  // --------- AGORA NAVEGA PARA A PÁGINA DO NOVO QUIZ ---------
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
    "#d53e4f",
    "#8cd3ff",
    "#Fdae61",
    "#abdda4",
    "#f46d43",
    "#fee08b",
    "#5e4fa2",
    "#66c2a5",
    "#9e0142",
    "#e6f598",
  ];

  const dadosUtilizadores = stats
    ? [
        { nome: "Total", valor: stats.totalUtilizadores || 0 },
        { nome: "Novos este mês", valor: stats.novosUtilizadores || 0 },
        { nome: "Ativos", valor: stats.utilizadoresAtivos || 0 },
      ]
    : [];

  if (loading) return <p>A carregar dados...</p>;
  if (!stats) return <p>Erro ao carregar estatísticas.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard do Gestor</h1>

      {/* --------- GRÁFICOS --------- */}
      <div
        className="p-6 rounded-1xl shadow-md"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: "1.5rem",
          minHeight: 320,
        }}
      >
        {/* Categorias */}
        <div
          style={{
            gridRow: "1 / span 1",
            backgroundColor: "#2e2e2ed2",
            borderRadius: 16,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "right",
            flex: 1,
          }}
        >
          <div className="d-flex justify-content-between">
            <h2 className="text-xl font-semibold text-white">Gestão de Categorias</h2>
            <div className="d-flex">
              <Link
                to="/gestor/gerircategorias"
                className="btn btn-primary py-2 d-flex align-items-center me-2"
              >
                Gerir Categorias
              </Link>
              <Link
                to="/gestor/novacategoria"
                className="btn btn-success p-1 d-flex align-items-center"
              >
                Criar Nova Categoria
              </Link>
            </div>
          </div>

          <div style={{ width: "100%", height: 360, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.cursosPorCategoria}
                    dataKey="total"
                    nameKey="categoria"
                    cx="45%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={0}
                    stroke="#fff"
                    strokeWidth={2}
                    label
                  >
                    {stats.cursosPorCategoria.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={coresDashboard[i % coresDashboard.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="left"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 15 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-white text-sm mt-2 text-center">
              Distribuição dos cursos por categoria
            </p>
          </div>
        </div>

        {/* Utilizadores */}
        <div
          style={{
            backgroundColor: "#2e2e2ed2",
            borderRadius: 16,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "right",
            flex: 1,
          }}
        >
          <div className="d-flex justify-content-between">
            <h2 className="text-xl font-semibold text-white">Estatísticas de Utilizadores</h2>
            <div className="d-flex">
              <Link to="/gestor/gerir-utilizadores"className="btn btn-primary py-2 d-flex align-items-center me-2">
                Gerir utilizadores
              </Link>
            </div>
          </div>
          <div style={{ width: "100%", height: 360, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosUtilizadores}
                    dataKey="valor"
                    nameKey="nome"
                    cx="55%"
                    cy="45%"
                    outerRadius={120}
                    innerRadius={70}
                    stroke="#fff"
                    strokeWidth={2}
                    label
                  >
                    {dadosUtilizadores.map((_, i) => (
                      <Cell key={`cell-user-${i}`} fill={coresDashboard[i % coresDashboard.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 15 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-white text-sm mt-2 text-center">Estatísticas gerais dos utilizadores</p>
          </div>
        </div>
      </div>

      {/* --------- FILTROS --------- */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <h2 className="text-xl font-semibold">Lista de Cursos</h2>
        <div className="d-flex">
          <button
            className={`btn btn-md d-flex align-items-center me-2 ${filtroTipo === "todos" ? "btn-light" : "btn-primary"}`}
            onClick={() => setFiltroTipo("todos")}
          >
            Todos
          </button>
          <button
            className={`btn btn-md d-flex align-items-center me-2 ${filtroTipo === "síncrono" ? "btn-light" : "btn-primary"}`}
            onClick={() => setFiltroTipo("síncrono")}
          >
            Síncronos
          </button>
          <button
            className={`btn btn-md ${filtroTipo === "assíncrono" ? "btn-light" : "btn-primary"}`}
            onClick={() => setFiltroTipo("assíncrono")}
          >
            Assíncronos
          </button>
        </div>
        <div className="align-right mt-3">
          <Link to="/gestor/criar-curso" className="btn btn-success">
            Criar Novo Curso
          </Link>
        </div>
      </div>

      {/* --------- TABELA --------- */}
      {cursosFiltrados.length === 0 ? (
        <p>Não há cursos disponíveis.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-dark text-center">
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

            <tbody className="text-center">
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

                // aceita diferentes nomes de campo (defensivo)
                const quizzesCount = Number(
                  curso.Num_Quizzes ?? curso.num_quizzes ?? curso.quizzesCount ?? 0
                );

                return (
                  <tr key={curso.ID_Curso}>
                    <td>{curso.Nome_Curso}</td>
                    <td>{curso.Tipo_Curso}</td>
                    {mostrarCamposSincronos && (
                      <td>{curso.Tipo_Curso === "síncrono" ? curso.formador?.Nome || "—" : "—"}</td>
                    )}
                    {mostrarCamposSincronos && (
                      <td>{curso.Tipo_Curso === "síncrono" ? curso.Vagas : "—"}</td>
                    )}
                    <td>{dataInicioFormatada}</td>
                    <td>{dataFimFormatada}</td>
                    <td>{estadoFormatado}</td>

                    {/* Nº de quizzes */}
                    <td>{quizzesCount}</td>

                    <td>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditarCurso(curso)}
                          className="btn btn-primary btn-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarCurso(curso)}
                          className="btn btn-danger btn-sm"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => handleAdicionarQuiz(curso)}
                          className="btn btn-success btn-sm"
                          title="Adicionar novo quiz"
                        >
                          + Quiz
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardGestor;