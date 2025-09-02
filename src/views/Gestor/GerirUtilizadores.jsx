import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Modal, Form, Spinner, Alert, Row, Col, Card } from "react-bootstrap";
import { FaCheck, FaTimes, FaEye, FaUserPlus, FaUserCheck, FaUserClock } from "react-icons/fa";
import api from "../../axiosConfig";
import "../../styles/GerirUtilizadores.css";

const GerirUtilizadores = () => {
  const [utilizadores, setUtilizadores] = useState([]);
  const [pedidosRegisto, setPedidosRegisto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [utilizadoresRes, pedidosRes] = await Promise.all([
        api.get("/gestor/utilizadores"),
        api.get("/gestor/pedidos-registo")
      ]);
      
      setUtilizadores(utilizadoresRes.data);
      setPedidosRegisto(pedidosRes.data);
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceitarRegisto = async (pedidoId, tipo) => {
    try {
      await api.put(`/gestor/pedidos-registo/${pedidoId}/aceitar`, { tipo });
      
      // Atualizar ambas as listas
      setPedidosRegisto(pedidosRegisto.filter(p => p.id !== pedidoId));
      await carregarDados(); // Recarregar TODOS os dados
      
    } catch (err) {
      setError("Erro ao aceitar pedido de registo");
      console.error("Erro:", err);
    }
  };

  const handleRejeitarRegisto = async (pedidoId, tipo) => {
    try {
      await api.put(`/gestor/pedidos-registo/${pedidoId}/rejeitar`, { tipo });
      
      // Atualizar ambas as listas
      setPedidosRegisto(pedidosRegisto.filter(p => p.id !== pedidoId));
      await carregarDados(); // Recarregar TODOS os dados
      
    } catch (err) {
      setError("Erro ao rejeitar pedido de registo");
      console.error("Erro:", err);
    }
  };

  const handleAlterarEstado = async (userId, tipo, novoEstado) => {
    try {
      await api.put(`/gestor/utilizadores/${userId}`, {
        estado: novoEstado,
        tipo: tipo
      });
      
      // Atualizar o estado local em vez de recarregar tudo
      setUtilizadores(prev => prev.map(user => 
        user.id === userId ? { ...user, estado: novoEstado } : user
      ));
      
    } catch (err) {
      setError("Erro ao alterar estado do utilizador");
      console.error("Erro:", err);
    }
  };

  const verDetalhesUtilizador = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filtrarUtilizadores = () => {
    if (filter === "todos") return utilizadores;
    return utilizadores.filter(user => user.estado === filter);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">A carregar utilizadores...</p>
      </Container>
    );
  }

  return (
    <Container className="gerir-utilizadores-page">
      <div className="page-header">
        <h1>Gestão de Utilizadores</h1>
        <p className="text-muted">Gerir utilizadores e pedidos de registo</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      <Row>
        {/* Estatísticas */}
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon total">
                  <FaUserPlus />
                </div>
                <div className="ms-3">
                  <h4>{utilizadores.length}</h4>
                  <p className="text-muted mb-0">Total Utilizadores</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon pending">
                  <FaUserClock />
                </div>
                <div className="ms-3">
                  <h4>{pedidosRegisto.length}</h4>
                  <p className="text-muted mb-0">Pedidos Pendentes</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon active">
                  <FaUserCheck />
                </div>
                <div className="ms-3">
                  <h4>{utilizadores.filter(u => u.estado === 'ativo').length}</h4>
                  <p className="text-muted mb-0">Utilizadores Ativos</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pedidos de Registo Pendentes */}
      {pedidosRegisto.length > 0 && (
        <div className="section mt-4">
          <h4>
            <FaUserClock className="me-2" />
            Pedidos de Registo Pendentes
          </h4>
          <Table responsive striped className="mt-3">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Data Pedido</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRegisto.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.nome}</td>
                  <td>{pedido.email}</td>
                  <td>
                    <Badge bg="info">{pedido.tipo}</Badge>
                  </td>
                  <td>{new Date(pedido.dataPedido).toLocaleDateString('pt-PT')}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleAceitarRegisto(pedido.id, pedido.tipo)}
                    >
                      <FaCheck /> Aceitar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejeitarRegisto(pedido.id, pedido.tipo)}
                    >
                      <FaTimes /> Rejeitar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Lista de Utilizadores */}
      <div className="section mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Todos os Utilizadores</h4>
          <Form.Select
            style={{ width: '200px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="pendente">Pendentes</option>
          </Form.Select>
        </div>

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Data Registo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrarUtilizadores().map(user => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={
                    user.tipo === 'gestor' ? 'primary' :
                    user.tipo === 'formador' ? 'warning' : 'secondary'
                  }>
                    {user.tipo}
                  </Badge>
                </td>
                <td>
                  <Badge bg={
                    user.estado === 'ativo' ? 'success' :
                    user.estado === 'inativo' ? 'secondary' : 
                    user.estado === 'pendente' ? 'warning' : 'danger'
                  }>
                    {user.estado}
                  </Badge>
                </td>
                <td>{new Date(user.dataRegisto).toLocaleDateString('pt-PT')}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => verDetalhesUtilizador(user)}
                  >
                    <FaEye /> Detalhes
                  </Button>
                  {user.estado === 'ativo' ? (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleAlterarEstado(user.id, user.tipo, 'inativo')}
                    >
                      Desativar
                    </Button>
                  ) : (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleAlterarEstado(user.id, user.tipo, 'ativo')}
                    >
                      Ativar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal de Detalhes do Utilizador */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Utilizador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <h6>Informações Pessoais</h6>
                <p><strong>Nome:</strong> {selectedUser.nome}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Tipo:</strong> {selectedUser.tipo}</p>
                <p><strong>Estado:</strong> {selectedUser.estado}</p>
              </Col>
              <Col md={6}>
                <h6>Informações Adicionais</h6>
                <p><strong>Data de Registo:</strong> {new Date(selectedUser.dataRegisto).toLocaleDateString('pt-PT')}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GerirUtilizadores;