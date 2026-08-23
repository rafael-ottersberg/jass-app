import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || null);

  const applySession = (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', name);
    setUsername(name);
  };

  const login = useCallback(async (name, password) => {
    const response = await apiClient.post('/login', { username: name, password });
    applySession(response.data.token, response.data.username);
  }, []);

  const register = useCallback(async (name, password, inviteCode) => {
    const response = await apiClient.post('/register', { username: name, password, inviteCode });
    applySession(response.data.token, response.data.username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
  }, []);

  const value = {
    username,
    isAuthenticated: !!username,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
