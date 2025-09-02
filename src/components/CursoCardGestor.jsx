import React from "react";

const CursoCardGestor = ({ curso, onEditar, onEliminar }) => {
  const dataFimFormatada = new Date(curso.Data_Fim).toLocaleDateString("pt-PT");

  const estadoFormatado = (() => {
    switch ((curso.Estado_Curso || "").toLowerCase()) {
      case "ativo":
        return "Ativo";
      case "em curso":
        return "Em curso";
      case "terminado":
        return "Terminado";
      default:
        return curso.Estado_Curso || "Desconhecido";
    }
  })();

  

  return (
    <div className="card mb-3">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">{curso.Nome_Curso}</h5>
          <p className="card-text mb-1"><strong>Tipo:</strong> {curso.Tipo_Curso}</p>
          {curso.Tipo_Curso === "síncrono" && (
            <>
              <p className="card-text mb-1"><strong>Formador:</strong> {curso.formador?.Nome}</p>
              <p className="card-text mb-1"><strong>Vagas:</strong> {curso.Vagas}</p>
            </>
          )}
          <p className="card-text mb-1"><strong>Data fim:</strong> {dataFimFormatada}</p>
          <p className="card-text mb-1"><strong>Estado:</strong> {estadoFormatado}</p>
        </div>
        <div className="d-flex flex-column gap-2">
          <button
            onClick={() => onEditar(curso)}
            className="btn btn-primary"
          >
            Editar
          </button>
          <button
            onClick={() => onEliminar(curso)}
            className="btn btn-danger"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CursoCardGestor;
