import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditarCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);

  const [formadores, setFormadores] = useState([]);
  const [vagasInput, setVagasInput] = useState("");
  const [erroDatas, setErroDatas] = useState("");
  const [aulasAEliminar, setAulasAEliminar] = useState([]);
  const [modulosAEliminar, setModulosAEliminar] = useState([]);

  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchFormadores = async () => {
      const res = await fetch(`https://backend-4tkw.onrender.com/gestor/formadores`, {
        credentials: "include",
      });
      const data = await res.json();
      setFormadores(data);
    };

    if (curso?.Tipo_Curso === "síncrono") {
      fetchFormadores();
    }
  }, [curso?.Tipo_Curso]);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const resCurso = await fetch(
          `https://backend-4tkw.onrender.com/gestor/cursos/${id}`,
          {
            credentials: "include",
          }
        );
        if (!resCurso.ok) {
          throw new Error(`Erro ${resCurso.status}: ${resCurso.statusText}`);
        }
        const dadosCurso = await resCurso.json();
        setCurso(dadosCurso);

        // dentro do fetchCurso, depois de obter dadosCurso
        if (dadosCurso.Tipo_Curso === "assíncrono" && dadosCurso.modulos) {
          const modulosComAulas = (dadosCurso.modulos || []).map((mod) => ({
            ID_Modulo: mod.ID_Modulo,
            // garantir que o input lê um valor:
            Titulo: mod.Nome ?? mod.Titulo ?? "",
            Aulas: (mod.aulas || []).map((aula) => ({
              ID_Aula: aula.ID_Aula,
              Titulo: aula.Titulo,
              Descricao: aula.Descricao,
              Files:
                aula.conteudos?.map((a) => ({
                  name: a.Nome_Original,
                  url: a.URL,
                  tipo: a.Tipo,
                  id: a.ID_Conteudo,
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

  useEffect(() => {
    if (curso) {
      setVagasInput(
        curso.Vagas !== null && curso.Vagas !== undefined
          ? String(curso.Vagas)
          : ""
      );
    }
  }, [curso]);

  useEffect(() => {
    if (vagasInput === "") {
      setCurso((prev) => ({ ...prev, Vagas: null }));
    } else {
      const num = parseInt(vagasInput, 10);
      if (!isNaN(num)) {
        setCurso((prev) => ({ ...prev, Vagas: num }));
      }
    }
  }, [vagasInput]);

  const onChangeDataInicio = (e) => {
    const novaDataInicio = e.target.value;
    setCurso((prev) => ({ ...prev, Data_Inicio: novaDataInicio }));

    if (curso?.Data_Fim && novaDataInicio > curso.Data_Fim) {
      setErroDatas("A data de início não pode ser posterior à data de fim.");
    } else {
      setErroDatas("");
    }
  };

  const onChangeDataFim = (e) => {
    const novaDataFim = e.target.value;
    setCurso((prev) => ({ ...prev, Data_Fim: novaDataFim }));

    if (curso?.Data_Inicio && novaDataFim < curso.Data_Inicio) {
      setErroDatas("A data de fim não pode ser anterior à data de início.");
    } else {
      setErroDatas("");
    }
  };

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
    const modulo = novos[modIdx];

    if (modulo.ID_Modulo) {
      setModulosAEliminar((prev) => [...prev, modulo.ID_Modulo]);
    }

    novos.splice(modIdx, 1);
    setModulos(novos);
  };

  const adicionarAula = (modIdx) => {
    const novos = [...modulos];
    if (!novos[modIdx].Aulas) {
      novos[modIdx].Aulas = [];
    }
    novos[modIdx].Aulas.push({ Titulo: "", Descricao: "" });
    setModulos(novos);
  };

  const removerAula = (modIdx, aulaIdx) => {
    const novos = [...modulos];
    const aula = novos[modIdx].Aulas[aulaIdx];

    if (aula.ID_Aula) {
      setAulasAEliminar((prev) => [...prev, aula.ID_Aula]);
    }

    novos[modIdx].Aulas.splice(aulaIdx, 1);
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

  const handleRemoveFile = (modIdx, aulaIdx, fileIdx) => {
    setModulos((prev) => {
      const novo = [...prev];
      novo[modIdx].Aulas[aulaIdx].Files[fileIdx].toDelete = true;
      return novo;
    });
  };

  // 👉 Atualiza o estado quando um ficheiro é selecionado
  const handleFileChange = (modIdx, aulaIdx, e) => {
    const files = Array.from(e.target.files);
    const novosModulos = [...modulos];

    if (!novosModulos[modIdx].Aulas[aulaIdx].Files) {
      novosModulos[modIdx].Aulas[aulaIdx].Files = [];
    }

    novosModulos[modIdx].Aulas[aulaIdx].Files.push(...files);
    setModulos(novosModulos);
    console.log("Files selecionados:", files);
    console.log("Estado modulos após seleção:", novosModulos);
  };

  // Enviar ficheiros novos e atualizar estado local
  const uploadFiles = async (files, modIdx, aulaIdx, aulaId) => {
    try {
      const formData = new FormData();
      formData.append("ID_Aula", aulaId);

      files.forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file); // 'files' corresponde ao backend
        }
      });

      const res = await fetch("https://backend-4tkw.onrender.com/gestor/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erro ao enviar ficheiros");

      const data = await res.json();

      setModulos((prevModulos) => {
        const novos = [...prevModulos];
        const aulaAtual = novos[modIdx].Aulas[aulaIdx];

        // Mantém ficheiros existentes (com url/id)
        const existentes = (aulaAtual.Files || []).filter((f) => f.url || f.id);

        aulaAtual.Files = [
          ...existentes,
          ...data.anexos.map((a) => ({
            name: a.Nome_Original,
            url: a.URL,
            tipo: a.Tipo,
            id: a.ID_Conteudo,
            toDelete: false,
          })),
        ];

        return novos;
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload dos ficheiros");
    }
  };

  const payloadModulos = modulos.map((mod) => ({
    ID_Modulo: mod.ID_Modulo,
    Titulo: mod.Titulo,
    ID_Curso: id,
    Aulas: (mod.Aulas || []).map((a) => ({
      ID_Aula: a.ID_Aula,
      Titulo: a.Titulo,
      Descricao: a.Descricao,
      Files: (a.Files || []).map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url,
        tipo: f.tipo,
        toDelete: f.toDelete || false,
      })),
    })),
  }));

  // Submeter formulário do curso
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (erroDatas) {
      alert(erroDatas);
      return;
    }

    try {
      // 1️⃣ Atualizar curso
      const payloadCurso = {
        Nome_Curso: curso.Nome_Curso,
        Tipo_Curso: curso.Tipo_Curso,
        Data_Inicio: curso.Data_Inicio,
        Data_Fim: curso.Data_Fim,
        Imagem: curso.Imagem,
        ID_Topico: curso.ID_Topico,
        Objetivos: curso.Objetivos,
        Includes: curso.Includes,
        ...(curso.Tipo_Curso === "síncrono" && {
          Vagas: curso.Vagas,
          ID_Formador: curso.ID_Formador,
        }),
      };

      await fetch(`https://backend-4tkw.onrender.com/gestor/cursos/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadCurso),
      });

      // 2️⃣ Atualizar módulos e aulas (só em cursos assíncronos)
      if (curso.Tipo_Curso === "assíncrono") {
        const ficheirosAEliminar = [];

        modulos.forEach((mod) => {
          (mod.Aulas || []).forEach((aula) => {
            (aula.Files || []).forEach((f) => {
              if (f.id && f.toDelete) ficheirosAEliminar.push(f.id);
            });
          });
        });

        const res = await fetch(
          `https://backend-4tkw.onrender.com/gestor/cursos/${id}/modulos`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ID_Curso: id, // 👈 garantir que segue sempre
              Modulos: payloadModulos, // já preparado com Titulo/Aulas/Files
              RemoverFicheiros: ficheirosAEliminar,
              RemoverAulas: aulasAEliminar,
              RemoverModulos: modulosAEliminar,
            }),
          }
        );

        const data = await res.json();

        // 🔄 Atualiza o estado local com os IDs retornados pelo backend
        if (data.Modulos) {
          setModulos(data.Modulos);
        }

        // 3️⃣ Upload apenas dos ficheiros novos
        for (let modIdx = 0; modIdx < modulos.length; modIdx++) {
          const modLocal = modulos[modIdx];

          // Encontrar o módulo correspondente no backend pelo ID
          const modServidor = data.Modulos.find(
            (m) => m.ID_Modulo === modLocal.ID_Modulo
          );
          if (!modServidor) continue;

          for (
            let aulaIdx = 0;
            aulaIdx < (modLocal.Aulas || []).length;
            aulaIdx++
          ) {
            const aulaLocal = modLocal.Aulas[aulaIdx];

            // Se a aula já existe, encontra pelo ID
            let aulaServidor = modServidor.Aulas.find(
              (a) => a.ID_Aula === aulaLocal.ID_Aula
            );

            // Se a aula ainda não tem ID (nova), procura pelo título como fallback
            if (!aulaServidor) {
              aulaServidor = modServidor.Aulas.find(
                (a) => a.Titulo === aulaLocal.Titulo
              );
            }

            if (!aulaServidor) continue;

            const novosFicheiros = (aulaLocal.Files || []).filter(
              (f) => f instanceof File
            );
            if (novosFicheiros.length > 0) {
              await uploadFiles(
                novosFicheiros,
                modIdx,
                aulaIdx,
                aulaServidor.ID_Aula
              );
            }
          }
        }
      }

      alert("Curso atualizado com sucesso!");

      setShowModal(false);// //fecha o Modal depois da confirmação

      navigate("/gestor/dashboard");
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao atualizar curso.");
    }
  };

  if (!curso) return <p>A carregar curso...</p>;

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
          <span className="ms-2">Voltar</span>
        </button>
      </div>
      <h2>Editar Curso</h2>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          setShowModal(true); 
        }}
    >
        <div className="mb-3">
          <label>Nome</label>
          <input
            type="text"
            className="form-control"
            value={curso.Nome_Curso}
            onChange={(e) => setCurso({ ...curso, Nome_Curso: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Tipo</label>
          <input
            type="text"
            className="form-control"
            value={curso.Tipo_Curso}
            disabled
          />
        </div>

        <div className="mb-3">
          <label>Data Início</label>
          <input
            type="date"
            className="form-control"
            value={curso.Data_Inicio?.slice(0, 10)}
            onChange={onChangeDataInicio}
          />
        </div>

        <div className="mb-3">
          <label>Data Fim</label>
          <input
            type="date"
            className="form-control"
            value={curso.Data_Fim?.slice(0, 10)}
            onChange={onChangeDataFim}
          />
          {erroDatas && (
            <div className="text-danger mt-1" role="alert">
              {erroDatas}
            </div>
          )}
        </div>

        {curso.Tipo_Curso === "síncrono" && (
          <>
            <div className="mb-3">
              <label>Vagas</label>
              <input
                type="number"
                className="form-control"
                value={vagasInput}
                placeholder=""
                max={300}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setVagasInput("");
                  } else {
                    const numVal = Math.min(Number(val), 300);
                    if (numVal >= 0) setVagasInput(String(numVal));
                  }
                }}
              />
            </div>

            <div className="mb-3">
              <label>Formador</label>
              <select
                className="form-select"
                value={curso.ID_Formador || ""}
                onChange={(e) =>
                  setCurso({ ...curso, ID_Formador: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {formadores.map((f) => (
                  <option key={f.ID_Formador} value={f.ID_Formador}>
                    {f.Nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {curso.Tipo_Curso === "assíncrono" && (
          <>
            <h4 className="mt-4">Objetivos</h4>
            {curso.Objetivos.map((obj, idx) => (
              <div key={idx} className="d-flex mb-2 gap-2">
                <input
                  key={idx}
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

            <h4 className="mt-4">Includes</h4>
            {curso.Includes.map((inc, idx) => (
              <div key={idx} className="d-flex mb-2 gap-2">
                <input
                  key={idx}
                  className="form-control"
                  value={inc}
                  onChange={(e) => {
                    const novos = [...curso.Includes];
                    novos[idx] = e.target.value;
                    setCurso({ ...curso, Includes: novos });
                  }}
                  placeholder={`Ex: 46 artigos`}
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

            <h4 className="mt-4">Módulos e Aulas</h4>
            {modulos.map((mod, modIdx) => (
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
                {(mod.Aulas || []).map((aula, aulaIdx) => (
                  <div key={aulaIdx} className="mb-2 ">
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
                      className="form-control"
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
        {f.url ? (
          <a href={f.url} target="_blank" rel="noreferrer">
            {f.name || f.Nome_Original}
          </a>
        ) : (
          f.name
        )}
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={() => handleRemoveFile(modIdx, aulaIdx, fIdx)}
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
                ))}

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
          </>
        )}

        <div>
          <button
            type="submit"
            className="btn btn-light mt-4"
            disabled={!!erroDatas} // desativa o botão se erro existir
          >
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
    {/* Modal de Confirmação */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Criação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Tens a certeza que queres editar este curso?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarCurso;