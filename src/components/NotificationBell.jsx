import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Button, Spinner } from 'react-bootstrap';
import { FaBell, FaEye, FaTrash, FaSync, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';
import api from '../../axiosConfig';
import '../styles/NotificationBell.css';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notificacoes?limit=10');
      setNotificacoes(response.data);
      
      const countResponse = await api.get('/notificacoes/nao-lidas');
      setNaoLidas(countResponse.data.count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
      setNotificacoes([]);
      setNaoLidas(0);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    try {
      await api.put(`/notificacoes/${id}/ler`);
      setNotificacoes(prev => prev.map(n => 
        n.ID_Notificacao === id ? { ...n, Lida: true, Data_Leitura: new Date() } : n
      ));
      setNaoLidas(prev => prev - 1);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.put('/notificacoes/ler-todas');
      setNotificacoes(prev => prev.map(n => ({ 
        ...n, 
        Lida: true, 
        Data_Leitura: new Date() 
      })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const removerNotificacao = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notificacoes/${id}`);
      setNotificacoes(prev => prev.filter(n => n.ID_Notificacao !== id));
      const notificacao = notificacoes.find(n => n.ID_Notificacao === id);
      if (notificacao && !notificacao.Lida) {
        setNaoLidas(prev => prev - 1);
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      alert('Erro ao remover notificação. Por favor, tente novamente.');
    }
  };

  const removerTodasNotificacoes = async () => {
    if (window.confirm('Tem a certeza que deseja remover todas as notificações?')) {
      try {
        await api.delete('/notificacoes/todas');
        setNotificacoes([]);
        setNaoLidas(0);
      } catch (error) {
        console.error('Erro ao remover todas as notificações:', error);
        alert('Erro ao remover notificações. Por favor, tente novamente.');
      }
    }
  };

  const removerTodasNotificacoesLidas = async () => {
    if (window.confirm('Tem a certeza que deseja remover todas as notificações lidas?')) {
      try {
        const response = await api.delete('/notificacoes/lidas');
        setNotificacoes(prev => prev.filter(n => !n.Lida));
        alert(response.data.message || 'Notificações lidas removidas com sucesso!');
      } catch (error) {
        console.error('Erro ao remover notificações lidas:', error);
        if (error.response) {
          alert(`Erro ${error.response.status}: ${error.response.data.error || 'Erro ao remover notificações'}`);
        } else {
          alert('Erro de conexão. Verifique a sua ligação à internet.');
        }
      }
    }
  };

  const handleClickNotificacao = (notificacao) => {
    // Fechar o dropdown
    const dropdownToggle = document.querySelector('.notification-dropdown .dropdown-toggle');
    if (dropdownToggle) {
      dropdownToggle.click();
    }
    
    // Se a notificação não estiver lida, marca como lida
    if (!notificacao.Lida) {
      marcarComoLida(notificacao.ID_Notificacao);
    }
    
    // Se a notificação tiver um link de ação, redireciona
    if (notificacao.Link_Acão) {
      navigate(notificacao.Link_Acão);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    const interval = setInterval(carregarNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatarData = (data) => {
    try {
      const agora = new Date();
      const dataNotificacao = new Date(data);
      
      if (isNaN(dataNotificacao.getTime())) {
        return 'Data inválida';
      }
      
      const diffMs = agora - dataNotificacao;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'agora mesmo';
      if (diffMins < 60) return `há ${diffMins} min`;
      if (diffHours < 24) return `há ${diffHours} h`;
      if (diffDays < 7) return `há ${diffDays} dias`;
      
      return dataNotificacao.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getPriorityIcon = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baixa': return '🟢';
      default: return '⚪';
    }
  };

  const temNotificaçõesLidas = notificacoes.length > 0 && notificacoes.some(n => n.Lida);

  return (
    <Dropdown className="notification-dropdown" align="end">
      <Dropdown.Toggle variant="link" className="notification-toggle text-white">
        <FaBell size={20} className="notification-icon" />
        {naoLidas > 0 && (
          <Badge bg="danger" className="notification-badge">
            {naoLidas}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="dropdown-header">
          <div className="header-content">
            <h6 className="header-title">NOTIFICAÇÕES</h6>
            <div className="header-actions">
              {naoLidas > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={marcarTodasComoLidas}
                  className="header-btn"
                  title="Marcar todas como lidas"
                >
                  <FaCheckDouble size={12} />
                </Button>
              )}
              {temNotificaçõesLidas && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={removerTodasNotificacoesLidas}
                  className="header-btn text-warning"
                  title="Remover notificações lidas"
                >
                  <FaTrash size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <Spinner size="sm" />
              <div className="mt-2">A carregar...</div>
            </div>
          ) : error ? (
            <div className="notification-empty">
              <div className="text-danger mb-2">⚠️</div>
              <div>{error}</div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={carregarNotificacoes}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-text">Sem notificações</div>
            </div>
          ) : (
            notificacoes.map(notificacao => (
              <div
                key={notificacao.ID_Notificacao}
                className={`notification-item ${!notificacao.Lida ? 'unread' : 'read'}`}
              >
                <div 
                  className="notification-content"
                  onClick={() => handleClickNotificacao(notificacao)}
                  style={{ cursor: notificacao.Link_Acão ? 'pointer' : 'default' }}
                >
                  <div className="notification-priority">
                    {getPriorityIcon(notificacao.Prioridade)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">
                      {notificacao.Titulo}
                      {notificacao.Link_Acão && (
                        <span className="link-indicator" title="Clicar para abrir">
                          🔗
                        </span>
                      )}
                    </div>
                    <div className="notification-message">
                      {notificacao.Mensagem}
                    </div>
                    <div className="notification-time">
                      {formatarData(notificacao.Data_Criacao)}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notificacao.Lida && (
                      <Button
                        variant="link"
                        size="sm"
                        className="action-btn mark-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarComoLida(notificacao.ID_Notificacao);
                        }}
                        title="Marcar como lida"
                      >
                        <FaEye size={12} />
                      </Button>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="action-btn remove-btn"
                      onClick={(e) => removerNotificacao(notificacao.ID_Notificacao, e)}
                      title="Remover notificação"
                    >
                      <FaTrashAlt size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="notification-footer">
          <Button 
            variant="link" 
            size="sm" 
            onClick={carregarNotificacoes}
            className="text-decoration-none"
            disabled={loading}
          >
            <FaSync size={12} className={`me-1 ${loading ? 'spinning' : ''}`} />
            {loading ? 'A carregar...' : 'Atualizar'}
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;