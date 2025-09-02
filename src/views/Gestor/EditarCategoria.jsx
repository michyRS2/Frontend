import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditarCategoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchCategoriaCompleta = async () => {
      try {
        // Buscar categoria
        const resCategoria = await fetch(
          `https://backend-4tkw.onrender.com/categorias/${id}`,
          {
            credentials: "include",
          }
        );
        if (!resCategoria.ok) throw new Error("Categoria não encontrada");
        const dadosCategoria = await resCategoria.json();
        setCategoria(dadosCategoria);

        // Buscar áreas associadas
        const resAreas = await fetch(
          `https://backend-4tkw.onrender.com/areas?categoriaId=${id}`,
          {
            credentials: "include",
          }
        );
        if (!resAreas.ok) throw new Error("Erro ao obter áreas");
        const listaAreas = await resAreas.json();

        // Para cada área, buscar tópicos
        const areasComTopicos = await Promise.all(
          listaAreas.map(async (area) => {
            const resTopicos = await fetch(
              `https://backend-4tkw.onrender.com/topicos?areaId=${area.ID_Area}`,
              {
                credentials: "include",
              }
            );
            if (!resTopicos.ok) throw new Error("Erro ao obter tópicos");
            const topicos = await resTopicos.json();
            return { ...area, Topicos: topicos };
          })
        );

        setAreas(areasComTopicos);

        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar categoria, áreas ou tópicos");
        setLoading(false);
      }
    };

    fetchCategoriaCompleta();
  }, [id]);

  // Alterar nome da categoria
  const handleNomeChange = (e) => {
    setCategoria({ ...categoria, Nome: e.target.value });
  };

  // Alterar nome das áreas
  const handleNomeAreaChange = (index, novoNome) => {
    const novasAreas = [...areas];
    novasAreas[index].Nome = novoNome;
    setAreas(novasAreas);
  };

  // Alterar nome dos tópicos
  const handleNomeTopicoChange = (areaIndex, topicoIndex, novoNome) => {
    const novasAreas = [...areas];
    novasAreas[areaIndex].Topicos[topicoIndex].Nome = novoNome;
    setAreas(novasAreas);
  };

  // Adicionar nova área
  const adicionarArea = () => {
    setAreas([...areas, { Nome: "", Topicos: [] }]);
  };

  // Remover área
  const removerArea = (index) => {
    const novasAreas = [...areas];
    novasAreas.splice(index, 1);
    setAreas(novasAreas);
  };

  // Adicionar novo tópico a uma área
  const adicionarTopico = (areaIndex) => {
    const novasAreas = [...areas];
    novasAreas[areaIndex].Topicos.push({ Nome: "" });
    setAreas(novasAreas);
  };

  // Remover tópico de uma área
  const removerTopico = (areaIndex, topicoIndex) => {
    const novasAreas = [...areas];
    novasAreas[areaIndex].Topicos.splice(topicoIndex, 1);
    setAreas(novasAreas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Preparar payload
      const payload = {
        Nome: categoria.Nome,
        Areas: areas.map((area) => ({
          ID_Area: area.ID_Area, // pode ser undefined se for nova área
          Nome: area.Nome,
          Topicos: area.Topicos.map((topico) => ({
            ID_Topico: topico.ID_Topico, // pode ser undefined se for novo tópico
            Nome: topico.Nome,
          })),
        })),
      };

      const res = await fetch(`https://backend-4tkw.onrender.com/gestor/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const textoErro = await res.text();
        throw new Error(
          `Erro ao atualizar categoria: ${res.status} - ${textoErro}`
        );
      }

      alert("Categoria atualizada com sucesso!");

      setShowModal(false); //fecha o Modal depois da confirmação


      navigate("/gestor/gerircategorias");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return <p>A carregar categoria...</p>;
  if (!categoria) return <p>Categoria não encontrada.</p>;

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
      <h2>Editar Categoria</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowModal(true); 
        }}
      >
        <div className="mb-3">
          <label className="form-label">Nome da Categoria</label>
          <input
            type="text"
            className="form-control"
            value={categoria.Nome}
            onChange={handleNomeChange}
            required
          />
        </div>

        <div>
          <h4>Áreas</h4>
          {areas.length === 0 ? (
            <p>Sem áreas para esta categoria.</p>
          ) : (
            areas.map((area, areaIdx) => (
              <div
                key={area.ID_Area || areaIdx}
                className="mb-4 border p-4 rounded bg-light"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    value={area.Nome}
                    placeholder="Nome da Área"
                    onChange={(e) =>
                      handleNomeAreaChange(areaIdx, e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removerArea(areaIdx)}
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

                <h5>Tópicos</h5>
                {area.Topicos.length === 0 ? (
                  <p>Sem tópicos para esta área.</p>
                ) : (
                  area.Topicos.map((topico, topicoIdx) => (
                    <div
                      key={topico.ID_Topico || topicoIdx}
                      className="d-flex align-items-center mb-2"
                    >
                      <input
                        type="text"
                        className="form-control me-2"
                        value={topico.Nome}
                        placeholder="Nome do Tópico"
                        onChange={(e) =>
                          handleNomeTopicoChange(
                            areaIdx,
                            topicoIdx,
                            e.target.value
                          )
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-warning btn-sm"
                        onClick={() => removerTopico(areaIdx, topicoIdx)}
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
                  ))
                )}
                <button
                  type="button"
                  className="btn btn-success btn-sm mt-2"
                  onClick={() => adicionarTopico(areaIdx)}
                >
                  Adicionar Tópico{" "}
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
              </div>
            ))
          )}

          <button
            type="button"
            className="btn btn-success"
            onClick={adicionarArea}
          >
            Adicionar Área{" "}
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
        </div>

        <button type="submit" className="btn btn-light mt-3">
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
                <h5 className="modal-title">Confirmar Edição</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Tens a certeza que queres editar esta Categoria?</p>
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

export default EditarCategoria;
