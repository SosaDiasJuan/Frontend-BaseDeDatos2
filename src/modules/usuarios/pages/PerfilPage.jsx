import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useActualizarPerfil, usePerfil } from '../hooks/useUsuarios.js';
import BrandLockup from '../../../components/BrandLockup.jsx';

const initialForm = {
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

function Req({ children }) {
  return <span>{children} <span className="required-mark">*</span></span>;
}

export default function PerfilPage() {
  const auth = useAuth();
  const email = auth.usuario?.email;
  const { perfil, loading, error } = usePerfil(email);
  const { actualizar, loading: guardando, error: errorGuardar } = useActualizarPerfil();
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!perfil) return;
    setForm({
      nombre: perfil.nombre || '',
      apellido: perfil.apellido || '',
      pais: perfil.direccion?.pais || '',
      localidad: perfil.direccion?.localidad || '',
      calle: perfil.direccion?.calle || '',
      numero: perfil.direccion?.numero || '',
      codigo_postal: perfil.direccion?.codigo_postal || '',
      documento: perfil.documento?.documento || '',
      documento_pais: perfil.documento?.pais || '',
      documento_tipo: perfil.documento?.tipo || '',
      telefonos: (perfil.telefonos || []).join(', '),
    });
  }, [perfil]);

  function handleChange(event) {
    const { name, value } = event.target;
    setMensaje('');
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email) return;

    const actualizado = await actualizar(email, {
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

    auth.actualizarUsuario({
      nombre: actualizado.nombre,
      apellido: actualizado.apellido,
      nombre_pais: actualizado.nombre_pais,
      estado_verificacion: actualizado.estado_verificacion,
    });
    setMensaje('Perfil actualizado.');
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel auth-panel-wide">
        <div className="profile-header">
          <div>
            <BrandLockup compact eyebrow="Usuario general" />
            <h1>Editar perfil</h1>
            <p>Actualizá tus datos personales y de contacto.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </div>

        {loading && <p className="table-empty">Cargando perfil...</p>}
        {error && <p className="form-error">{error.message}</p>}

        {!loading && perfil && (
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
                Email
                <input value={email || ''} disabled />
              </label>
            </div>

            <h2>Dirección</h2>
            <div className="form-grid">
              <label>
                <Req>País</Req>
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
                <Req>Número</Req>
                <input name="numero" value={form.numero} onChange={handleChange} required />
              </label>
              <label>
                Código postal
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
                <Req>País emisor</Req>
                <input name="documento_pais" value={form.documento_pais} onChange={handleChange} required />
              </label>
              <label>
                <Req>Tipo</Req>
                <select name="documento_tipo" value={form.documento_tipo} onChange={handleChange} required>
                  <option value="">Seleccionar</option>
                  <option value="CI">CI</option>
                  <option value="DNI">DNI</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
              </label>
              <label>
                <Req>Teléfonos</Req>
                <input
                  name="telefonos"
                  value={form.telefonos}
                  onChange={handleChange}
                  placeholder="Separados por coma"
                  required
                />
              </label>
            </div>

            {errorGuardar && <p className="form-error">{errorGuardar.message}</p>}
            {mensaje && <p className="form-success">{mensaje}</p>}

            <div className="profile-actions">
              <button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <Link className="secondary-button" to="/home">Cancelar</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
