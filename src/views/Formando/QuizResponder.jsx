import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://backend-4tkw.onrender.com";

// helper para headers com token
function authHeaders(extra = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export default function ResolverQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErro("");
        setLoading(true);
        const r = await fetch(`${API}/api/quizzes/${quizId}`, {
          credentials: "include",
          headers: authHeaders(),
        });
        if (r.status === 401) {
          if (!alive) return;
          setErro("Sessão expirada. Inicie sessão.");
          return;
        }
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(txt || `HTTP ${r.status}`);
        }
        const q = await r.json();
        if (!alive) return;
        setQuiz(q);
      } catch {
        if (!alive) return;
        setErro("Erro ao obter quiz.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [quizId]);

  const onChange = (idPergunta, idResposta) => {
    setRespostas((m) => ({ ...m, [idPergunta]: idResposta }));
  };

// src/views/Formando/QuizResponder.jsx
// ... resto igual ao teu ...

const onSubmit = async (e) => {
  e.preventDefault();
  setErro("");
  setResultado(null);
  try {
    const r = await fetch(`${API}/api/quizzes/${quizId}/resolver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ respostas }),
    });

    if (r.status === 401) return setErro("Sessão expirada. Inicie sessão.");
    if (r.status === 403) return setErro("Precisa estar inscrito no curso deste quiz para o responder.");
    if (r.status === 404) return setErro("Quiz sem perguntas ou inexistente.");
    if (!r.ok) throw new Error("Falha ao submeter respostas.");

    const data = await r.json();
    setResultado(data);

    // refresca a lista automaticamente depois de 1s
    setTimeout(() => {
      // quiz tem ID_Curso (vem do GET /api/quizzes/:id)
      navigate(`/quiz/curso/${quiz.ID_Curso}`, { replace: true });
    }, 1000);
  } catch {
    setErro("Erro ao submeter respostas.");
  }
};


  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{quiz?.Titulo || "Quiz"}</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {!erro && !quiz && (
        <div className="alert alert-warning">Quiz não encontrado.</div>
      )}

      {!erro && quiz && (
        <>
          <form onSubmit={onSubmit} className="mt-3">
            {quiz.perguntas?.map((p, i) => (
              <div key={p.ID_Pergunta} className="mb-3">
                <strong>
                  {i + 1}. {p.Texto}
                </strong>
                <div className="mt-2">
                  {p.respostas?.map((r) => (
                    <label key={r.ID_Resposta} className="d-block">
                      <input
                        type="radio"
                        name={`p-${p.ID_Pergunta}`}
                        checked={respostas[p.ID_Pergunta] === r.ID_Resposta}
                        onChange={() => onChange(p.ID_Pergunta, r.ID_Resposta)}
                      />{" "}
                      {r.Texto}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn btn-primary">Submeter</button>
          </form>

          {resultado && (
            <div className="alert alert-info mt-3">
              <div>
                <strong>Resultado:</strong> {resultado.corretas}/{resultado.total} (
                {resultado.percent}%)
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
