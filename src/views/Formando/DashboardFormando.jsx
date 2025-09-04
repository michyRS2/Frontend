import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import formandoService from "../../services/formandoService";
import CursoCard from "../../components/CursoCard";
import ForumCard from "../../components/ForumCard";
import PercursoCard from "../../components/PercursoCard";
import "../../styles/dashboardFormando.css";

const API = "https://backend-4tkw.onrender.com";

const DashboardFormando = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // mapa ID_Curso -> total de quizzes
  const [quizCounts, setQuizCounts] = useState({});

  // 1) Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await formandoService.getDashboard();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
        setError("Erro ao carregar os dados do dashboard");
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // 2) Buscar a contagem de quizzes por curso
  useEffect(() => {
    if (!dashboardData) return;

    const ids = new Set();
    (dashboardData.cursosInscritos || []).forEach((c) => ids.add(c.ID_Curso));
    (dashboardData.cursosRecomendados || []).forEach((c) =>
      ids.add(c.ID_Curso)
    );

    if (ids.size === 0) return;

    let alive = true;
    (async () => {
      try {
        const pairs = await Promise.all(
          Array.from(ids).map(async (id) => {
            try {
              const r = await fetch(`${API}/api/curso/${id}/quizzes/count`, {
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
        console.error("Erro ao obter contagem de quizzes:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [dashboardData]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando o seu dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );

  const { cursosInscritos, cursosRecomendados, forum, percursoFormativo } =
    dashboardData;

  // Calcular estatísticas para exibir
  const totalCursos = cursosInscritos ? cursosInscritos.length : 0;
  const cursosConcluidos = cursosInscritos
    ? cursosInscritos.filter((curso) => curso.Progresso === 100).length
    : 0;
  const progressoMedio =
    cursosInscritos && cursosInscritos.length > 0
      ? Math.round(
          cursosInscritos.reduce(
            (acc, curso) => acc + (curso.Progresso || 0),
            0
          ) / cursosInscritos.length
        )
      : 0;

  return (
    <div className="dashboard-container">
      {/* Header de Boas-Vindas */}
      <div className="dashboard-header">
        <h1>Bem-vindo ao Seu Dashboard</h1>
        <p>Acompanhe seu progresso e descubra novos cursos</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>{totalCursos}</h3>
            <p>Cursos Inscritos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{cursosConcluidos}</h3>
            <p>Cursos Concluídos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>{progressoMedio}%</h3>
            <p>Progresso Médio</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-comments"></i>
          </div>
          <div className="stat-content">
            <h3>{forum ? forum.length : 0}</h3>
            <p>Tópicos do Fórum</p>
          </div>
        </div>
      </div>

      <Container className="mt-4">
        {/* Cursos Inscritos */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-graduation-cap"></i> Cursos Inscritos
            </h2>
            <p className="section-description">
              Os cursos em que está atualmente inscrito
            </p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {cursosInscritos &&
                cursosInscritos.map((curso) => (
                  <div key={curso.ID_Curso} className="carousel-item-card">
                    <CursoCard curso={{ ...curso, inscrito: true }} />

                    {/* badge com nº de quizzes */}
                    <div className="text-center mt-2 small text-muted">
                      Quizzes:{" "}
                      <strong>{quizCounts[curso.ID_Curso] ?? "—"}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Cursos Recomendados */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-lightbulb"></i> Cursos Recomendados
            </h2>
            <p className="section-description">
              Baseado no seu perfil e interesses
            </p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {cursosRecomendados &&
                cursosRecomendados.map((curso) => (
                  <div key={curso.ID_Curso} className="carousel-item-card">
                    <CursoCard curso={{ ...curso, inscrito: false }} />

                    {/* badge com nº de quizzes */}
                    <div className="text-center mt-2 small text-muted">
                      Quizzes:{" "}
                      <strong>{quizCounts[curso.ID_Curso] ?? "—"}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Percurso Formativo */}
        {percursoFormativo && percursoFormativo.length > 0 && (
  <section className="mt-5 carousel-section">
    <div className="section-header">
      <h2>Percurso Formativo</h2>
      <p>O seu plano de aprendizagem personalizado</p>
    </div>
    <div className="carousel-container">
      <div className="scroll-carousel">
        {percursoFormativo.map((etapa) => (
          <div key={etapa.ID_Etapa} className="carousel-item-card">
            <PercursoCard curso={etapa} />
          </div>
        ))}
      </div>
    </div>
  </section>
)}


        {/* Últimos Tópicos do Fórum */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-comments"></i> Últimos Tópicos do Fórum
            </h2>
            <p className="section-description">
              Participe nas discussões da comunidade
            </p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {forum &&
                forum.map((topico) => (
                  <div key={topico.ID_Forum} className="carousel-item-card">
                    <ForumCard topico={topico} />
                  </div>
                ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default DashboardFormando;
