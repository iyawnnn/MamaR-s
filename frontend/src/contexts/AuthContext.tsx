import React, { createContext, useState, useEffect } from "react";
import api, { setToken } from "../services/api";
import { IUser } from "../types";

export interface AuthContextType {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  login: (credentials: unknown) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setToken(token);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Auth initialization error:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: unknown) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const { token, user } = res.data;

      if (!token || !user) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);

      return res;
    } catch (error) {
      console.error("Login failed inside AuthContext:", error);
      throw error; 
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}