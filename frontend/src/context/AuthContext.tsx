import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "../api/client";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: Role; manager_id?: number }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("workflow_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<User>("/auth/me");
        setUser(response.data);
      } catch {
        localStorage.removeItem("workflow_token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    void loadUser();
  }, [token]);

  async function login(email: string, password: string) {
    const response = await api.post<{ access_token: string; user: User }>("/auth/login", { email, password });
    localStorage.setItem("workflow_token", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
  }

  async function register(payload: { name: string; email: string; password: string; role: Role; manager_id?: number }) {
    const response = await api.post<{ access_token: string; user: User }>("/auth/register", payload);
    localStorage.setItem("workflow_token", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
  }

  function logout() {
    localStorage.removeItem("workflow_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
