// frontend/src/views/Gestor/ModulosAulas.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ModulosAulas = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [modulos, setModulos] = useState([
    { Titulo: "", Aulas: [{ Titulo: "", Descricao: "" }] },
  ]);

  const adicionarModulo = () =>
    setModulos([
      ...modulos,
      { Titulo: "", Aulas: [{ Titulo: "", Descricao: "" }] },
    ]);

  const removerModulo = (idx) =>
    setModulos(modulos.filter((_, i) => i !== idx));

  const adicionarAula = (modIdx) => {
    const novos = [...modulos];
    novos[modIdx].Aulas.push({ Titulo: "", Descricao: "" });
    setModulos(novos);
  };

  const removerAula = (modIdx, aulaIdx) => {
    const novos = [...modulos];
    novos[modIdx].Aulas.splice(aulaIdx, 1);
    setModulos(novos);
  };

  const atualizarCampoModulo = (modIdx, valor) => {
    const novos = [...modulos];
    novos[modIdx].Titulo = valor;
    setModulos(novos);
  };

  const atualizarCampoAula = (modIdx, aulaIdx, campo, valor) => {
    const novos = [...modulos];
    novos[modIdx].Aulas[aulaIdx][campo] = valor;
    setModulos(novos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `https://backend-4tkw.onrender.com/gestor/cursos/${cursoId}/modulos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ Modulos: modulos }),
        }
      );

      if (res.ok) {
        alert("Módulos e aulas criados com sucesso!");
        navigate("/gestor/dashboard");
      } else {
        alert("Erro ao criar módulos e aulas.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao enviar dados. Veja o console para detalhes.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Criar Módulos e Aulas</h2>
      <form onSubmit={handleSubmit}>
        {modulos.map((modulo, mi) => (
          <div key={mi} className="border p-4 mb-3 rounded bg-light">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Título do Módulo"
              value={modulo.Titulo}
              onChange={(e) => atualizarCampoModulo(mi, e.target.value)}
              required
            />

            {modulo.Aulas.map((aula, ai) => (
              <div key={ai} className="mb-2">
                <input
                  type="text"
                  className="form-control mb-1"
                  placeholder="Título da Aula"
                  value={aula.Titulo}
                  onChange={(e) =>
                    atualizarCampoAula(mi, ai, "Titulo", e.target.value)
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descrição da Aula"
                  value={aula.Descricao}
                  onChange={(e) =>
                    atualizarCampoAula(mi, ai, "Descricao", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="btn btn-warning btn-sm mb-2"
                  onClick={() => removerAula(mi, ai)}
                >
                  Remover Aula{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#000000ff"
                  >
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="d-flex justify-content-between align-items-center mt-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => adicionarAula(mi)}
              >
                Adicionar Aula{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e3e3e3"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removerModulo(mi)}
              >
                Remover Módulo{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#e3e3e3"
                    >
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-success mt-4 "
          onClick={adicionarModulo}
        >
          Adicionar Módulo{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
              </svg>
        </button>
        <div>
          <button type="submit" className="btn btn-light mt-4">
            Guardar Alterações{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000ff"
            >
              <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModulosAulas;
