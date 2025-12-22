import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // 1. Set token immediately for any pending requests
          axios.setToken(token);
          
          // 2. Parse user safely
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) {
            setUser(parsedUser);
          } else {
            // Invalid user data, clear everything
            logout();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          logout();
        }
      } else {
        // No token or user found
        setLoading(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post("/auth/login", credentials);
      const { token, user } = res.data;

      if (!token || !user) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.setToken(token);
      setUser(user);
      
      return res;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    axios.setToken(null);
    setUser(null);
    // Optional: Redirect is handled by the UI consuming this context
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}