import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../axiosConfig";
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
import TesteBackend from "./views/TesteBackend";
import { AuthProvider } from "./context/AuthContext";
import NavigateToRole from "./components/NavigatorRole"; // componente que decide para onde ir conforme role



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<NavigateToRole />} />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/search" element={<SearchResults />} />
            
            {/* Protected Routes */}
            <Route path="/perfil" element={<Perfil />} />
            {/* Formando Routes */}
            <Route path="/formando/dashboard" element={<DashboardFormando />} />
            <Route path="/cursos/:cursoId" element={<CursoRecomendado />} />
            <Route path="/cursosInscritos/:cursoId" element={<CursoInscrito />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/formando/topico/:topicoId/cursos" element={<CursosTopico />} />
            <Route path="/quiz/curso/:id" element={<QuizCurso />} />
            <Route path="/quiz/:quizId" element={<QuizResponder />} />

            {/* Gestor Routes */}
            <Route path="/gestor/dashboard" element={<DashboardGestor />} />
            <Route path="/gestor/criar-curso" element={<NovoCurso />} />
            <Route path="/gestor/cursos/editar/:id" element={<EditarCurso />} />
            <Route path="/gestor/gerircategorias" element={<GerirCategorias />} />
            <Route path="/gestor/novacategoria" element={<NovaCategoria />} />
            <Route path="/gestor/editarcategoria/:id" element={<EditarCategoria />} />
            <Route path="/gestor/gerir-utilizadores" element={<GerirUtilizadores />} />
            <Route path="/gestor/cursos/:id/novo-quiz" element={<NovoQuiz />} />
            <Route path="/gestor/cursos/:cursoId/modulos" element={<ModulosAulas />} />

            {/* Formador Routes */}
            <Route path="/formador/dashboard" element={<DashboardFormador />} />
            <Route path="/formador/editar-curso/:id" element={<EditarCursoFormador />} />
            <Route path="/formador/cursos/:id/novo-quiz" element={<NovoQuiz />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/teste-backend" element={<TesteBackend />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
