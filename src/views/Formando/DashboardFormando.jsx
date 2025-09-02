import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import formandoService from "../../services/formandoService";
import CursoCard from "../../components/CursoCard";
import ForumCard from "../../components/ForumCard";
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

  // 2) Quando tivermos cursos, buscar a contagem de quizzes por curso
  useEffect(() => {
    if (!dashboardData) return;

    const ids = new Set();
    (dashboardData.cursosInscritos || []).forEach((c) => ids.add(c.ID_Curso));
    (dashboardData.cursosRecomendados || []).forEach((c) => ids.add(c.ID_Curso));

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
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">A carregar o seu dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );

  const { cursosInscritos, cursosRecomendados, forum, percursoFormativo } = dashboardData;

  return (
    <div className="dashboard-container">
      <Container className="mt-4">
        {/* Cursos Inscritos */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>Cursos Inscritos</h2>
            <p className="section-description">Os cursos em que está atualmente inscrito</p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {(cursosInscritos || []).map((curso) => (
                <div key={curso.ID_Curso} className="carousel-item-card">
                  <CursoCard curso={{ ...curso, inscrito: true }} />
                  {/* badge com nº de quizzes */}
                  <div className="text-center mt-2 small text-muted">
                    Quizzes: <strong>{quizCounts[curso.ID_Curso] ?? "—"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cursos Recomendados */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>Cursos Recomendados</h2>
            <p className="section-description">Baseado no seu perfil e interesses</p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {(cursosRecomendados || []).map((curso) => (
                <div key={curso.ID_Curso} className="carousel-item-card">
                  <CursoCard curso={{ ...curso, inscrito: false }} />
                  {/* badge com nº de quizzes */}
                  <div className="text-center mt-2 small text-muted">
                    Quizzes: <strong>{quizCounts[curso.ID_Curso] ?? "—"}</strong>
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
              <p className="section-description">O seu plano de aprendizagem personalizado</p>
            </div>
            <div className="carousel-container">
              <div className="scroll-carousel">
                {percursoFormativo.map((etapa) => (
                  <div key={etapa.ID_Etapa} className="carousel-item-card">
                    <CursoCard curso={etapa} />
                    {/* se etapa também tiver ID_Curso e quiseres mostrar: */}
                    {etapa.ID_Curso && (
                      <div className="text-center mt-2 small text-muted">
                        Quizzes: <strong>{quizCounts[etapa.ID_Curso] ?? "—"}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Últimos Tópicos do Fórum */}
        <section className="mt-5 carousel-section">
          <div className="section-header">
            <h2>Últimos Tópicos do Fórum</h2>
            <p className="section-description">Participe nas discussões da comunidade</p>
          </div>
          <div className="carousel-container">
            <div className="scroll-carousel">
              {(forum || []).map((topico) => (
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
