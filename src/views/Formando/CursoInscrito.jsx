import React, { useEffect, useState } from "react";
import api from "../../axiosConfig.js";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/CursoRecomendado.css";

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

  if (!curso) return <p className="text-center mt-5">A carregar...</p>;

  return (
    <div className="curso-recomendado">
      <div className="mb-3 text-start">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#ffffffff"
          >
            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </svg>
          <span className="ms-2">Voltar</span>
        </button>
      </div>
      <img src={curso.Imagem} alt={curso.Nome_Curso} className="img-fluid" />

      <div className="curso-info mt-3">
        <h1>{curso.Nome_Curso}</h1>
        <p>
          <strong>Categoria:</strong> {curso.Categoria}
        </p>
        <p>
          <strong>Formador:</strong> {curso.Formador || "Não especificado"}
        </p>

        <p>
          <strong>Tipo:</strong> {curso.Tipo_Curso}
        </p>
        <p className="text-success mt-3 fw-bold">
          ✅ Estás inscrito neste curso
        </p>
      </div>

      {curso.Objetivos?.length > 0 && (
        <section className="mt-4">
          <h2>O que vai aprender</h2>
          <ul>
            {curso.Objetivos.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {curso.Includes?.length > 0 && (
        <section className="mt-4">
          <h2>Inclui</h2>
          <ul>
            {curso.Includes.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {curso.modulos?.length > 0 && (
        <section className="mt-4">
          <h2>Conteúdo do curso</h2>
          {curso.modulos.map((modulo, idx) => (
            <div key={idx} className="modulo mb-3">
              <button
                className="btn btn-outline-secondary w-100 text-start"
                onClick={() => toggleModulo(idx)}
              >
                {modulo.Titulo}
              </button>
              {modulosAbertos.includes(idx) && (
                <ul className="mt-2 ms-3">
                  {modulo.aulas?.map((aula, i) => (
                    <li key={i} className="mb-2">
                      <strong>{aula.Titulo}</strong>: {aula.Descricao}
                      {aula.conteudos?.length > 0 && (
                        <div className="mt-1 ms-3">
                          <strong>Anexos:</strong>
                          <ul className="mt-1 ms-3">
                            {aula.conteudos.map((file, fIdx) => (
                              <li key={fIdx}>
                                <a
                                  href={`https://backend-4tkw.onrender.com${file.URL}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={file.Nome_Original}
                                >
                                  {file.Nome_Original}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default CursoInscrito;
