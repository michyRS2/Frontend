import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import api from '../axiosConfig';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [recoveryMessage, setRecoveryMessage] = useState('');
    const [recoveryError, setRecoveryError] = useState('');
    const [loadingRecovery, setLoadingRecovery] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/check', {
                    withCredentials: true,
                });

                const { role } = res.data.user;

                if (role === 'formando') navigate('/formando/dashboard');
                else if (role === 'gestor') navigate('/gestor/dashboard');
                else if (role === 'formador') navigate('/formador/dashboard');
            } catch (err) {
                // Usuário não autenticado — permanece na tela de login
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
            const res = await api.post('/login', {
                Email: email,
                Password: password,
            }, {
                withCredentials: true
            });

            const { token, user, role } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', role);

            if (role === 'formando') {
                navigate('/formando/dashboard');
            } else if (role === 'gestor') {
                navigate('/gestor/dashboard');
            } else if (role === 'formador') {
                navigate('/formador/dashboard');
            } else {
                setError('Tipo de usuário desconhecido.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Falha no login.');
        }
    };

    const handlePasswordRecovery = async () => {
        setRecoveryMessage('');
        setRecoveryError('');

        if (!email) {
            setRecoveryError('Por favor, insira seu email para recuperar a senha.');
            return;
        }

        try {
            setLoadingRecovery(true);
            await api.post('/auth/request-password-reset', { email });
            setRecoveryMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
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
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Entrar</button>

                    <p className="forgot-password">
                        {/* Alterado para um botão para enviar o email de recuperação */}
                        <button
                            type="button"
                            onClick={handlePasswordRecovery}
                            disabled={loadingRecovery}
                        >
                            Esqueceu-se da palavra-passe?
                        </button>
                    </p>

                    {/* Mensagens de recuperação */}
                    {recoveryMessage && <p style={{ color: 'green' }}>{recoveryMessage}</p>}
                    {recoveryError && <p style={{ color: 'red' }}>{recoveryError}</p>}

                    <div className="divider">
                        <span>Outras opções de login</span>
                    </div>

                    <button
                        type="button"
                        className="social-button google-button"
                        onClick={() => alert('Login com Google ainda não implementado')}
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            width={20}
                        />
                        Entrar com Google
                    </button>

                    <button
                        type="button"
                        className="social-button linkedin-button"
                        onClick={() => alert('Login com LinkedIn ainda não implementado')}
                    >
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyKWtwq7eaAFkn2YOg9p8QcFlFMYo5_Kfll681DvALo3CYn2olVb9LwvTouUQF9pGrIl4"
                            alt="Linkedin"
                            width={20}
                        />
                        Entrar com LinkedIn
                    </button>

                    <p className="register">
                        Não tem conta? <Link to="/register">Registe-se aqui</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
