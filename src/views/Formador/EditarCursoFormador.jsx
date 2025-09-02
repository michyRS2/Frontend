import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditarCursoFormador = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [idsModulosApagar, setIdsModulosApagar] = useState([]);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const res = await fetch(
          `https://backend-4tkw.onrender.com/formador/editar-curso/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setCurso(data);

        if (Array.isArray(data.modulos)) {
          const modulosComAulas = data.modulos.map((mod) => ({
            ...mod,
            toDelete: false,
            Aulas: (mod.aulas || []).map((aula) => ({
              ...aula,
              toDelete: false,
              Files:
                (aula.conteudos || []).map((c) => ({
                  id: c.ID_Conteudo,
                  name: c.Nome_Original,
                  url: c.URL,
                  tipo: c.Tipo,
                  toDelete: false,
                })) || [],
            })),
          }));
          setModulos(modulosComAulas);
        }
      } catch (err) {
        console.error("Erro ao carregar curso:", err);
      }
    };

    fetchCurso();
  }, [id]);

  // --- Funções de manipulação ---
  const atualizarModulo = (idx, campo, valor) => {
    const novos = [...modulos];
    novos[idx][campo] = valor;
    setModulos(novos);
  };

  const atualizarAula = (modIdx, aulaIdx, campo, valor) => {
    const novos = [...modulos];
    novos[modIdx].Aulas[aulaIdx][campo] = valor;
    setModulos(novos);
  };

  const adicionarModulo = () => {
    setModulos([
      ...modulos,
      { Titulo: "", Aulas: [{ Titulo: "", Descricao: "" }] },
    ]);
  };

  const removerModulo = (modIdx) => {
    const novos = [...modulos];
    if (novos[modIdx].ID_Modulo) {
      // marcar para apagar no backend
      novos[modIdx].toDelete = true;
    } else {
      // módulo novo → remove logo
      novos.splice(modIdx, 1);
    }
    setModulos(novos);
  };

  const adicionarAula = (modIdx) => {
    const novos = [...modulos];
    if (!novos[modIdx].Aulas) novos[modIdx].Aulas = [];
    novos[modIdx].Aulas.push({ Titulo: "", Descricao: "" });
    setModulos(novos);
  };

  const removerAula = (modIdx, aulaIdx) => {
    const novos = [...modulos];
    if (novos[modIdx].Aulas[aulaIdx].ID_Aula) {
      novos[modIdx].Aulas[aulaIdx].toDelete = true;
    } else {
      novos[modIdx].Aulas.splice(aulaIdx, 1);
    }
    setModulos(novos);
  };

  const removerObjetivo = (idx) => {
    const novos = [...curso.Objetivos];
    novos.splice(idx, 1);
    setCurso({ ...curso, Objetivos: novos });
  };

  const removerInclude = (idx) => {
    const novos = [...curso.Includes];
    novos.splice(idx, 1);
    setCurso({ ...curso, Includes: novos });
  };

  const handleFileChange = (modIdx, aulaIdx, e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      name: file.name,
      type: file.type,
      toDelete: false,
    }));
    const novos = [...modulos];
    if (!novos[modIdx].Aulas[aulaIdx].Files)
      novos[modIdx].Aulas[aulaIdx].Files = [];
    novos[modIdx].Aulas[aulaIdx].Files.push(...files);
    setModulos(novos);
  };

  const handleRemoveFile = (modIdx, aulaIdx, fileIdx) => {
    const novos = [...modulos];
    const file = novos[modIdx].Aulas[aulaIdx].Files[fileIdx];

    if (file.file) {
      // ficheiro novo ainda não enviado
      novos[modIdx].Aulas[aulaIdx].Files.splice(fileIdx, 1);
    } else {
      // ficheiro existente do backend
      file.toDelete = true;
    }

    setModulos(novos);
  };

  // --- Submeter formulário ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Montar os módulos com aulas e ficheiros
      const modulosParaEnviar = modulos.map((mod, modIdx) => ({
        ID_Modulo: mod.ID_Modulo,
        tempId: modIdx,
        Titulo: mod.Titulo,
        toDelete: mod.toDelete || false,
        Aulas: mod.Aulas.map((aula, aulaIdx) => ({
          ID_Aula: aula.ID_Aula,
          tempId: aulaIdx,
          Titulo: aula.Titulo,
          Descricao: aula.Descricao,
          toDelete: aula.toDelete || false,
          conteudosExistentes: (aula.Files || [])
            .filter((f) => !f.file || f.id)
            .map((f) => ({ ID_Conteudo: f.id, toDelete: f.toDelete })),
        })),
      }));

      // Adicionar JSON ao FormData
      formData.append(
        "curso",
        JSON.stringify({
          Objetivos: curso.Objetivos,
          Includes: curso.Includes,
          Modulos: modulosParaEnviar,
        })
      );

      // Adicionar ficheiros novos
      modulos.forEach((mod, modIdx) => {
        mod.Aulas.forEach((aula, aulaIdx) => {
          (aula.Files || []).forEach((f, fIdx) => {
            if (f.file) {
              // criar chave única por aula
              const key = `files_${mod.ID_Modulo || modIdx}_${
                aula.ID_Aula || aulaIdx
              }`;
              formData.append(key, f.file);
            }
          });
        });
      });

      const res = await fetch(
        `https://backend-4tkw.onrender.com/formador/editar-curso/${id}/`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (res.ok) {
        alert("Curso atualizado com sucesso!");
        navigate("/formador/dashboard");
      } else {
        const data = await res.json();
        console.error("Erro backend:", data);
        alert("Erro ao atualizar curso");
      }
    } catch (err) {
      console.error("Erro ao enviar dados:", err);
      alert("Erro ao enviar dados do curso");
    }
  };

  if (!curso) return <p>A carregar...</p>;

  return (
    <div className="container mt-4">
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
          <span className="ms-2"> Voltar</span>
        </button>
      </div>
      <h2>Editar Conteúdo do Curso</h2>

      <form onSubmit={handleSubmit}>
        {/* Objetivos */}
        <h4 className="mt-4">Objetivos</h4>
        {curso.Objetivos.map((obj, idx) => (
          <div key={idx} className="d-flex mb-2 gap-2">
            <input
              className="form-control"
              value={obj}
              onChange={(e) => {
                const novos = [...curso.Objetivos];
                novos[idx] = e.target.value;
                setCurso({ ...curso, Objetivos: novos });
              }}
              placeholder={`Ex: Aprender HTML 5 e os últimos recursos da linguagem`}
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removerObjetivo(idx)}
            >
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
        <button
          type="button"
          className="btn btn-success"
          onClick={() =>
            setCurso({ ...curso, Objetivos: [...curso.Objetivos, ""] })
          }
        >
          Adicionar Objetivo{" "}
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

        {/* Includes */}
        <h4 className="mt-4">Includes</h4>
        {curso.Includes.map((inc, idx) => (
          <div key={idx} className="d-flex mb-2 gap-2">
            <input
              className="form-control"
              value={inc}
              onChange={(e) => {
                const novos = [...curso.Includes];
                novos[idx] = e.target.value;
                setCurso({ ...curso, Includes: novos });
              }}
              placeholder="Ex: 46 artigos"
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removerInclude(idx)}
            >
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
        <button
          type="button"
          className="btn btn-success"
          onClick={() =>
            setCurso({ ...curso, Includes: [...curso.Includes, ""] })
          }
        >
          Adicionar Include{" "}
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

        {/* Módulos e Aulas */}
        <h4 className="mt-4">Módulos e Aulas</h4>
        {modulos
          .filter((mod) => !mod.toDelete)
          .map((mod, modIdx) => (
            <div key={modIdx} className="border p-4 mb-3 rounded bg-light">
              <label>Título do Módulo</label>
              <input
                className="form-control mb-2"
                value={mod.Titulo}
                onChange={(e) =>
                  atualizarModulo(modIdx, "Titulo", e.target.value)
                }
                required
              />

              <h6>Aulas</h6>
              {mod.Aulas.filter((aula) => !aula.toDelete).map(
                (aula, aulaIdx) => (
                  <div key={aulaIdx} className="mb-2">
                    <input
                      className="form-control mb-1"
                      placeholder="Título da Aula"
                      value={aula.Titulo}
                      onChange={(e) =>
                        atualizarAula(modIdx, aulaIdx, "Titulo", e.target.value)
                      }
                      required
                    />
                    <input
                      className="form-control mb-1"
                      placeholder="Descrição"
                      value={aula.Descricao}
                      onChange={(e) =>
                        atualizarAula(
                          modIdx,
                          aulaIdx,
                          "Descricao",
                          e.target.value
                        )
                      }
                    />

                    <div>
                      <label>Anexar ficheiros:</label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(modIdx, aulaIdx, e)}
                      />
                      <ul className="list-group mt-1">
                        {(aula.Files || []).map((f, fIdx) => (
                          <li
                            key={fIdx}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              f.toDelete ? "list-group-item-danger" : ""
                            }`}
                          >
                            {f.name || f.Nome_Original}
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleRemoveFile(modIdx, aulaIdx, fIdx)
                              }
                            >
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
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="btn btn-warning btn-sm mb-2"
                      onClick={() => removerAula(modIdx, aulaIdx)}
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
                )
              )}

              <div className="d-flex justify-content-between align-items-center mt-2">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => adicionarAula(modIdx)}
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
                  onClick={() => removerModulo(modIdx)}
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
          className="btn btn-success mt-4"
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

export default EditarCursoFormador;
