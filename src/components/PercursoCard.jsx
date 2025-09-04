import React from "react";
import CursoCard from "../components/CursoCard";
import { useNavigate } from "react-router-dom";

const PercursoCard = ({ curso }) => {
  const navigate = useNavigate();

  const handleVerPercurso = () => {
    navigate(`/quizzes-visualizacao/${curso.ID_Curso}`);
  };

  return (
    <div className="PercursoCard-wrapper">
      <CursoCard curso={{ ...curso, hideRatings: true, hideButtons: true }} />
      <div className="text-center mt-2">
        <button className="btn btn-primary btn-sm" onClick={handleVerPercurso}>
          Ver Percurso Formativo
        </button>
      </div>
    </div>
  );
};

export default PercursoCard;
