import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import api, { setToken } from '../../axiosConfig';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [recoveryMessage, setRecoveryMessage] = useState('');
    const [recoveryError, setRecoveryError] = useState('');
    const [loadingRecovery, setLoadingRecovery] = useState(false);

    const navigate = useNavigate();

    // Verifica se já há token no localStorage
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) setToken(token);

            try {
                const res = await api.get('/auth/check');
                const { role } = res.data.user;

                if (role === 'formando') navigate('/formando/dashboard');
                else if (role === 'gestor') navigate('/gestor/dashboard');
                else if (role === 'formador') navigate('/formador/dashboard');
            } catch (err) {
                if (err.response?.status !== 401) console.error(err);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setRecoveryMessage('');
        setRecoveryError('');

        try {
            const res = await api.post('/auth/login', {
                Email: email,
                Password: password,
            });

            const { token, user, role } = res.data;

            // Guardar token e info do utilizador
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', role);

            // Configurar axios para enviar token em futuros pedidos
            setToken(token);

            // Redirecionar
            if (role === 'formando') navigate('/formando/dashboard');
            else if (role === 'gestor') navigate('/gestor/dashboard');
            else if (role === 'formador') navigate('/formador/dashboard');
            else setError('Tipo de utilizador desconhecido.');
        } catch (err) {
            setError(err.response?.data?.message || 'Falha no login.');
        }
    };

    const handlePasswordRecovery = async () => {
        setRecoveryMessage('');
        setRecoveryError('');

        if (!email) {
            setRecoveryError('Por favor, insira seu email para recuperar a palavra-passe.');
            return;
        }

        try {
            setLoadingRecovery(true);
            await api.post('/auth/request-password-reset', { email });
            setRecoveryMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.');
        } catch (err) {
            setRecoveryError(err.response?.data?.message || 'Erro ao enviar email de recuperação.');
        } finally {
            setLoadingRecovery(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <img
                        src="https://amchamportugal.pt/wp-content/uploads/2017/12/logotipo_softinsa.png"
                        alt="Softinsa Logo"
                        className="login-logo"
                    />

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Palavra-passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Entrar</button>

                    <p className="forgot-password">
                        <button
                            type="button"
                            onClick={handlePasswordRecovery}
                            disabled={loadingRecovery}
                        >
                            Esqueceu-se da palavra-passe?
                        </button>
                    </p>

                    {recoveryMessage && <p style={{ color: 'green' }}>{recoveryMessage}</p>}
                    {recoveryError && <p style={{ color: 'red' }}>{recoveryError}</p>}

                    <div className="divider">
                        <span>Outras opções de login</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
