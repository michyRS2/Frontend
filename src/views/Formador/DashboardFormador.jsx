import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig";
import { useNavigate } from "react-router-dom";


const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isSincrono = (tipo) => norm(tipo).includes("sincr");

const DashboardFormador = () => {
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [topicoSelecionado, setTopicoSelecionado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // contagem de quizzes por curso
  const [quizCounts, setQuizCounts] = useState({}); // { [ID_Curso]: number }

  useEffect(() => {
    api
      .get(`/formador/dashboard`)
      .then((res) => setCursos(res.data.cursosDoFormador || []))
      .catch((err) => console.error("Erro ao carregar cursos:", err));
  }, []);

  // buscar nº de quizzes por curso
  useEffect(() => {
    if (!cursos.length) return;
    let alive = true;

    (async () => {
      try {
        const ids = Array.from(new Set(cursos.map((c) => c.ID_Curso).filter(Boolean)));
        const pairs = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`/api/curso/${id}/quizzes/count`, {
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
        console.error("Erro a obter contagem de quizzes:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [cursos]);

  const categoriasUnicas = [...new Set(cursos.map((c) => c.Categoria).filter(Boolean))];
  const areasUnicas = [
    ...new Set(
      cursos
        .filter((c) => (categoriaSelecionada ? c.Categoria === categoriaSelecionada : true))
        .map((c) => c.Area)
        .filter(Boolean)
    ),
  ];
  const topicosUnicos = [
    ...new Set(
      cursos
        .filter((c) => (categoriaSelecionada ? c.Categoria === categoriaSelecionada : true))
        .filter((c) => (areaSelecionada ? c.Area === areaSelecionada : true))
        .map((c) => c.Topico)
        .filter(Boolean)
    ),
  ];

  const cursosFiltrados = cursos.filter((curso) => {
    return (
      (categoriaSelecionada ? curso.Categoria === categoriaSelecionada : true) &&
      (areaSelecionada ? curso.Area === areaSelecionada : true) &&
      (topicoSelecionado ? curso.Topico === topicoSelecionado : true)
    );
  });

  const handleGerirConteudo = (id) => navigate(`/formador/editar-curso/${id}`);
  const handleNovoQuiz = (id) => navigate(`/formador/cursos/${id}/novo-quiz`);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard do Formador</h1>

      <div className="mb-3">
        <button
          className="btn btn-outline-dark"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
      </div>

      {mostrarFiltros && (
        <div className="card card-body mb-4">
          <h6>Categorias:</h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              className={`btn ${categoriaSelecionada === "" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setCategoriaSelecionada("");
                setAreaSelecionada("");
                setTopicoSelecionado("");
              }}
            >
              Todas
            </button>
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                className={`btn ${categoriaSelecionada === cat ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setCategoriaSelecionada(cat);
                  setAreaSelecionada("");
                  setTopicoSelecionado("");
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <h6>Áreas:</h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              className={`btn ${areaSelecionada === "" ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => setAreaSelecionada("")}
              disabled={!categoriaSelecionada}
            >
              Todas
            </button>
            {areasUnicas.map((ar) => (
              <button
                key={ar}
                className={`btn ${areaSelecionada === ar ? "btn-secondary" : "btn-outline-secondary"}`}
                onClick={() => {
                  setAreaSelecionada(ar);
                  setTopicoSelecionado("");
                }}
                disabled={!categoriaSelecionada}
              >
                {ar}
              </button>
            ))}
          </div>

          <h6>Tópicos:</h6>
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn ${topicoSelecionado === "" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setTopicoSelecionado("")}
              disabled={!areaSelecionada}
            >
              Todos
            </button>
            {topicosUnicos.map((tp) => (
              <button
                key={tp}
                className={`btn ${topicoSelecionado === tp ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setTopicoSelecionado(tp)}
                disabled={!areaSelecionada}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-dark text-center">
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Área</th>
              <th>Tópico</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Estado</th>
              <th>Quizzes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {cursosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9">Nenhum curso encontrado.</td>
              </tr>
            ) : (
              cursosFiltrados.map((curso) => {
                const quizzesCount =
                  Number(curso.Num_Quizzes ?? curso.num_quizzes ?? curso.quizzesCount) ||
                  quizCounts[curso.ID_Curso] ||
                  0;

                return (
                  <tr key={curso.ID_Curso}>
                    <td>{curso.Nome_Curso}</td>
                    <td>{curso.Categoria || "—"}</td>
                    <td>{curso.Area || "—"}</td>
                    <td>{curso.Topico || "—"}</td>
                    <td>{new Date(curso.Data_Inicio).toLocaleDateString("pt-PT")}</td>
                    <td>{new Date(curso.Data_Fim).toLocaleDateString("pt-PT")}</td>
                    <td>{curso.Estado_Curso}</td>

                    {/* Nº de quizzes */}
                    <td>{quizzesCount}</td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          onClick={() => handleGerirConteudo(curso.ID_Curso)}
                          className="btn btn-outline-primary btn-sm"
                          title="Gerir Conteúdo"
                        >
                          Gerir Conteúdo
                        </button>

                        {isSincrono(curso.Tipo_Curso) && (
                          <button
                            onClick={() => handleNovoQuiz(curso.ID_Curso)}
                            className="btn btn-outline-success btn-sm"
                            title="Criar novo quiz para este curso"
                          >
                            + Quiz
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardFormador;