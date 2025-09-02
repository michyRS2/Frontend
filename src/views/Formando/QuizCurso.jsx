import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const API = "https://backend-4tkw.onrender.com";

function authHeaders(extra = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export default function QuizzesDoCurso() {
  const { id } = useParams(); // ID_Curso
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]); // [{ID_Quiz, Titulo, feito, ultimaPercent, ultimaData}]
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ mediaPercent: null, respondidos: 0, total: 0 });
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      // tenta progresso (precisa de sessão)
      const r = await fetch(`${API}/api/curso/${id}/quizzes/progresso`, {
        credentials: "include",
        headers: authHeaders(),
      });

      if (r.status === 401 || r.status === 403) {
        // sem sessão → lista “simples”
        const alt = await fetch(`${API}/api/curso/${id}/quizzes`, {
          credentials: "include",
          headers: authHeaders(),
        });
        if (!alt.ok) throw new Error("falha");
        const base = await alt.json();
        setItems(base.map((q) => ({ ...q, feito: false, ultimaPercent: null, ultimaData: null })));
        setMeta({ mediaPercent: null, respondidos: 0, total: base.length });
      } else if (r.ok) {
        const data = await r.json();
        setItems(Array.isArray(data.quizzes) ? data.quizzes : []);
        setMeta({
          mediaPercent: data.mediaPercent ?? null,
          respondidos: Number(data.respondidos || 0),
          total: Number(data.total || 0),
        });
      } else {
        const txt = await r.text();
        throw new Error(txt || `HTTP ${r.status}`);
      }
    } catch {
      setErro("Erro ao obter lista de quizzes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // se vier do QuizResponder com refresh
    if (location.state?.refresh) {
      // limpa o state de navegação para não re-disparar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state?.refresh]);

  const abrirQuiz = (ID_Quiz) => navigate(`/quiz/${ID_Quiz}`);

  if (loading) return <p className="container py-3">A carregar…</p>;
  if (erro) return <p className="container py-3 text-danger">{erro}</p>;
  if (!items.length) return <p className="container py-3">Este curso ainda não tem quizzes.</p>;

  return (
    <div className="container py-3">
      <div className="d-flex align-items-end justify-content-between mb-3">
        <h2>Quizzes do Curso #{id}</h2>
        <div className="text-end">
          <div className="small text-muted">
            Feitos: <strong>{meta.respondidos}</strong> / {meta.total}
          </div>
          <div className="small text-muted">
            Média: <strong>{meta.mediaPercent != null ? `${meta.mediaPercent}%` : "—"}</strong>
          </div>
        </div>
      </div>

      <ul className="list-group">
        {items.map((q) => (
          <li key={q.ID_Quiz} className="list-group-item d-flex align-items-center justify-content-between">
            <div className="me-2">
              <div className="fw-semibold">{q.Titulo}</div>
              <div className="small">
                {q.feito ? (
                  <>
                    <span className="badge bg-success me-2">Feito</span>
                    Última: <strong>{q.ultimaPercent}%</strong>
                    {q.ultimaData && (
                      <span className="text-muted ms-2">
                        ({new Date(q.ultimaData).toLocaleDateString("pt-PT")})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="badge bg-secondary">Por fazer</span>
                )}
              </div>
            </div>
            <button
              className={`btn btn-sm ${q.feito ? "btn-outline-primary" : "btn-primary"}`}
              onClick={() => abrirQuiz(q.ID_Quiz)}
            >
              {q.feito ? "Refazer" : "Ver / Responder"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}