import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "clickrush_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      let token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!token) {
        const { data } = await api.post("/auth/refresh");

        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
        setUser(data.user);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        if (error.response?.status !== 401) {
          throw error;
        }

        const { data } = await api.post("/auth/refresh");

        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
        setUser(data.user);
      }
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post("/auth/logout-all");
    } catch {}

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}