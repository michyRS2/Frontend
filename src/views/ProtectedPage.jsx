// ProtectedPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../axiosConfig';

export default function ProtectedPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/check'); // rota protegida
        setMessage(`Acesso concedido! Role: ${res.data.user.role}`);
      } catch (err) {
        setError(err.response?.status === 401 ? 'Não autorizado! Faça login primeiro.' : 'Erro desconhecido.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Teste de Rota Protegida</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
