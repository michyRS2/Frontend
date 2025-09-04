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

  // Função para cor da progress bar
  const getProgressVariant = (percent) => {
    if (percent == null) return "secondary";
    if (percent < 50) return "danger";
    if (percent < 80) return "warning";
    return "success";
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
                        className={
                          q.ultimaPercent < 50
                            ? "bg-danger"
                            : q.ultimaPercent < 80
                            ? "bg-warning"
                            : "bg-success"
                        }
                        animated
                        striped
                      />
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
