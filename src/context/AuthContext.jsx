// Contexto global de autenticacion.
// Guarda el usuario logueado, su rol (Administrador / Funcionario / UsuarioGen)
// y el token. Cualquier componente puede leer/escribir esto con useAuth().
import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../config/apiClient.js';

import React from 'react'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    // Persistencia simple en localStorage para sobrevivir refresh.
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  function login({ usuario, token }) {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  const value = {
    usuario,
    token,
    isAuthenticated: !!token,
    rol: usuario?.rol || null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
