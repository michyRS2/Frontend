import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/CursoCard.css";

const BASE_URL = "https://backend-4tkw.onrender.com";

const CursoCard = ({ curso: initialCurso, hideRatings = false, hideButtons = false }) => {
  const [curso, setCurso] = useState(initialCurso);
  const [hover, setHover] = useState(null);
  const navigate = useNavigate();
    const [quizzesCount, setQuizzesCount] = useState(undefined);


  const image = curso.Imagem || "default-image-url.jpg";
  const formador =
    typeof curso.Formador === "string"
      ? curso.Formador
      : curso.Formador?.Nome || curso.Formador || "Não especificado";

  // Corrigir média para garantir que está sempre entre 0–5
  const ratingRaw = Number(curso.Rating ?? 0);
  const rating = Math.max(0, Math.min(5, ratingRaw));
  const numAval = Number(curso.Numero_Avaliacoes ?? 0);
  const minhaAvaliacao = curso.Minha_Avaliacao ?? null;


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

      // Aplicar correção ao rating devolvido pelo backend
      const ratingCorrigido = Math.max(0, Math.min(5, Number(data.Rating ?? 0)));

      setCurso((c) => ({
        ...c,
        Rating: ratingCorrigido,
        Numero_Avaliacoes: data.Numero_Avaliacoes,
        Minha_Avaliacao: data.Minha_Avaliacao,
      }));
    } catch {
      alert("Não foi possível enviar a avaliação.");
    }
  }

  // Estrelas interativas
  const displayed = hover ?? (minhaAvaliacao ?? 0);
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
            if (minhaAvaliacao === i) handleRate(0); // cancelar avaliação
            else handleRate(i);
          }}
        />
      ))}
    </div>
  );

  const handleVerDetalhes = () => {
    const rota = curso.inscrito
      ? `/cursosInscritos/${curso.ID_Curso}`
      : `/cursos/${curso.ID_Curso}`;
    navigate(rota);
  };

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
              {/* Avaliação do utilizador */}
              {renderStars()}
              

              {/* Média do curso corrigida */}
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                ⭐ {rating.toFixed(2)} ({numAval} classificações)
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
