import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/CursoStyles.css";

const CursoInscrito = () => {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState(null);
  const [modulosAbertos, setModulosAbertos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/cursos/${cursoId}`)
      .then((res) => {
        console.log("Curso inscrito recebido:", res.data);
        setCurso(res.data);
      })
      .catch((err) => console.error("Erro ao carregar curso:", err));
  }, [cursoId]);

  const toggleModulo = (idx) => {
    setModulosAbertos((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  if (!curso)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando curso...</p>
      </div>
    );

  return (
    <div className="curso-page">
      <div className="curso-container">
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
          <span className="ms-2">Voltar</span>
        </button>

        <div className="curso-header">
          <h1>{curso.Nome_Curso}</h1>
          <p>Confira os detalhes do curso e tenho acesso aos materiais</p>
        </div>

        <div className="curso-card">
          <img
            src={curso.Imagem}
            alt={curso.Nome_Curso}
            className="curso-imagem"
          />

          <div className="curso-info">
            <h2>
              <i className="fas fa-info-circle"></i> Informações do Curso
            </h2>
            <p>
              <strong>Categoria:</strong> {curso.Categoria}
            </p>
            <p>
              <strong>Formador:</strong> {curso.Formador || "Não especificado"}
            </p>
            <p>
              <strong>Tipo:</strong> {curso.Tipo_Curso}
            </p>
            <p className="status-active">
              <strong>✅ Estás inscrito neste curso</strong>
            </p>
          </div>

          {curso.Objetivos?.length > 0 && (
            <div className="curso-info">
              <h2>
                <i className="fas fa-bullseye"></i> O que vai aprender
              </h2>
              <ul>
                {curso.Objetivos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {curso.Includes?.length > 0 && (
            <div className="curso-info">
              <h2>
                <i className="fas fa-check-circle"></i> Inclui
              </h2>
              <ul>
                {curso.Includes.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {curso.modulos?.length > 0 && (
            <div className="curso-info">
              <h2>
                <i className="fas fa-book"></i> Conteúdo do curso
              </h2>
              {curso.modulos.map((modulo, idx) => (
                <div key={idx} className="modulo">
                  <button
                    className="modulo-btn"
                    onClick={() => toggleModulo(idx)}
                  >
                    {modulo.Titulo}
                    <i
                      className={`fas ${
                        modulosAbertos.includes(idx)
                          ? "fa-chevron-up"
                          : "fa-chevron-down"
                      }`}
                    ></i>
                  </button>

                  {modulosAbertos.includes(idx) && (
                    <div className="modulo-conteudo">
                      {modulo.aulas?.map((aula, i) => (
                        <div key={i} className="aula">
                          <strong>{aula.Titulo}</strong>: {aula.Descricao}
                          {aula.conteudos?.length > 0 && (
                            <div className="anexos">
                              <strong>Anexos:</strong>
                              <ul>
                                {aula.conteudos.map((file, fIdx) => (
                                  <li key={fIdx}>
                                    <a
                                      href={`https://backend-4tkw.onrender.com${file.URL}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      download={file.Nome_Original}
                                    >
                                      <i className="fas fa-file-download"></i>{" "}
                                      {file.Nome_Original}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CursoInscrito;
