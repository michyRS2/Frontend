import React from "react";
import CursoCard from "../components/CursoCard";
import { useNavigate } from "react-router-dom";

const PercursoCard = ({ curso }) => {
  const navigate = useNavigate();

  const handleVerPercurso = () => {
    navigate(`/quiz/curso/${curso.ID_Curso}`);
  };

  // Passamos uma prop para o CursoCard para ele renderizar "modo simples" sem ratings/botões
  return (
    <div className="PercursoCard-wrapper">
      <CursoCard curso={{ ...curso, hideRatings: true, hideButtons: true }} />
<button className="btn btn-primary btn-sm" onClick={handleVerPercurso}>
  Ver Percurso Formativo
</button>

      </div>
    
  );
};

export default PercursoCard;
