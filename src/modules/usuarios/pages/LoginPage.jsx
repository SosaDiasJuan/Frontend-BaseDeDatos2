import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useLogin } from '../hooks/useUsuarios.js';
import BrandLockup from '../../../components/BrandLockup.jsx';

import React from 'react'

const initialForm = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { login: loginRequest, loading, error } = useLogin();
  const [form, setForm] = useState(initialForm);

  if (auth.isAuthenticated) return <Navigate to="/home" replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const sesion = await loginRequest(form);
    auth.login(sesion);
    navigate('/home', { replace: true });
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <BrandLockup compact />
        <h1>Login</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="form-error">{error.message}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="auth-link">
          No tenes cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </section>
    </main>
  );
}
