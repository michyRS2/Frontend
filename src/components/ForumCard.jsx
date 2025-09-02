const ForumCard = ({ topico }) => (
  <div className="forum-card">
    <h3>{topico.Titulo}</h3>
    <p>{topico.Descricao}</p>
  </div>
);

export default ForumCard;
