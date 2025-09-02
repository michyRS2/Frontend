// views/ResetPassword.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../axiosConfig";
import '../styles/ResetPassword.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const checkPasswordRequirements = (password) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
        };
    };

    const passwordChecks = checkPasswordRequirements(newPassword);

    const handleSubmit = async () => {
        setError("");
        setMessage("");

        if (newPassword !== confirmNewPassword) {
            setError("A nova senha e a confirmação não coincidem.");
            return;
        }

        if (!Object.values(passwordChecks).every(Boolean)) {
            setError("A nova senha não cumpre os requisitos.");
            return;
        }

        try {
            await api.post("/auth/reset-password", {
                token,
                email,
                currentPassword,
                newPassword,
            });

            setMessage("Senha redefinida com sucesso!");


            // Redirecionar para login
            setTimeout(() => {
                navigate("/login");
            }, 500);

        } catch (err) {
            setError(err.response?.data?.message || "Erro ao redefinir a senha.");
        }
    };

    const renderRequirement = (label, isValid) => (
        <li style={{ color: isValid ? "green" : "red" }}>{label}</li>
    );

    return (
        <div className="reset-wrapper">
            <div className="reset-container">
                <h2>Redefinir Senha</h2>

                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}

                <input
                    type="password"
                    placeholder="Senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                />

                <ul>
                    {renderRequirement("Mínimo 8 caracteres", passwordChecks.length)}
                    {renderRequirement("Pelo menos 1 letra maiúscula", passwordChecks.uppercase)}
                    {renderRequirement("Pelo menos 1 letra minúscula", passwordChecks.lowercase)}
                    {renderRequirement("Pelo menos 1 número", passwordChecks.number)}
                </ul>

                <button onClick={handleSubmit}>Redefinir</button>
            </div>
        </div>
    );
}
