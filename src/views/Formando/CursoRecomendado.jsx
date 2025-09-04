import React, { useEffect, useState } from "react";
import api from "../../../axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/CursoStyles.css";

const CursoRecomendado = () => {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState(null);
  const [modulosAbertos, setModulosAbertos] = useState([]);
  const [jaInscrito, setJaInscrito] = useState(false);
    const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando curso...</p>
        </div>
    );
  }

  if (!curso) {
    return (
        <div className="error-container">
          <p>Erro ao carregar o curso</p>
        </div>
    );
  }

  return (
      <div className="curso-page">
        <div className="curso-container">
          <button className="btn-voltar" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            <span className="ms-2">Voltar</span>
          </button>

          <div className="curso-header">
            <h1>{curso.Nome_Curso}</h1>
            <p>Descubra este curso recomendado para si</p>
          </div>

          <div className="curso-card">
            <img src={curso.Imagem} alt={curso.Nome_Curso} className="curso-imagem" />

            <div className="curso-info">
              <h2><i className="fas fa-info-circle"></i> Informações do Curso</h2>
              <p><strong>Categoria:</strong> {curso.Categoria}</p>
              <p><strong>Formador:</strong> {curso.Formador || "Não especificado"}</p>
              <p><strong>Tipo:</strong> {curso.Tipo_Curso}</p>

              {jaInscrito ? (
                  <p className="status-active"><strong>✅ Estás inscrito neste curso</strong></p>
              ) : (
                  <button onClick={handleInscricao} className="btn-inscrever">
                    <i className="fas fa-user-plus"></i> Inscrever-se
                  </button>
              )}
            </div>

      {curso.Objetivos?.length > 0 && (
                <div className="curso-info">
                  <h2><i className="fas fa-bullseye"></i> O que vai aprender</h2>
                  <ul>
                    {curso.Objetivos.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
            )}

            {curso.Includes?.length > 0 && (
                <div className="curso-info">
                  <h2><i className="fas fa-check-circle"></i> Inclui</h2>
                  <ul>
                    {curso.Includes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
            )}

      {curso.modulos?.length > 0 && (
                <div className="curso-info">
                  <h2><i className="fas fa-book"></i> Conteúdo do curso</h2>
                  {curso.modulos.map((modulo, idx) => (
                      <div key={idx} className="modulo">
              <button className="modulo-btn" onClick={() => toggleModulo(idx)}>
                          {modulo.Titulo}
                          <i className={`fas ${modulosAbertos.includes(idx) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default CursoRecomendado;
