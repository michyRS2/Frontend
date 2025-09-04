import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboardFormador.css";


const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isSincrono = (tipo) => norm(tipo).includes("sincr");

const DashboardFormador = () => {
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [topicoSelecionado, setTopicoSelecionado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // contagem de quizzes por curso
  const [quizCounts, setQuizCounts] = useState({}); // { [ID_Curso]: number }

  useEffect(() => {
    api
  .get(`/formador/dashboard`, { withCredentials: true })
  .then((res) => {
    setCursos(res.data.cursosDoFormador || []);
    setLoading(false);
  })
  .catch((err) => {
    console.error("Erro ao carregar cursos:", err);
    setError("Erro ao carregar os cursos");
    setLoading(false);
  });

  }, []);

  // buscar nº de quizzes por curso
  useEffect(() => {
    if (!cursos.length) return;
    let alive = true;

    (async () => {
      try {
        const ids = Array.from(new Set(cursos.map((c) => c.ID_Curso).filter(Boolean)));
        const pairs = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`/api/curso/${id}/quizzes/count`, {
                credentials: "include",
              });
              if (!r.ok) return [id, 0];
              const { total } = await r.json();
              return [id, Number(total) || 0];
            } catch {
              return [id, 0];
            }
          })
        );
        if (alive) setQuizCounts(Object.fromEntries(pairs));
      } catch (e) {
        console.error("Erro a obter contagem de quizzes:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [cursos]);

  const categoriasUnicas = [...new Set(cursos.map((c) => c.Categoria).filter(Boolean))];
  const areasUnicas = [
    ...new Set(
      cursos
        .filter((c) => (categoriaSelecionada ? c.Categoria === categoriaSelecionada : true))
        .map((c) => c.Area)
        .filter(Boolean)
    ),
  ];
  const topicosUnicos = [
    ...new Set(
      cursos
        .filter((c) => (categoriaSelecionada ? c.Categoria === categoriaSelecionada : true))
        .filter((c) => (areaSelecionada ? c.Area === areaSelecionada : true))
        .map((c) => c.Topico)
        .filter(Boolean)
    ),
  ];

  const cursosFiltrados = cursos.filter((curso) => {
    return (
      (categoriaSelecionada ? curso.Categoria === categoriaSelecionada : true) &&
      (areaSelecionada ? curso.Area === areaSelecionada : true) &&
      (topicoSelecionado ? curso.Topico === topicoSelecionado : true)
    );
  });

  const handleGerirConteudo = (id) => navigate(`/formador/editar-curso/${id}`);
  const handleNovoQuiz = (id) => navigate(`/formador/cursos/${id}/novo-quiz`);


  if (loading) return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando os seus cursos...</p>
      </div>
  );

  if (error) return (
      <div className="error-container">
        <p>{error}</p>
      </div>
  );

  return (
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard do Formador</h1>
          <p>Gerencie os seus cursos e conteúdos</p>
        </div>

        {/* Filtros */}
        <div className="filtros-section">
          <div className="section-header">
            <h2><i className="fas fa-filter"></i> Filtros</h2>
            <p className="section-description">Filtre os seus cursos por categoria, área ou tópico</p>
          </div>

          <div className="filtros-container">
            <button
                className="btn-toggle-filtros"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <i className={`fas ${mostrarFiltros ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
            </button>

            {mostrarFiltros && (
                <div className="filtros-content">
                  <div className="filtro-group">
                    <h6>Categorias:</h6>
                    <div className="filtro-buttons">
                      <button
                          className={`filtro-btn ${categoriaSelecionada === "" ? "active" : ""}`}
                          onClick={() => {
                            setCategoriaSelecionada("");
                            setAreaSelecionada("");
                            setTopicoSelecionado("");
                          }}
                      >
                        Todas
                      </button>
                      {categoriasUnicas.map((cat) => (
                          <button
                              key={cat}
                              className={`filtro-btn ${categoriaSelecionada === cat ? "active" : ""}`}
                              onClick={() => {
                                setCategoriaSelecionada(cat);
                                setAreaSelecionada("");
                                setTopicoSelecionado("");
                              }}
                          >
                            {cat}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="filtro-group">
                    <h6>Áreas:</h6>
                    <div className="filtro-buttons">
                      <button
                          className={`filtro-btn ${areaSelecionada === "" ? "active" : ""} ${!categoriaSelecionada ? "disabled" : ""}`}
                          onClick={() => setAreaSelecionada("")}
                          disabled={!categoriaSelecionada}
                      >
                        Todas
                      </button>
                      {areasUnicas.map((ar) => (
                          <button
                              key={ar}
                              className={`filtro-btn ${areaSelecionada === ar ? "active" : ""} ${!categoriaSelecionada ? "disabled" : ""}`}
                              onClick={() => {
                                setAreaSelecionada(ar);
                                setTopicoSelecionado("");
                              }}
                              disabled={!categoriaSelecionada}
                          >
                            {ar}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="filtro-group">
                    <h6>Tópicos:</h6>
                    <div className="filtro-buttons">
                      <button
                          className={`filtro-btn ${topicoSelecionado === "" ? "active" : ""} ${!areaSelecionada ? "disabled" : ""}`}
                          onClick={() => setTopicoSelecionado("")}
                          disabled={!areaSelecionada}
                      >
                        Todos
                      </button>
                      {topicosUnicos.map((tp) => (
                          <button
                              key={tp}
                              className={`filtro-btn ${topicoSelecionado === tp ? "active" : ""} ${!areaSelecionada ? "disabled" : ""}`}
                              onClick={() => setTopicoSelecionado(tp)}
                              disabled={!areaSelecionada}
                          >
                            {tp}
                          </button>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Tabela de Cursos */}
        <div className="cursos-section">
          <div className="section-header">
            <h2><i className="fas fa-graduation-cap"></i> Meus Cursos</h2>
            <p className="section-description">{cursosFiltrados.length} curso(s) encontrado(s)</p>
          </div>

          <div className="table-container">
            <table className="cursos-table">
              <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Área</th>
                <th>Tópico</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Estado</th>
                <th>Quizzes</th>
                <th>Ações</th>
              </tr>
              </thead>
              <tbody>
              {cursosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table">Nenhum curso encontrado.</td>
                  </tr>
              ) : (
                  cursosFiltrados.map((curso) => {
                    const quizzesCount =
                        Number(curso.Num_Quizzes ?? curso.num_quizzes ?? curso.quizzesCount) ||
                        quizCounts[curso.ID_Curso] ||
                        0;

                    return (
                        <tr key={curso.ID_Curso}>
                          <td>{curso.Nome_Curso}</td>
                          <td>{curso.Categoria || "—"}</td>
                          <td>{curso.Area || "—"}</td>
                          <td>{curso.Topico || "—"}</td>
                          <td>{new Date(curso.Data_Inicio).toLocaleDateString("pt-PT")}</td>
                          <td>{new Date(curso.Data_Fim).toLocaleDateString("pt-PT")}</td>
                          <td>
                        <span className={`status-badge ${curso.Estado_Curso === 'Ativo' ? 'status-active' : 'status-pending'}`}>
                          {curso.Estado_Curso}
                        </span>
                          </td>
                          <td>{quizzesCount}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                  onClick={() => handleGerirConteudo(curso.ID_Curso)}
                                  className="btn-action primary"
                                  title="Gerir Conteúdo"
                              >
                                <i className="fas fa-cog"></i> Gerir
                              </button>

                              {isSincrono(curso.Tipo_Curso) && (
                                  <button
                                      onClick={() => handleNovoQuiz(curso.ID_Curso)}
                                      className="btn-action secondary"
                                      title="Criar novo quiz para este curso"
                                  >
                                    <i className="fas fa-plus"></i> Quiz
                                  </button>
                              )}
                            </div>
                          </td>
                        </tr>
                    );
                  })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DashboardFormador;