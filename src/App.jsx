import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import api, { setToken } from "../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";

import MainLayout from "./layouts/MainLayout";
import Perfil from "./views/Perfil";
import Login from "./views/Login";
import Register from "./views/Register";
import DashboardFormando from "./views/Formando/DashboardFormando";
import CursoRecomendado from "./views/Formando/CursoRecomendado";
import CursoInscrito from "./views/Formando/CursoInscrito";
import DashboardGestor from "./views/Gestor/DashboardGestor";
import NovoCurso from "./views/Gestor/NovoCurso";
import EditarCurso from "./views/Gestor/EditarCurso";
import NotFound from "./views/NotFound";
import ModulosAulas from "./views/Gestor/ModulosAulas";
import DashboardFormador from "./views/Formador/DashboardFormador";
import EditarCursoFormador from "./views/Formador/EditarCursoFormador";
import ResetPassword from "./views/ResetPassword";
import GerirCategorias from "./views/Gestor/GerirCategorias";
import NovaCategoria from "./views/Gestor/NovaCategoria";
import EditarCategoria from "./views/Gestor/EditarCategoria";
import Forum from "./views/Forum";
import CursosTopico from "./views/Formando/CursosTopico";
import GerirUtilizadores from "./views/Gestor/GerirUtilizadores";
import SearchResults from "./components/SearchResults";
import QuizCurso from "./views/Formando/QuizCurso";
import QuizResponder from "./views/Formando/QuizResponder";
import NovoQuiz from "./views/Gestor/NovoQuiz";
import ProtectedPage from "./views/ProtectedPage";
// Componente para proteger rotas
function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" />;

  // Configurar axios com token
  setToken(token);

  return children;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState({ isAuthenticated: false, role: null });

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) setToken(token);

      try {
        const res = await api.get("/auth/check");
        setAuth({ isAuthenticated: true, role: res.data.user.role });
      } catch {
        setAuth({ isAuthenticated: false, role: null });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Redirect inicial */}
          <Route
            path="/"
            element={
              auth.isAuthenticated
                ? {
                    formando: <Navigate to="/formando/dashboard" />,
                    gestor: <Navigate to="/gestor/dashboard" />,
                    formador: <Navigate to="/formador/dashboard" />,
                  }[auth.role] || <Navigate to="/login" />
                : <Navigate to="/login" />
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Protected Routes */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />

          {/* Formando */}
          <Route
            path="/formando/dashboard"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <DashboardFormando />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/:cursoId"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <CursoRecomendado />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursosInscritos/:cursoId"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <CursoInscrito />
              </PrivateRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <Forum />
              </PrivateRoute>
            }
          />
          <Route
            path="/formando/topico/:topicoId/cursos"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <CursosTopico />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/curso/:id"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <QuizCurso />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <PrivateRoute allowedRoles={["formando"]}>
                <QuizResponder />
              </PrivateRoute>
            }
          />

          {/* Gestor */}
          <Route
            path="/gestor/dashboard"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <DashboardGestor />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/criar-curso"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <NovoCurso />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/cursos/editar/:id"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <EditarCurso />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/gerircategorias"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <GerirCategorias />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/novacategoria"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <NovaCategoria />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/editarcategoria/:id"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <EditarCategoria />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/gerir-utilizadores"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <GerirUtilizadores />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/cursos/:id/novo-quiz"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <NovoQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor/cursos/:cursoId/modulos"
            element={
              <PrivateRoute allowedRoles={["gestor"]}>
                <ModulosAulas />
              </PrivateRoute>
            }
          />

          {/* Formador */}
          <Route
            path="/formador/dashboard"
            element={
              <PrivateRoute allowedRoles={["formador"]}>
                <DashboardFormador />
              </PrivateRoute>
            }
          />
          <Route
            path="/formador/editar-curso/:id"
            element={
              <PrivateRoute allowedRoles={["formador"]}>
                <EditarCursoFormador />
              </PrivateRoute>
            }
          />
          <Route path="/teste-protegido" element={<ProtectedPage />} />

          <Route
            path="/formador/cursos/:id/novo-quiz"
            element={
              <PrivateRoute allowedRoles={["formador"]}>
                <NovoQuiz />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
