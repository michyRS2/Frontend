import React, { useState } from "react";
import api from "../../axiosConfig";
import { useNavigate } from "react-router-dom";

const RegisterFormador = () => {
  const [formData, setFormData] = useState({ Nome: "", Email: "", Password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register-formador", formData);
      navigate("/login"); // redireciona para login do formador
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registar formador");
    }
  };

  return (
    <div className="register-container">
      <h2>Registo de Formador</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="Nome" placeholder="Nome" onChange={handleChange} required />
        <input type="email" name="Email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="Password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Registar</button>
      </form>
    </div>
  );
};

export default RegisterFormador;
