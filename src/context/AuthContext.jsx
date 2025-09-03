import { createContext, useContext, useState, useEffect } from "react";
import api from "../../axiosConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, role: null });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/check", { withCredentials: true });
      setAuth({ isAuthenticated: true, role: res.data.user.role });
    } catch {
      setAuth({ isAuthenticated: false, role: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    localStorage.clear();
    setAuth({ isAuthenticated: false, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
