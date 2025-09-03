import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const NavigateToRole = () => {
  const { auth, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  if (!auth.isAuthenticated) return <Navigate to="/login" />;

  switch (auth.role) {
    case "formando":
      return <Navigate to="/formando/dashboard" />;
    case "gestor":
      return <Navigate to="/gestor/dashboard" />;
    case "formador":
      return <Navigate to="/formador/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

export default NavigateToRole;
