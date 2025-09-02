import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../axiosConfig";
import { useNavigate } from "react-router-dom";



const GerirCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const carregarHierarquia = async () => {
      try {
        const resCategorias = await fetch("https://backend-4tkw.onrender.com/categorias");
        const listaCategorias = await resCategorias.json();

        const categoriasComAreasETopicos = await Promise.all(
          listaCategorias.map(async (categoria) => {
            const resAreas = await fetch(
              `https://backend-4tkw.onrender.com/areas?categoriaId=${categoria.ID_Categoria}`
            );
            const listaAreas = await resAreas.json();

            const areasComTopicos = await Promise.all(
              listaAreas.map(async (area) => {
                const resTopicos = await fetch(
                  `https://backend-4tkw.onrender.com/topicos?areaId=${area.ID_Area}`
                );
                const listaTopicos = await resTopicos.json();
                return { ...area, Topicos: listaTopicos };
              })
            );

            return { ...categoria, Areas: areasComTopicos };
          })
        );

        setCategorias(categoriasComAreasETopicos);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarHierarquia();
  }, []);

  const handleEliminarCategoria = async (categoria) => {
    if (
      window.confirm(`Confirmar eliminação da categoria "${categoria.Nome}"?`)
    ) {
      try {
        await axios.delete(
          `https://backend-4tkw.onrender.com/gestor/categorias/${categoria.ID_Categoria}`,
          {
            withCredentials: true,
          }
        );
        setCategorias(
          categorias.filter((c) => c.ID_Categoria !== categoria.ID_Categoria)
        );
      } catch (error) {
        console.error("Erro ao eliminar categoria:", error);
      }
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
    <h3 className="mb-4">Bem vindo à página de gestão de categorias</h3>
    

    {categorias.map((categoria) => {
      const areas = categoria.Areas.length > 0
        ? categoria.Areas
        : [{ Nome: null, Topicos: [] }];

      return (
        <div key={categoria.ID_Categoria} className="mb-4 border rounded p-3 bg-light">
          {/* Nome da categoria e botões */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 fw-bold">{categoria.Nome}</h5>
            <div>
              <Link
                to={`/gestor/editarcategoria/${categoria.ID_Categoria}`}
                className="btn btn-primary me-2"
              >
                Editar <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
              </Link>
              <button
                onClick={() => handleEliminarCategoria(categoria)}
                className="btn btn-danger"
              >
                Eliminar <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              </button>
            </div>
          </div>

          {/* Tabela de áreas e tópicos */}
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-dark text-center">
              <tr>
                <th style={{ width: "40%" }}>Áreas</th>
                <th style={{ width: "60%" }}>Tópicos</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area, areaIndex) => {
                const topicos = area.Topicos.length > 0 ? area.Topicos : [null];
                const totalTopicosArea = area.Topicos.length || 1;
                let areaPrinted = false;

                return topicos.map((topico, index) => (
                  <tr key={`cat${categoria.ID_Categoria}-area${areaIndex}-top${topico?.ID_Topico || "vazio"}`}>
                    {!areaPrinted && (
                      <td
                        rowSpan={totalTopicosArea}
                        className="fw-semibold text-center align-middle"
                      >
                        {area.Nome || <em>Sem áreas</em>}
                      </td>
                    )}
                    <td>{topico ? topico.Nome : <em>Sem tópicos</em>}</td>
                    {(areaPrinted = true)}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      );
    })}
  </div>
);

};

export default GerirCategorias;
