import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../../axiosConfig";

const API = "https://backend-4tkw.onrender.com";

export default function NovoQuiz() {
  const { id: cursoId } = useParams(); // ID do curso
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // se a rota começar por /formador usamos endpoints do formador
  const isFormador = pathname.startsWith("/formador");

  // base para ler dados do curso (sem /api)
  const CURSO_BASE = `${API}/${isFormador ? "formador" : "gestor"}`;
  // base para criar quiz/perguntas (com /api)
  const QUIZ_API_BASE = `${API}/api/${isFormador ? "formador" : "gestor"}`;

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [perguntas, setPerguntas] = useState([
    {
      texto: "",
      respostas: [
        { texto: "", correta: true },
        { texto: "", correta: false },
      ],
    },
  ]);

  // carregar info do curso (opcional, só para mostrar nome do curso)
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`${CURSO_BASE}/cursos/${cursoId}`, {
          withCredentials: true,
        });
        setCurso(r.data);
      } catch (e) {
        console.error("Erro a obter curso:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [cursoId, CURSO_BASE]);

  // helpers UI
  const addPergunta = () =>
    setPerguntas((prev) => [
      ...prev,
      {
        texto: "",
        respostas: [
          { texto: "", correta: true },
          { texto: "", correta: false },
        ],
      },
    ]);

  const removePergunta = (pi) =>
    setPerguntas((prev) => prev.filter((_, i) => i !== pi));

  const setPerguntaTexto = (pi, value) =>
    setPerguntas((prev) =>
      prev.map((p, i) => (i === pi ? { ...p, texto: value } : p))
    );

  const addResposta = (pi) =>
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i === pi
          ? { ...p, respostas: [...p.respostas, { texto: "", correta: false }] }
          : p
      )
    );

  const setRespostaTexto = (pi, ri, value) =>
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i === pi
          ? {
              ...p,
              respostas: p.respostas.map((r, j) =>
                j === ri ? { ...r, texto: value } : r
              ),
            }
          : p
      )
    );

  const marcarCorreta = (pi, ri) =>
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i === pi
          ? {
              ...p,
              respostas: p.respostas.map((r, j) => ({
                ...r,
                correta: j === ri,
              })),
            }
          : p
      )
    );

  const removeResposta = (pi, ri) =>
    setPerguntas((prev) =>
      prev.map((p, i) =>
        i === pi
          ? { ...p, respostas: p.respostas.filter((_, j) => j !== ri) }
          : p
      )
    );

  // normalizar/validar antes de enviar
  function sanitizePerguntas(raw) {
    return raw
      .map((p) => {
        const texto = (p.texto || "").trim();
        const respostas = (p.respostas || [])
          .map((r) => ({ texto: (r.texto || "").trim(), correta: !!r.correta }))
          .filter((r) => r.texto);

        if (!texto) return null;
        if (respostas.length < 2) return null;

        // garantir pelo menos uma correta
        if (!respostas.some((r) => r.correta)) respostas[0].correta = true;

        return { texto, respostas };
      })
      .filter(Boolean);
  }

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      alert("Indica o título do quiz.");
      return;
    }

    const payloadPerguntas = sanitizePerguntas(perguntas);
    if (!payloadPerguntas.length) {
      alert("Cada pergunta precisa de texto e pelo menos 2 respostas com texto.");
      return;
    }

    try {
      // 1) criar o quiz
      const rQuiz = await api.post(
        `${QUIZ_API_BASE}/cursos/${cursoId}/quizzes`,
        { Titulo: titulo.trim() },
        { withCredentials: true }
      );

      const data = rQuiz.data || {};
      const quizId =
        data?.quiz?.ID_Quiz ?? data?.ID_Quiz ?? data?.id ?? undefined;

      if (!quizId) {
        console.error("Resposta inesperada na criação do quiz:", data);
        alert("Não foi possível obter o ID do quiz criado.");
        return;
      }

      // 2) adicionar perguntas
      const rPerg = await api.post(
        `${QUIZ_API_BASE}/quizzes/${quizId}/perguntas`,
        payloadPerguntas, // também podes enviar { perguntas: payloadPerguntas }
        { withCredentials: true }
      );

      if (!(rPerg.status >= 200 && rPerg.status < 300)) {
        const texto = typeof rPerg.data === "string" ? rPerg.data : "";
        alert(`Erro ao adicionar perguntas: ${texto || rPerg.status}`);
        return;
      }

      alert("Quiz criado com sucesso!");
      navigate(isFormador ? "/formador/dashboard" : "/gestor/dashboard");
    } catch (err) {
      console.error("Erro ao guardar quiz:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Erro ao guardar quiz.";
      alert(msg);
    }
  };

  if (loading) return <div className="p-4">A carregar…</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">
          Novo Quiz {curso?.Nome_Curso ? `– ${curso.Nome_Curso}` : ""}
        </h2>
        <div className="d-flex gap-2">
          <Link to={isFormador ? "/formador/dashboard" : "/gestor/dashboard"} className="btn btn-secondary">
            Voltar
          </Link>
          <button className="btn btn-primary" onClick={handleGuardar}>
            Guardar Quiz
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Título do Quiz</label>
        <input
          className="form-control"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Avaliação Módulo 1"
        />
      </div>

      {perguntas.map((p, pi) => (
        <div key={pi} className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Pergunta #{pi + 1}</strong>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removePergunta(pi)}
              >
                Remover
              </button>
            </div>

            <input
              className="form-control mb-3"
              placeholder="Texto da pergunta"
              value={p.texto}
              onChange={(e) => setPerguntaTexto(pi, e.target.value)}
            />

            {p.respostas.map((r, ri) => (
              <div key={ri} className="input-group mb-2">
                <span className="input-group-text">
                  <input
                    type="radio"
                    className="form-check-input mt-0"
                    checked={r.correta}
                    onChange={() => marcarCorreta(pi, ri)}
                    title="Resposta correta"
                  />
                </span>
                <input
                  className="form-control"
                  placeholder={`Opção ${ri + 1}`}
                  value={r.texto}
                  onChange={(e) => setRespostaTexto(pi, ri, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeResposta(pi, ri)}
                >
                  x
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => addResposta(pi)}
            >
              + Opção
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-outline-primary" onClick={addPergunta}>
        + Pergunta
      </button>
    </div>
  );
}