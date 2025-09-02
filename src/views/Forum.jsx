import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import {
    FaArrowUp,
    FaArrowDown,
    FaComment,
    FaFire,
    FaClock,
    FaStar,
    FaPlus,
    FaEdit,
    FaTrash,
    FaReply,
    FaEllipsisH
} from 'react-icons/fa';
import api from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/Forum.css';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('recent');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const navigate = useNavigate();

    // Buscar posts do fórum
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await api.get(`/forum/posts?filter=${activeFilter}`);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Erro ao carregar posts:', err);
                setError('Erro ao carregar posts do fórum');
                setLoading(false);
            }
        };

        fetchPosts();
    }, [activeFilter]);


    const handleVote = async (postId, voteType) => {
        try {
            const response = await api.post(`/forum/posts/${postId}/vote`, { voteType });

            // Atualizar apenas o post que foi votado
            setPosts(posts.map(post =>
                post.id === postId ? {
                    ...post,
                    upvotes: response.data.upvotes,
                    downvotes: response.data.downvotes,
                    userVote: response.data.userVote // Garantir que userVote é atualizado
                } : post
            ));
        } catch (err) {
            console.error('Erro ao registrar voto:', err);
            setError('Erro ao registrar voto');
        }
    };

    const handleCreatePost = async () => {
        try {
            await api.post('/forum/posts', newPost);
            setShowCreatePost(false);
            setNewPost({ title: '', content: '' });
            // Recarregar posts
            const response = await api.get(`/forum/posts?filter=${activeFilter}`);
            setPosts(response.data);
        } catch (err) {
            console.error('Erro ao criar post:', err);
            setError('Erro ao criar post');
        }
    };



    const formatTime = (timestamp) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Agora mesmo';
        if (diffInHours < 24) return `Há ${diffInHours} horas`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `Há ${diffInDays} dias`;
    };

    return (
        <Container className="forum-page">
            <Row className="justify-content-center">
                <Col lg={10} xl={8}>
                    <div className="forum-header">
                        <h1>Fórum da Comunidade</h1>
                        <p>Discuta, compartilhe e aprenda com outros formandos</p>
                    </div>

                    <div className="forum-controls">
                        <Button
                            variant="primary"
                            className="create-post-btn"
                            onClick={() => setShowCreatePost(!showCreatePost)}
                        >
                            <FaPlus className="me-2" />
                            Criar Post
                        </Button>

                        <div className="filter-tabs">
                            <Button
                                variant={activeFilter === 'recent' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setActiveFilter('recent')}
                                className="me-2"
                            >
                                <FaClock className="me-1" />
                                Recentes
                            </Button>
                            <Button
                                variant={activeFilter === 'popular' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setActiveFilter('popular')}
                                className="me-2"
                            >
                                <FaFire className="me-1" />
                                Populares
                            </Button>
                            <Button
                                variant={activeFilter === 'top' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setActiveFilter('top')}
                            >
                                <FaStar className="me-1" />
                                Melhores
                            </Button>
                        </div>
                    </div>

                    {showCreatePost && (
                        <Card className="create-post-card mb-4">
                            <Card.Body>
                                <h5>Criar Novo Post</h5>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Título</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Título do seu post"
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Conteúdo</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Conteúdo do post"
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="outline-secondary"
                                            className="me-2"
                                            onClick={() => setShowCreatePost(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleCreatePost}
                                            disabled={!newPost.title || !newPost.content}
                                        >
                                            Publicar
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">A carregar posts...</p>
                        </div>
                    ) : (
                        <div className="posts-container">
                            {posts.length === 0 ? (
                                <Card className="text-center py-5">
                                    <Card.Body>
                                        <h5>Nenhum post ainda</h5>
                                        <p>Seja o primeiro a criar um post!</p>
                                    </Card.Body>
                                </Card>
                            ) : (
                                posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onVote={handleVote}
                                        formatTime={formatTime}
                                        navigate={navigate}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

const PostCard = ({ post, onVote, formatTime, navigate }) => {
    const [expanded, setExpanded] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [comment, setComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Função para carregar comentários quando o post é expandido
    const loadComments = async (postId) => {
        setLoadingComments(true);
        try {
            const response = await api.get(`/forum/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleExpand = async () => {
        const willExpand = !expanded;
        setExpanded(willExpand);

        // Se estamos expandindo e ainda não carregamos os comentários
        if (willExpand && comments.length === 0) {
            await loadComments(post.id);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmittingComment(true);
        try {
            await api.post(`/forum/posts/${post.id}/comments`, {
                content: comment,
                parentId: replyingTo
            });
            setComment('');
            setReplyingTo(null);
            // Recarregar comentários após adicionar um novo
            await loadComments(post.id);
        } catch (err) {
            console.error('Erro ao adicionar comentário:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentVote = async (commentId, voteType) => {
        try {
            const response = await api.post(`/forum/comments/${commentId}/vote`, { voteType });

            // Função recursiva para atualizar comentários
            const updateComments = (comments, targetId, newData) => {
                return comments.map(comment => {
                    if (comment.id === targetId) {
                        return { ...comment, ...newData };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateComments(comment.replies, targetId, newData)
                        };
                    }
                    return comment;
                });
            };

            setComments(prevComments =>
                updateComments(prevComments, commentId, {
                    upvotes: response.data.upvotes,
                    downvotes: response.data.downvotes,
                    userVote: response.data.userVote
                })
            );
        } catch (err) {
            console.error('Erro ao votar no comentário:', err);
        }
    };
    const startReply = (commentId) => {
        setReplyingTo(commentId);
        setComment('');
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setComment('');
    };

    return (
        <Card className="post-card mb-4">
            <Card.Body className="p-3">
                <div className="d-flex">
                    {/* Seção de Votos (lado esquerdo) */}
                    <div className="vote-section me-3 d-flex flex-column align-items-center">
                        <Button
                            variant="link"
                            className={`vote-btn p-0 ${post.userVote === 'up' ? 'voted' : ''}`}
                            onClick={() => onVote(post.id, 'up')}
                        >
                            <FaArrowUp size={20} className={post.userVote === 'up' ? 'text-primary' : 'text-muted'} />
                        </Button>
                        <span className="vote-count my-1 fw-bold">{post.upvotes - post.downvotes}</span>
                        <Button
                            variant="link"
                            className={`vote-btn p-0 ${post.userVote === 'down' ? 'voted' : ''}`}
                            onClick={() => onVote(post.id, 'down')}
                        >
                            <FaArrowDown size={20} className={post.userVote === 'down' ? 'text-danger' : 'text-muted'} />
                        </Button>
                    </div>

                    {/* Conteúdo do Post (lado direito) */}
                    <div className="post-content flex-grow-1">
                        <div className="post-header mb-2">
                            <span className="username fw-bold">{post.author}</span>
                            <span className="post-time text-muted ms-2">{formatTime(post.createdAt)}</span>
                        </div>

                        <h5 className="post-title mb-2">{post.title}</h5>
                        <p className="post-content-text mb-3">{post.content}</p>

                        <div className="post-actions d-flex align-items-center">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="d-flex align-items-center me-3"
                                onClick={handleExpand}
                            >
                                <FaComment className="me-1" />
                                {post.commentCount} comentários
                            </Button>
                        </div>

                        {expanded && (
                            <div className="comments-section mt-3">
                                <h6 className="mb-3">Comentários</h6>

                                <Form onSubmit={handleCommentSubmit} className="comment-form mb-3">
                                    <Form.Group>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder={replyingTo ? "A responder..." : "Adicione um comentário..."}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            disabled={submittingComment}
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end mt-2">
                                        {replyingTo && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="me-2"
                                                onClick={cancelReply}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={!comment.trim() || submittingComment}
                                        >
                                            {submittingComment ? 'Publicando...' : 'Comentar'}
                                        </Button>
                                    </div>
                                </Form>

                                {loadingComments ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" variant='primary' />
                                        <p className="mt-2">A carregar comentários...</p>
                                    </div>
                                ) : (
                                    <div className="comments-list">
                                        {comments.length > 0 ? (
                                            comments.map(comment => (
                                                <CommentItem
                                                    key={comment.id}
                                                    comment={comment}
                                                    formatTime={formatTime}
                                                    onVote={handleCommentVote}
                                                    onReply={startReply}
                                                    depth={0}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-muted text-center py-3">Nenhum comentário ainda.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

const CommentItem = ({
                         comment,
                         formatTime,
                         onVote,
                         onReply,
                         depth
                     }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmittingReply(true);
        try {
            await api.post(`/forum/posts/${comment.postId}/comments`, {
                content: replyText,
                parentId: comment.id
            });
            setReplyText('');
            setShowReplyForm(false);
            // Recarregar comentários após adicionar uma resposta
            // Você precisará passar a função loadComments como prop
        } catch (err) {
            console.error('Erro ao adicionar resposta:', err);
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className={`comment-item mb-2 ${depth > 0 ? 'comment-reply' : ''}`}>
            <div className="d-flex">
                {/* Votos para comentários */}
                <div className="vote-section me-2 d-flex flex-column align-items-center">
                    <Button
                        variant="link"
                        className={`vote-btn p-0 ${comment.userVote === 'up' ? 'voted' : ''}`}
                        onClick={() => onVote(comment.id, 'up')}
                    >
                        <FaArrowUp size={14} className={comment.userVote === 'up' ? 'text-primary' : 'text-muted'} />
                    </Button>
                    <span className="vote-count my-1 small fw-bold">{comment.upvotes - comment.downvotes}</span>
                    <Button
                        variant="link"
                        className={`vote-btn p-0 ${comment.userVote === 'down' ? 'voted' : ''}`}
                        onClick={() => onVote(comment.id, 'down')}
                    >
                        <FaArrowDown size={14} className={comment.userVote === 'down' ? 'text-danger' : 'text-muted'} />
                    </Button>
                </div>

                <div className="comment-content flex-grow-1">
                    <div className="comment-header d-flex align-items-center mb-1">
                        <span className="username small fw-bold">u/{comment.author}</span>
                        <span className="comment-time text-muted small ms-2">{formatTime(comment.createdAt)}</span>
                    </div>

                    <p className="comment-content-text mb-1 small">{comment.content}</p>

                    {/*<div className="comment-actions d-flex align-items-center">
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 me-2 text-decoration-none"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            <FaReply size={12} className="me-1" />
                            <span className="small">Responder</span>
                        </Button>

                        {comment.replies && comment.replies.length > 0 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-decoration-none"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? 'Ocultar respostas' : `Ver respostas (${comment.replies.length})`}
                            </Button>
                        )}
                    </div>*/}

                    {/* Formulário de resposta */}
                    {showReplyForm && (
                        <Form onSubmit={handleReplySubmit} className="mt-2">
                            <Form.Group>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Escreva sua resposta..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={submittingReply}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end mt-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => setShowReplyForm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!replyText.trim() || submittingReply}
                                >
                                    {submittingReply ? 'Publicando...' : 'Responder'}
                                </Button>
                            </div>
                        </Form>
                    )}

                    {/* Respostas aos comentários */}
                    {showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="comment-replies mt-2">
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    formatTime={formatTime}
                                    onVote={onVote}
                                    onReply={onReply}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum;