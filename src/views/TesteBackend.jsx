import { useState } from "react";
import api from "../../axiosConfig";

function TesteBackend() {
  const [mensagem, setMensagem] = useState("");

  const testarPublico = async () => {
    try {
      const res = await api.get("/publico");
      setMensagem(res.data.mensagem);
    } catch (err) {
      console.error("Erro ao aceder à rota pública:", err);
      setMensagem("Erro ao contactar o backend");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teste de Rota Pública</h2>
      <button onClick={testarPublico}>Testar Backend</button>
      {mensagem && <p>Resposta: {mensagem}</p>}
    </div>
  );
}

export default TesteBackend;
