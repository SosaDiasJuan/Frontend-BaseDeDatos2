import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useRegistro } from '../hooks/useUsuarios.js';

import React from 'react'

function Req({ children }) {
  return <span>{children} <span className="required-mark">*</span></span>;
}

const initialForm = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  pais: '',
  localidad: '',
  calle: '',
  numero: '',
  codigo_postal: '',
  documento: '',
  documento_pais: '',
  documento_tipo: '',
  telefonos: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { registrar, loading, error } = useRegistro();
  const [form, setForm] = useState(initialForm);

  if (auth.isAuthenticated) return <Navigate to="/home" replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const sesion = await registrar({
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      apellido: form.apellido,
      direccion: {
        pais: form.pais,
        localidad: form.localidad,
        calle: form.calle,
        numero: form.numero,
        codigo_postal: form.codigo_postal,
      },
      documento: {
        documento: form.documento,
        pais: form.documento_pais,
        tipo: form.documento_tipo,
      },
      telefonos: form.telefonos
        .split(',')
        .map((telefono) => telefono.trim())
        .filter(Boolean),
    });
    auth.login(sesion);
    navigate('/home', { replace: true });
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel auth-panel-wide">
        <p className="eyebrow">Mundial 2026</p>
        <h1>Registro</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <Req>Nombre</Req>
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>
              <Req>Apellido</Req>
              <input name="apellido" value={form.apellido} onChange={handleChange} required />
            </label>
            <label>
              <Req>Email</Req>
              <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </label>
            <label>
              <Req>Password</Req>
              <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
            </label>
          </div>

          <h2>Direccion</h2>
          <div className="form-grid">
            <label>
              <Req>Pais</Req>
              <input name="pais" value={form.pais} onChange={handleChange} required />
            </label>
            <label>
              <Req>Localidad</Req>
              <input name="localidad" value={form.localidad} onChange={handleChange} required />
            </label>
            <label>
              <Req>Calle</Req>
              <input name="calle" value={form.calle} onChange={handleChange} required />
            </label>
            <label>
              <Req>Numero</Req>
              <input name="numero" value={form.numero} onChange={handleChange} required />
            </label>
            <label>
              Codigo postal
              <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
            </label>
          </div>

          <h2>Documento y contacto</h2>
          <div className="form-grid">
            <label>
              <Req>Documento</Req>
              <input name="documento" value={form.documento} onChange={handleChange} required />
            </label>
            <label>
              <Req>Pais emisor</Req>
              <input name="documento_pais" value={form.documento_pais} onChange={handleChange} required />
            </label>
            <label>
              <Req>Tipo</Req>
              <input name="documento_tipo" value={form.documento_tipo} onChange={handleChange} required />
            </label>
            <label>
              <Req>Telefonos</Req>
              <input
                name="telefonos"
                value={form.telefonos}
                onChange={handleChange}
                placeholder="+598 99 111 222, +598 98 333 444"
                required
              />
            </label>
          </div>

          {error && <p className="form-error">{error.message}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-link">
          Ya tenes cuenta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
