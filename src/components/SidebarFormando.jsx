import React, { useState, useEffect } from "react";
import { Nav, Spinner } from "react-bootstrap";
import { FaHome, FaBook, FaComments, FaUser, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const SidebarFormando = () => {
  const [view, setView] = useState("main");
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [areaSelecionada, setAreaSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://backend-4tkw.onrender.com";


  const loadCategorias = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/categorias`);
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async (categoriaId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/areas`);
      const data = await res.json();
      const filtradas = data.filter(a => a.ID_Categoria === categoriaId);
      setAreas(filtradas);
    } catch (err) {
      console.error("Erro ao carregar áreas", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopicos = async (areaId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/topicos`);
      const data = await res.json();
      const filtrados = data.filter(t => t.ID_Area === areaId);
      setTopicos(filtrados);
    } catch (err) {
      console.error("Erro ao carregar tópicos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCursosClick = () => {
    loadCategorias();
    setView("categorias");
  };

  const handleCategoriaClick = (cat) => {
    setCategoriaSelecionada(cat);
    loadAreas(cat.ID_Categoria);
    setView("areas");
  };

  const handleAreaClick = (area) => {
    setAreaSelecionada(area);
    loadTopicos(area.ID_Area);
    setView("topicos");
  };

  const voltarCategorias = () => {
    setCategoriaSelecionada(null);
    setAreaSelecionada(null);
    setAreas([]);
    setTopicos([]);
    setView("categorias");
  };

  const voltarAreas = () => {
    setAreaSelecionada(null);
    setTopicos([]);
    setView("areas");
  };

  const voltarMain = () => {
    setCategoriaSelecionada(null);
    setAreaSelecionada(null);
    setCategorias([]);
    setAreas([]);
    setTopicos([]);
    setView("main");
  };

  return (
    <Nav className="flex-column p-3 bg-light" style={{ width: "100%", height: "100%" }}>
      {view === "main" && (
        <>
          <Nav.Link as={Link} to="/formando/dashboard">
            <FaHome className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link onClick={handleCursosClick}>
            <FaBook className="me-2" /> Cursos
          </Nav.Link>
          <Nav.Link as={Link} to="forum">
            <FaComments className="me-2" /> Fórum
          </Nav.Link>
          <Nav.Link as={Link} to="perfil">
            <FaUser className="me-2" /> Perfil
          </Nav.Link>
        </>
      )}

      {view === "categorias" && (
        <>
          <Nav.Link onClick={voltarMain}>
            <FaArrowLeft className="me-2" /> Voltar
          </Nav.Link>
          <div className="mt-2 mb-2 fw-bold">Categorias</div>
          {loading ? <Spinner animation="border" size="sm" /> : (
            categorias.map(cat => (
              <Nav.Link key={cat.ID_Categoria} onClick={() => handleCategoriaClick(cat)}>
                {cat.Nome}
              </Nav.Link>
            ))
          )}
        </>
      )}

      {view === "areas" && (
        <>
          <Nav.Link onClick={voltarCategorias}>
            <FaArrowLeft className="me-2" /> {categoriaSelecionada?.Nome}
          </Nav.Link>
          <div className="mt-2 mb-2 fw-bold">Áreas</div>
          {loading ? <Spinner animation="border" size="sm" /> : (
            areas.length === 0
              ? <div className="text-muted ps-2">Sem áreas</div>
              : areas.map(area => (
                <Nav.Link key={area.ID_Area} onClick={() => handleAreaClick(area)}>
                  {area.Nome}
                </Nav.Link>
              ))
          )}
        </>
      )}

      {view === "topicos" && (
        <>
          <Nav.Link onClick={voltarAreas}>
            <FaArrowLeft className="me-2" /> {areaSelecionada?.Nome}
          </Nav.Link>
          <div className="mt-2 mb-2 fw-bold">Tópicos</div>
          {loading ? <Spinner animation="border" size="sm" /> : (
            topicos.length === 0
              ? <div className="text-muted ps-2">Sem tópicos</div>
              : topicos.map(topico => (
                <Nav.Link key={topico.ID_Topico} as={Link} to={`/formando/topico/${topico.ID_Topico}/cursos`}>
                  {topico.Nome}
                </Nav.Link>
              ))
          )}
        </>
      )}
    </Nav>
  );
};

export default SidebarFormando;