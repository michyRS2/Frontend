import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NovaCategoria = () => {
  const navigate = useNavigate();

  const [nomeCategoria, setNomeCategoria] = useState("");
  const [areas, setAreas] = useState([{ nome: "", topicos: [""] }]);

  const [showModal, setShowModal] = useState(false);

  const handleCategoriaChange = (e) => {
    setNomeCategoria(e.target.value);
  };

  const handleAreaChange = (index, value) => {
    const novasAreas = [...areas];
    novasAreas[index].nome = value;
    setAreas(novasAreas);
  };

  const handleTopicoChange = (areaIdx, topicoIdx, value) => {
    const novasAreas = [...areas];
    novasAreas[areaIdx].topicos[topicoIdx] = value;
    setAreas(novasAreas);
  };

  const adicionarArea = () => {
    setAreas([...areas, { nome: "", topicos: [""] }]);
  };

  const removerArea = (index) => {
    const novasAreas = areas.filter((_, i) => i !== index);
    setAreas(novasAreas);
  };

  const adicionarTopico = (areaIdx) => {
    const novasAreas = [...areas];
    novasAreas[areaIdx].topicos.push("");
    setAreas(novasAreas);
  };

  const removerTopico = (areaIdx, topicoIdx) => {
    const novasAreas = [...areas];
    novasAreas[areaIdx].topicos.splice(topicoIdx, 1);
    setAreas(novasAreas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar dados, limpando espaços e filtrando strings vazias
    const novaCategoria = {
      nome: nomeCategoria.trim(),
      areas: areas.map((area) => ({
        nome: area.nome.trim(),
        topicos: area.topicos.map((t) => t.trim()).filter((t) => t !== ""),
      })),
    };

    // Validação simples no frontend
    if (
      !novaCategoria.nome ||
      novaCategoria.areas.length === 0 ||
      novaCategoria.areas.some((a) => !a.nome || a.topicos.length === 0)
    ) {
      alert("Preenche todos os campos antes de submeter.");
      return;
    }

    console.log(
      "Enviando nova categoria:",
      JSON.stringify(novaCategoria, null, 2)
    );

    try {
      const response = await fetch("https://backend-4tkw.onrender.com/gestor/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(novaCategoria),
      });

      if (response.ok) {
        alert("Categoria criada com sucesso!");

        setShowModal(false);

        setNomeCategoria("");
        setAreas([{ nome: "", topicos: [""] }]);
        navigate("/gestor/dashboard");
      } else {
        const erro = await response.json();
        alert(
          "Erro ao criar categoria: " + (erro.error || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao comunicar com o servidor:", error);
      alert("Erro na comunicação com o servidor.");
    }
  };

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
      <h2>Criar Nova Categoria</h2>
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
            value={nomeCategoria}
            onChange={handleCategoriaChange}
            required
          />
        </div>

        {areas.map((area, areaIdx) => (
          <div key={areaIdx} className="border p-4 rounded mb-3 bg-light">
            <div className="mb-2 d-flex justify-content-between align-items-center">
              <label className="form-label mb-0">Área {areaIdx + 1}</label>
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
            <input
              type="text"
              className="form-control mb-2"
              value={area.nome}
              onChange={(e) => handleAreaChange(areaIdx, e.target.value)}
              placeholder="Nome da Área"
              required
            />
            <p>Tópicos</p>
            {area.topicos.map((topico, topicoIdx) => (
              <div key={topicoIdx} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={topico}
                  onChange={(e) =>
                    handleTopicoChange(areaIdx, topicoIdx, e.target.value)
                  }
                  placeholder={`Tópico ${topicoIdx + 1}`}
                  required
                />
                <button
                  type="button"
                  className="btn btn-warning"
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
            ))}

            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => adicionarTopico(areaIdx)}
            >
              Adicionar Tópico{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#e3e3e3"
              >
                <path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-success mb-3"
          onClick={adicionarArea}
        >
          Adicionar Área{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#e3e3e3"
          >
            <path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z" />
          </svg>
        </button>

        <br />
        <button type="submit" className="btn btn-light">
          Guardar Categoria{" "}
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
                <h5 className="modal-title">Confirmar Criação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Tens a certeza que queres criar esta Categoria?</p>
                <p>
                  <strong>{nomeCategoria}</strong>
                </p>
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

export default NovaCategoria;