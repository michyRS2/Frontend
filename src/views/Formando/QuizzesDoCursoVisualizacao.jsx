import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, ProgressBar, Container, Row, Col, Badge } from "react-bootstrap";

const API = "https://backend-4tkw.onrender.com";

function authHeaders(extra = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export default function QuizzesDoCursoVisualizacao() {
  const { id } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [meta, setMeta] = useState({
    mediaPercent: null,
    respondidos: 0,
    total: 0,
  });

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch(`${API}/api/curso/${id}/quizzes/progresso`, {
          credentials: "include",
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error("Erro ao obter quizzes");

        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setMeta({
          mediaPercent: data.mediaPercent ?? null,
          respondidos: Number(data.respondidos || 0),
          total: Number(data.total || 0),
        });
      } catch {
        setErro("Não foi possível carregar os quizzes.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading) return <p className="container py-3">A carregar…</p>;
  if (erro) return <p className="container py-3 text-danger">{erro}</p>;
  if (!quizzes.length)
    return <p className="container py-3">Este curso ainda não tem quizzes.</p>;

  // Função para cor da barra de progresso
  const getProgressColor = (percent) => {
    if (percent == null) return "#6c757d"; // cinza
    if (percent < 50) return "#dc3545"; // vermelho
    if (percent < 80) return "#ffc107"; // amarelo
    return "#198754"; // verde
  };

  return (
    <Container className="py-3">
      <h2 className="mb-3">Quizzes Concluídos do Curso #{id}</h2>
      <div className="mb-3 small text-muted">
        Feitos: <strong>{meta.respondidos}</strong> / {meta.total} | Média:{" "}
        <strong>
          {meta.mediaPercent != null ? `${meta.mediaPercent}%` : "—"}
        </strong>
      </div>

      <Row xs={1} md={2} lg={3} className="g-3">
        {quizzes.map((q) => (
          <Col key={q.ID_Quiz}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <Card.Title>{q.Titulo}</Card.Title>
                  {q.feito ? (
                    <>
                      <div className="mb-2">
                        <Badge bg="success" className="me-2">
                          Feito
                        </Badge>
                        {q.ultimaData && (
                          <span className="text-muted">
                            (
                            {new Date(q.ultimaData).toLocaleDateString("pt-PT")}
                            )
                          </span>
                        )}
                      </div>

                      <ProgressBar
                        now={q.ultimaPercent || 0}
                        label={`${q.ultimaPercent || 0}%`}
                        style={{
                          height: "1.5rem",
                          backgroundColor: "#e9ecef",
                          color: "#000",
                          width: "100%",
                        }}
                        className="mb-2"
                      >
                        <div
                          style={{
                            width: `${q.ultimaPercent || 0}%`,
                            height: "100%",
                            backgroundColor: getProgressColor(q.ultimaPercent),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {`${q.ultimaPercent || 0}%`}
                        </div>
                      </ProgressBar>
                    </>
                  ) : (
                    <Badge bg="secondary">Por fazer</Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
