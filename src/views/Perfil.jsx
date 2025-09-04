import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import PerfilCard from '../components/PerfilCard.jsx';
import '../styles/Perfil.css';
import api from '../../axiosConfig';

const Perfil = () => {
    const [stats, setStats] = useState({
        completedCourses: 0,
        averageProgress: 0,
        hoursTrained: 0
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Buscar estatísticas do perfil
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                setError('');

                // Obter dados do dashboard para calcular estatísticas
                const dashboardResponse = await api.get('/dashboard');
                const dashboardData = dashboardResponse.data;

                setUserEmail(dashboardData.Email || '');

                const cursosInscritos = dashboardData.cursosInscritos || [];

                // calcular cursos concluídos
                const completedCourses = cursosInscritos.filter(curso => {
                    const progresso = curso.quizProgress ?? 0;
                    return progresso === 100;
                }).length;

                // calcular progresso médio ponderado
                let totalPercent = 0;
                let totalQuizzes = 0;
                cursosInscritos.forEach(curso => {
                    const quizzesCount = curso.quizCounts ?? 0;
                    const progresso = curso.quizProgress ?? 0;
                    totalPercent += progresso * quizzesCount;
                    totalQuizzes += quizzesCount;
                });
                const averageProgress = totalQuizzes > 0 ? Math.round(totalPercent / totalQuizzes) : 0;

                setStats({
                    completedCourses,
                    averageProgress,
                    hoursTrained: dashboardData.hoursTrained || 0
                });

                setLoadingStats(false);
            } catch (err) {
                console.error('Erro ao carregar estatísticas:', err);

                if (err.response?.status === 401) {
                    setError('A sua sessão expirou. Por favor, faça login novamente.');
                } else {
                    setError('Erro ao carregar estatísticas do perfil');
                }

                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    const handlePasswordRecovery = async () => {
        if (!userEmail) {
            setPasswordError('Email não disponível');
            return;
        }
        try {
            await api.post('auth/request-password-reset', { email: userEmail });
            setPasswordError('');
            setPasswordSuccess('Email de recuperação enviado! Verifique a sua caixa de entrada.');
        } catch (err) {
            setPasswordSuccess('');
            setPasswordError(err.response?.data?.message || 'Erro ao enviar email de recuperação');
        }
    };

    return (
        <Container className="Perfil-page">
            <Row className="justify-content-center">
                <Col lg={8}>
                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                    <PerfilCard />
                </Col>
            </Row>

            <Row className="mt-4 justify-content-center">
                <Col lg={8}>
                    <Card className="Perfil-stats">
                        <Card.Body>
                            <h5 className="card-title">Estatísticas</h5>
                            {loadingStats ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" variant="primary" />
                                    <span className="ms-2">Carregando estatísticas...</span>
                                </div>
                            ) : (
                                <Row className="text-center">
                                    <Col md={4} className="stat-item">
                                        <div className="stat-value">{stats.completedCourses}</div>
                                        <div className="stat-label">Cursos Concluídos</div>
                                    </Col>
                                    <Col md={4} className="stat-item">
                                        <div className="stat-value">{stats.averageProgress}%</div>
                                        <div className="stat-label">Progresso Médio</div>
                                    </Col>
                                    <Col md={4} className="stat-item">
                                        <div className="stat-value">{stats.hoursTrained}</div>
                                        <div className="stat-label">Horas de Formação</div>
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 justify-content-center">
                <Col lg={8}>
                    <Card className="Perfil-security">
                        <Card.Body>
                            {passwordSuccess && <Alert variant="success" className="mt-3">{passwordSuccess}</Alert>}
                            {passwordError && <Alert variant="danger" className="mt-3">{passwordError}</Alert>}
                            <h5 className="card-title">Segurança da Conta</h5>

                            <div className="security-item mt-4">
                                <div className="security-info">
                                    <h6>Recuperação de Senha</h6>
                                    <p>Esqueceu a sua senha? Solicite um link de recuperação</p>
                                </div>
                                <Button
                                    variant="outline-primary"
                                    onClick={handlePasswordRecovery}
                                >
                                    Enviar Email de Recuperação
                                </Button>
                            </div>

                            <div className="security-item mt-4">
                                <div className="security-info">
                                    <h6>Autenticação de dois fatores</h6>
                                    <p>Proteção adicional para a sua conta</p>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="twoFactorSwitch"
                                        disabled
                                    />
                                    <label className="form-check-label" htmlFor="twoFactorSwitch">
                                        Ativar (em breve)
                                    </label>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Perfil;
