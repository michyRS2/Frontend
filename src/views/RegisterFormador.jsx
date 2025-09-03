import React, { useState } from "react";
import api from "../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";

const RegisterFormador = () => {
  const [formData, setFormData] = useState({
    Nome: "",
    Email: "",
    Password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkPasswordRequirements = (password) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };
    };

    const passwordChecks = checkPasswordRequirements(formData.Password);

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
        setSuccess('');

        const { Password, confirmPassword, ...rest } = formData;

        if (Password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!isPasswordValid) {
            setError('A senha não cumpre os requisitos.');
            return;
        }
    try {
      await api.post("/auth/register-formador", formData);
      setSuccess('Registo concluído! Redirecionando para o login...');

      setTimeout(() => navigate("/login"), 2000); // redireciona para login do formador
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registar formador");
    }
  };

  const renderRequirement = (label, isValid) => (
        <li style={{ color: isValid ? 'green' : 'red' }}>{label}</li>
    );

  return (
        <div className="register-wrapper">
            <div className="register-container">
                <img
                    src="https://amchamportugal.pt/wp-content/uploads/2017/12/logotipo_softinsa.png"
                    alt="Softinsa Logo"
                    className="register-logo"
                />

                <form onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}

                    <input type="text" name="Nome" placeholder="Nome" value={formData.Nome} onChange={handleChange} required />
                    <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} required />
                    <input type="password" name="Password" placeholder="Senha" value={formData.Password} onChange={handleChange} required />
                    <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} required />

                    <ul>
                        {renderRequirement("Mínimo 8 caracteres", passwordChecks.length)}
                        {renderRequirement("Pelo menos 1 letra maiúscula", passwordChecks.uppercase)}
                        {renderRequirement("Pelo menos 1 letra minúscula", passwordChecks.lowercase)}
                        {renderRequirement("Pelo menos 1 número", passwordChecks.number)}
                    </ul>

                    <button type="submit">Registar</button>

                    <p className="login-link">
                        Já tem conta? <Link to="/login">Faça login</Link>
                    </p>

                    <div className="divider"><span>Ou</span></div>

                    <button
                        type="button"
                        className="social-button google-button"
                        onClick={() => alert('Login com Google ainda não implementado')}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} />
                        Entrar com Google
                    </button>

                    <button
                        type="button"
                        className="social-button linkedin-button"
                        onClick={() => alert('Login com LinkedIn ainda não implementado')}
                    >
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyKWtwq7eaAFkn2YOg9p8QcFlFMYo5_Kfll681DvALo3CYn2olVb9LwvTouUQF9pGrIl4"
                            alt = "Linkedin"
                            width={20}
                            />
                        Entrar com LinkedIn
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterFormador;
