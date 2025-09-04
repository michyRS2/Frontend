import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/CursoStyles.css";

const CursoRecomendado = () => {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState(null);
  const [modulosAbertos, setModulosAbertos] = useState([]);
  const [jaInscrito, setJaInscrito] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const res = await api.get(`/cursos/${cursoId}`);
        setCurso(res.data);

        // Verificar se o utilizador já está inscrito
        const dashboard = await api.get(
          "/formando/dashboard",
          {
            withCredentials: true,
          }
        );

        const inscrito = dashboard.data.cursosInscritos?.some(
          (c) => c.ID_Curso === parseInt(cursoId)
        );

        setJaInscrito(inscrito);
      } catch (err) {
        console.error("Erro ao carregar curso ou verificar inscrição:", err);
      }
    };

    fetchCurso();
  }, [cursoId]);

  const handleInscricao = async () => {
    const confirmar = window.confirm("Deseja mesmo inscrever-se neste curso?");
    if (!confirmar) return;

    try {
      await api.post(`/inscricoes`, { ID_Curso: cursoId });
      alert("Inscrição realizada com sucesso!");
      setJaInscrito(true);
      navigate(`/cursosInscritos/${cursoId}`);
    } catch (err) {
      alert("Erro ao inscrever-se no curso");
    }
  };

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

        {jaInscrito ? (
          <p>✅ Estás inscrito neste curso</p>
        ) : (
          <button onClick={handleInscricao} className="btn btn-primary mt-2">
            Inscrever-se
          </button>
        )}
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
              <div className="btn btn-outline-secondary w-100 text-start">
                {modulo.Titulo}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default CursoRecomendado;
