import React from "react";
import "../styles/ForumCard.css";

const ForumCard = ({ topico }) => (
    <div className="forum-card">
        <div className="forum-card-header">
            <h3 className="forum-card-title">{topico.Titulo}</h3>
            <span className="forum-card-badge">{topico.Respostas} respostas</span>
        </div>
        <p className="forum-card-description">{topico.Descricao}</p>
        <div className="forum-card-footer">
            <span className="forum-card-author">Por: {Autor}</span>
            <span className="forum-card-date">{topico.Data}</span>
        </div>
    </div>
);

export default ForumCard;