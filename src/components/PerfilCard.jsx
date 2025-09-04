import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Image, Row, Col, Spinner } from 'react-bootstrap';
import { FaUserEdit, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../axiosConfig'; // Importar a instância configurada

const PerfilCard = () => {
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        Nome: '',
        email: '',
        role: '',
        phone: '',
        bio: '',
        location: '',
        profileImage: null
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Buscar dados do perfil ao carregar o componente
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                setLoading(true);
                setError('');

                const [profileRes, authRes] = await Promise.all([
                    api.get('/perfil'),
                    api.get('/auth/check', { withCredentials: true })
                ]);

                const { Nome, Email, phone, bio, location, profileImage } = profileRes.data;
                const { role } = authRes.data.user;

                setUserData({
                    Nome,
                    email: Email,
                    phone: phone || '',
                    bio: bio || '',
                    location: location || '',
                    profileImage,
                    role
                });

                setLoading(false);
            } catch (err) {
                console.error('Erro ao carregar perfil/role:', err);
                if (err.response?.status === 401) {
                    setError('Sua sessão expirou. Por favor, faça login novamente.');
                } else {
                    setError('Erro ao carregar dados do perfil');
                }
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);


    const handleChange = (e) => {
        const { Nome, value } = e.target;
        setUserData(prev => ({ ...prev, [Nome]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');

            // Atualizar dados básicos
            await api.put('/perfil', {
                Nome: userData.Nome,
                phone: userData.phone,
                bio: userData.bio,
                location: userData.location
            });

            // Atualizar imagem se foi selecionada uma nova
            if (profileImageFile) {
                const formData = new FormData();
                formData.append('profileImage', profileImageFile);

                const imageResponse = await api.put('/perfil/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setUserData(prev => ({
                    ...prev,
                    profileImage: imageResponse.data.profileImage
                }));
            }

            setSuccess('Perfil atualizado com sucesso!');
            setEditMode(false);
            setProfileImageFile(null);
            setPreviewImage(null);
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);

            if (err.response?.status === 401) {
                setError('Sua sessão expirou. Por favor, faça login novamente.');
            } else {
                setError('Erro ao atualizar perfil');
            }
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p>Carregando perfil...</p>
            </div>
        );
    }

    return (
        <Card className="Perfil-card">
            <Card.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="Perfil-header">
                    <div className="avatar-container">
                        {previewImage ? (
                            <Image src={previewImage} roundedCircle className="Perfil-avatar" />
                        ) : userData.profileImage ? (
                            <Image
                                src={`http://localhost:3000/uploads/profiles/${userData.profileImage}`}
                                roundedCircle
                                className="Perfil-avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?Nome=${encodeURIComponent(userData.Nome)}&background=007bff&color=fff&size=128`;
                                }}
                            />
                        ) : (
                            <Image
                                src={`https://ui-avatars.com/api/?Nome=${encodeURIComponent(userData.Nome)}&background=007bff&color=fff&size=128`}
                                roundedCircle
                                className="Perfil-avatar"
                            />
                        )}

                        {editMode && (
                            <>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="avatar-edit-btn"
                                    onClick={() => document.getElementById('avatar-upload').click()}
                                >
                                    Alterar
                                </Button>
                            </>
                        )}
                    </div>

                    
                </div>

                {editMode ? (
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Nome"
                                        value={userData.Nome}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Telefone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formLocation">
                                    <Form.Label>Localização</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={userData.location}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="formBio" className="mb-3">
                            <Form.Label>Biografia</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="bio"
                                value={userData.bio}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                ) : (
                    <div className="Perfil-info">
                        <h3 className="Perfil-name">{userData.Nome}</h3>
                        <p className="Perfil-email">{userData.email}</p>
                        <p className="Perfil-role" style={{ textTransform: 'capitalize' }}>{userData.role}</p>

                        <div className="Perfil-details">
                            {userData.phone && <p><strong>Telefone:</strong> {userData.phone}</p>}
                            {userData.location && <p><strong>Localização:</strong> {userData.location}</p>}
                            {userData.bio && <p><strong>Biografia:</strong> {userData.bio}</p>}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PerfilCard;