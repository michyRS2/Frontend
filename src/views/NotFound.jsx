import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);  // Navega para a página anterior
    };

    const handleGoHome = () => {
        navigate("/"); // Navega para a página inicial (ou qualquer rota que defina)
    };

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404 - Página Não Encontrada</h1>
                <p>Desculpe, a página que você está procurando não existe.</p>

                <div className="button-group">
                    <button className="btn-go-back" onClick={handleGoBack}>
                        Voltar
                    </button>
                    <button className="btn-go-home" onClick={handleGoHome}>
                        Voltar para o Início
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
