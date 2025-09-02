import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://backend-4tkw.onrender.com";

const NovoCurso = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("síncrono");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [vagas, setVagas] = useState("");
  const [imagem, setImagem] = useState("");
  const [objetivos, setObjetivos] = useState([""]);
  const [includes, setIncludes] = useState([""]);
  const [topicoId, setTopicoId] = useState("");

  const [categoriaId, setCategoriaId] = useState("");
  const [areaId, setAreaId] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [formadores, setFormadores] = useState([]);
  const [formadorId, setFormadorId] = useState("");
  const [erroDatas, setErroDatas] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ---------- ESTADO DO QUIZ ----------
  const [addQuiz, setAddQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      texto: "",
      respostas: [
        { texto: "", correta: true },
        { texto: "", correta: false },
      ],
    },
  ]);

  // ---------- LOADS ----------
  useEffect(() => {
    fetch(`${API}/categorias`).then((r) => r.json()).then(setCategorias);
  }, []);

  useEffect(() => {
    if (categoriaId) {
      fetch(`${API}/areas?categoriaId=${categoriaId}`).then((r) => r.json()).then(setAreas);
    }
  }, [categoriaId]);

  useEffect(() => {
    if (areaId) {
      fetch(`${API}/topicos?areaId=${areaId}`).then((r) => r.json()).then(setTopicos);
    }
  }, [areaId]);

  // quando for SÍNCRONO: carrega formadores e DESATIVA a criação de quiz
  useEffect(() => {
    if (isSincronoTipo(tipo)) {
      // força o toggle off se mudar para síncrono
      if (addQuiz) setAddQuiz(false);
      // carrega formadores
      fetch(`${API}/gestor/formadores`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Acesso negado");
          return res.json();
        })
        .then(setFormadores)
        .catch((err) => console.error("Erro ao carregar formadores:", err));
    }
  }, [tipo]); // eslint-disable-line

  // ---------- VALIDADORES DATAS ----------
  const onChangeDataInicio = (e) => {
    const novaData = e.target.value;
    setDataInicio(novaData);
    if (dataFim && novaData > dataFim)
      setErroDatas("A data de início não pode ser posterior à data de fim.");
    else setErroDatas("");
  };
  const onChangeDataFim = (e) => {
    const novaData = e.target.value;
    setDataFim(novaData);
    if (dataInicio && novaData < dataInicio)
      setErroDatas("A data de fim não pode ser anterior à data de início.");
    else setErroDatas("");
  };

  // ---------- LISTAS OBJETIVOS/INCLUDES ----------
  const removerObjetivo = (idx) =>
    setObjetivos((arr) => arr.filter((_, i) => i !== idx));
  const removerInclude = (idx) =>
    setIncludes((arr) => arr.filter((_, i) => i !== idx));

  // ---------- HELPERS QUIZ ----------
  const addQuestion = () => {
    setQuestions((q) => [
      ...q,
      {
        texto: "",
        respostas: [
          { texto: "", correta: true },
          { texto: "", correta: false },
        ],
      },
    ]);
  };
  const removeQuestion = (qi) =>
    setQuestions((q) => q.filter((_, i) => i !== qi));
  const setQuestionText = (qi, value) =>
    setQuestions((q) =>
      q.map((p, i) => (i === qi ? { ...p, texto: value } : p))
    );
  const addAnswer = (qi) =>
    setQuestions((q) =>
      q.map((p, i) =>
        i === qi
          ? { ...p, respostas: [...p.respostas, { texto: "", correta: false }] }
          : p
      )
    );
  const setAnswerText = (qi, ai, value) =>
    setQuestions((q) =>
      q.map((p, i) =>
        i === qi
          ? {
              ...p,
              respostas: p.respostas.map((r, j) =>
                j === ai ? { ...r, texto: value } : r
              ),
            }
          : p
      )
    );
  const markCorrect = (qi, ai) =>
    setQuestions((q) =>
      q.map((p, i) =>
        i === qi
          ? {
              ...p,
              respostas: p.respostas.map((r, j) => ({
                ...r,
                correta: j === ai,
              })),
            }
          : p
      )
    );
  const removeAnswer = (qi, ai) =>
    setQuestions((q) =>
      q.map((p, i) =>
        i === qi
          ? { ...p, respostas: p.respostas.filter((_, j) => j !== ai) }
          : p
      )
    );

  // Normaliza e valida perguntas antes de enviar
  function sanitizeQuestions(raw) {
    const cleaned = raw
      .map((p) => {
        const texto = (p.texto || "").trim();
        const respostas = (p.respostas || [])
          .map((r) => ({
            texto: (r.texto || "").trim(),
            correta: !!r.correta,
          }))
          .filter((r) => r.texto);

        if (respostas.length < 2) return null;
        if (!respostas.some((r) => r.correta)) respostas[0].correta = true;
        return { texto, respostas };
      })
      .filter(Boolean);

    return cleaned;
  }

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (erroDatas) {
      alert(erroDatas);
      return;
    }

    const dadosBase = {
      Nome_Curso: nome,
      Tipo_Curso: tipo,
      Descricao: descricao,
      Data_Inicio: dataInicio,
      Data_Fim: dataFim,
      Imagem: imagem || null,
      ID_Topico: parseInt(topicoId, 10),
    };

    const novoCurso =
      isSincronoTipo(tipo)
        ? { ...dadosBase, Vagas: parseInt(vagas, 10), ID_Formador: parseInt(formadorId, 10) }
        : {
            ...dadosBase,
            Vagas: null,
            ID_Formador: null,
            Objetivos: objetivos.filter((o) => o.trim() !== ""),
            Includes: includes.filter((i) => i.trim() !== ""),
          };

    if (isSincronoTipo(tipo)) {
      const vagasNum = Number(vagas);
      if (!Number.isFinite(vagasNum) || vagasNum < 1 || vagasNum > 300) {
        alert("Insira um número de vagas entre 1 e 300.");
        return;
      }
    }

    try {
      // 1) cria curso
      const res = await fetch(`${API}/gestor/cursos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(novoCurso),
      });

      if (!res.ok) {
        alert("Erro ao criar curso.");
        return;
      }
      const data = await res.json();
      const { ID_Curso } = data;

      // 2) Apenas para ASSÍNCRONO é permitido criar quiz pelo gestor
      if (isAssincronoTipo(tipo) && addQuiz) {
        if (!quizTitle.trim()) {
          alert("Indica o título do quiz.");
          return;
        }

        const rQuiz = await fetch(`${API}/api/gestor/cursos/${ID_Curso}/quizzes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ Titulo: quizTitle }),
        });
        if (!rQuiz.ok) {
          const t = await rQuiz.text();
          alert(`Erro ao criar quiz: ${t || rQuiz.status}`);
          return;
        }

        const quizResp = await rQuiz.json();
        const ID_Quiz = quizResp?.quiz?.ID_Quiz ?? quizResp?.ID_Quiz ?? null;
        if (!ID_Quiz) {
          alert("Não foi possível obter o ID do quiz criado.");
          return;
        }

        const payload = sanitizeQuestions(questions);
        if (!payload.length) {
          alert("Cada pergunta precisa de texto e pelo menos 2 respostas com texto.");
          return;
        }

        const rPerg = await fetch(`${API}/api/gestor/quizzes/${ID_Quiz}/perguntas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!rPerg.ok) {
          const t = await rPerg.text();
          alert(`Erro ao adicionar perguntas do quiz: ${t || rPerg.status}`);
          return;
        }
      }

      alert("Curso criado com sucesso!");
      setShowModal(false);
      if (isAssincronoTipo(tipo)) navigate(`/gestor/cursos/${ID_Curso}/modulos`);
      else navigate("/gestor/dashboard");
    } catch (err) {
      console.error("Erro:", err);
      alert("Ocorreu um erro a criar o curso.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-3 text-start">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffffff">
            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </svg>
          <span className="ms-2">Voltar</span>
        </button>
      </div>

      <h2>Criar Curso</h2>
      <form onSubmit={handleSubmit}>
        {/* ---------- CAMPOS DO CURSO ---------- */}
        <div className="mb-3">
          <label>Nome do Curso</label>
          <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label>Descrição</label>
          <textarea className="form-control" rows="4" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label>Tipo</label>
          <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="síncrono">Síncrono</option>
            <option value="assíncrono">Assíncrono</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Data de Início</label>
          <input type="date" className="form-control" value={dataInicio} onChange={onChangeDataInicio} required />
        </div>

        <div className="mb-3">
          <label>Data de Fim</label>
          <input type="date" className="form-control" value={dataFim} onChange={onChangeDataFim} required />
          {erroDatas && (
            <div className="text-danger mt-1" role="alert">
              {erroDatas}
            </div>
          )}
        </div>

        {isSincronoTipo(tipo) && (
          <>
            <div className="mb-3">
              <label>Vagas</label>
              <input
                type="number"
                className="form-control"
                value={vagas}
                max={300}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") setVagas("");
                  else setVagas(Math.min(Number(val), 300));
                }}
                required
              />
            </div>

            <div className="mb-3">
              <label>Formador</label>
              <select
                className="form-select"
                value={formadorId}
                onChange={(e) => setFormadorId(e.target.value)}
                required
              >
                <option value="">Selecione um formador</option>
                {formadores.map((f) => (
                  <option key={f.ID_Formador} value={f.ID_Formador}>
                    {f.Nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {isAssincronoTipo(tipo) && (
          <>
            <div className="mb-3">
              <label>Objetivos</label>
              {objetivos.map((obj, idx) => (
                <div key={idx} className="d-flex mb-2 gap-2">
                  <input
                    className="form-control"
                    value={obj}
                    onChange={(e) => {
                      const novos = [...objetivos];
                      novos[idx] = e.target.value;
                      setObjetivos(novos);
                    }}
                    placeholder="Ex: Aprender HTML 5 e os últimos recursos da linguagem"
                  />
                  <button type="button" className="btn btn-danger" onClick={() => removerObjetivo(idx)}>
                    Remover
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-success" onClick={() => setObjetivos([...objetivos, ""])}>
                Adicionar Objetivo
              </button>
            </div>

            <div className="mb-3">
              <label>Includes</label>
              {includes.map((inc, idx) => (
                <div key={idx} className="d-flex mb-2 gap-2">
                  <input
                    className="form-control"
                    value={inc}
                    onChange={(e) => {
                      const novos = [...includes];
                      novos[idx] = e.target.value;
                      setIncludes(novos);
                    }}
                    placeholder="Ex: 48 artigos"
                  />
                  <button type="button" className="btn btn-danger" onClick={() => removerInclude(idx)}>
                    Remover
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-success" onClick={() => setIncludes([...includes, ""])}>
                Adicionar Include
              </button>
            </div>
          </>
        )}

        <div className="mb-3">
          <label>Imagem (URL)</label>
          <input type="text" className="form-control" value={imagem} onChange={(e) => setImagem(e.target.value)} />
        </div>

        <div className="mb-3">
          <label>Categoria</label>
          <select className="form-select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
            <option value="">Selecione uma categoria</option>
            {categorias.map((c) => (
              <option key={c.ID_Categoria} value={c.ID_Categoria}>
                {c.Nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Área</label>
          <select className="form-select" value={areaId} onChange={(e) => setAreaId(e.target.value)} required>
            <option value="">Selecione uma área</option>
            {areas.map((a) => (
              <option key={a.ID_Area} value={a.ID_Area}>
                {a.Nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Tópico</label>
          <select className="form-select" value={topicoId} onChange={(e) => setTopicoId(e.target.value)} required>
            <option value="">Selecione um tópico</option>
            {topicos.map((t) => (
              <option key={t.ID_Topico} value={t.ID_Topico}>
                {t.Nome}
              </option>
            ))}
          </select>
        </div>

        {/* ---------- SECÇÃO DO QUIZ ---------- */}
        <div className="mt-4 p-3 rounded" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="addQuizSwitch"
              checked={addQuiz}
              disabled={isSincronoTipo(tipo)} // desativado para SÍNCRONO
              onChange={(e) => setAddQuiz(e.target.checked)}
              title={
                isSincronoTipo(tipo)
                  ? "Cursos síncronos: o quiz é criado pelo Formador"
                  : "Adicionar quiz a este curso assíncrono"
              }
            />
            <label className="form-check-label" htmlFor="addQuizSwitch">
              Adicionar quiz a este curso
              {isSincronoTipo(tipo) && (
                <span className="text-muted ms-2">(apenas disponível em cursos assíncronos)</span>
              )}
            </label>
          </div>

          {/* construtor de quiz apenas para ASSÍNCRONO */}
          {isAssincronoTipo(tipo) && addQuiz && (
            <>
              <div className="mb-3">
                <label>Título do Quiz</label>
                <input
                  className="form-control"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Ex.: Quiz de React Básico"
                />
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Pergunta #{qi + 1}</strong>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeQuestion(qi)}>
                      Remover pergunta
                    </button>
                  </div>

                  <input
                    className="form-control mb-2"
                    placeholder="Texto da pergunta"
                    value={q.texto}
                    onChange={(e) => setQuestionText(qi, e.target.value)}
                  />

                  <div className="ms-2">
                    {q.respostas.map((r, ai) => (
                      <div key={ai} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                            className="form-check-input mt-0"
                            type="radio"
                            checked={r.correta}
                            onChange={() => markCorrect(qi, ai)}
                            title="Resposta correta"
                          />
                        </div>
                        <input
                          className="form-control"
                          placeholder={`Opção ${ai + 1}`}
                          value={r.texto}
                          onChange={(e) => setAnswerText(qi, ai, e.target.value)}
                        />
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeAnswer(qi, ai)}>
                          x
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => addAnswer(qi)}>
                      + Opção
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-outline-primary" onClick={addQuestion}>
                + Pergunta
              </button>
            </>
          )}
        </div>

        <button type="submit" className="btn btn-light mt-4" disabled={!!erroDatas}>
          Guardar Alterações{" "}
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff">
            <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
          </svg>
        </button>
      </form>

      {/* Modal de Confirmação */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Criação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Tens a certeza que queres criar este curso?</p>
                <p>
                  <strong>{nome}</strong> ({tipo})
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovoCurso;
