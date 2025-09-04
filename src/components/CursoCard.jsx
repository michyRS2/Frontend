import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/CursoCard.css";

const BASE_URL = "https://backend-4tkw.onrender.com";

const CursoCard = ({ curso: initialCurso, hideRatings = false, hideButtons = false }) => {
  const [curso, setCurso] = useState(initialCurso);
  const [hover, setHover] = useState(null);
  const [quizzesCount, setQuizzesCount] = useState(undefined);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const navigate = useNavigate();

  const image = curso.Imagem || "default-image-url.jpg";
  const formador =
    typeof curso.Formador === "string"
      ? curso.Formador
      : curso.Formador?.Nome || curso.Formador || "Não especificado";

  const minhaAvaliacao = curso.Minha_Avaliacao ?? curso.minhaAvaliacao ?? null;

  // buscar nº de quizzes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/curso/${curso.ID_Curso}/quizzes`, {
          credentials: "include",
        });
        if (!alive) return;
        if (r.ok) {
          const arr = await r.json();
          setQuizzesCount(Array.isArray(arr) ? arr.length : 0);
        } else {
          setQuizzesCount(0);
        }
      } catch {
        setQuizzesCount(0);
      }
    })();
    return () => { alive = false; };
  }, [curso.ID_Curso]);

  // buscar avaliações para calcular média
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cursos/${curso.ID_Curso}/avaliacoes`, {
          credentials: "include",
        });
        if (!alive) return;
        if (res.ok) {
          const data = await res.json();
          setAvaliacoes(Array.isArray(data.avaliacoes) ? data.avaliacoes : []);
        } else {
          setAvaliacoes([]);
        }
      } catch {
        setAvaliacoes([]);
      }
    })();
    return () => { alive = false; };
  }, [curso.ID_Curso]);

  // calcular média correta (0 a 5)
  const numAval = avaliacoes.length;
  const rating = numAval
    ? avaliacoes.reduce((sum, a) => sum + Number(a.nota || 0), 0) / numAval
    : 0;

  async function handleRate(nota) {
    try {
      const url = `${BASE_URL}/api/cursos/${curso.ID_Curso}/avaliar`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nota }),
      });
      if (!res.ok) {
        if (res.status === 403) return alert("Tem de estar inscrito para avaliar.");
        if (res.status === 401) return alert("Sessão expirada. Inicie sessão.");
        return alert(`Erro ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      // atualizar avaliação do utilizador
      setCurso((c) => ({
        ...c,
        Minha_Avaliacao: data.Minha_Avaliacao,
        minhaAvaliacao: data.Minha_Avaliacao,
      }));
      // atualizar lista de avaliações para recalcular média
      setAvaliacoes(data.avaliacoes || avaliacoes);
    } catch {
      alert("Não foi possível enviar a avaliação.");
    }
  }

  // estrelas interativas
  const displayed = hover ?? (minhaAvaliacao != null ? minhaAvaliacao : 0);
  const renderStars = () => (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          size={20}
          color={i <= displayed ? "#FFD700" : "#9AA0A6"}
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => {
            if (minhaAvaliacao === i) {
              handleRate(0); // cancelar avaliação
            } else {
              handleRate(i);
            }
          }}
        />
      ))}
    </div>
  );

  // rota de detalhes
  const handleVerDetalhes = () => {
    const rota = curso.inscrito
      ? `/cursosInscritos/${curso.ID_Curso}`
      : `/cursos/${curso.ID_Curso}`;
    navigate(rota);
  };

  // rota da lista de quizzes
  const handleAbrirQuiz = () => {
    navigate(`/quiz/curso/${curso.ID_Curso}`);
  };

  const hasQuiz = Number(quizzesCount) > 0;

  return (
    <div className="CursoCard-wrapper">
      <Card style={{ width: "18rem", overflow: "hidden" }}>
        <div className="card-img-top" style={{ backgroundImage: `url(${image})` }} />
        <Card.Body>
          <Card.Title>{curso.Nome_Curso}</Card.Title>

          <Card.Text>
            <strong>Formador:</strong> {formador}
          </Card.Text>

          {!hideRatings && (
            <Card.Text>
              {/* Estrelas da tua avaliação */}
              {renderStars()}

              {/* Média do curso com estrelas */}
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <FaStar color="#FFD700" size={14} />
                {rating.toFixed(2)} ({numAval} avaliações)
              </div>
            </Card.Text>
          )}

          {!hideButtons && (
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleVerDetalhes}>
                Ver Detalhes
              </Button>
              <Button
                variant={hasQuiz ? "warning" : "outline-secondary"}
                onClick={handleAbrirQuiz}
              >
                Ver Quiz
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CursoCard;
