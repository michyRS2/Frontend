import React from "react";

const CursoCardFormador = ({ curso, onEditar }) => {
  const dataInicioFormatada = new Date(curso.Data_Inicio).toLocaleDateString("pt-PT");
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
    <tr>
      <td>{curso.Nome_Curso}</td>
      <td>{curso.Categoria || "—"}</td>
      <td>{curso.Area|| "—"}</td>
      <td>{curso.Topico || "—"}</td>
      <td>{dataInicioFormatada}</td>
      <td>{dataFimFormatada}</td>
      <td>{estadoFormatado}</td>
      <td>
        <button
          onClick={() => onEditar(curso)}
          className="btn btn-outline-primary btn-sm"
        >
          Gerir Conteúdo
        </button>
      </td>
    </tr>
  );
};

export default CursoCardFormador;
