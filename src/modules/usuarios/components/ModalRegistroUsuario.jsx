import { useState } from 'react';
import React from 'react';
import { useRegistroAdmin } from '../hooks/useUsuarios.js';

const ROLES = ['UsuarioGen', 'Funcionario', 'Administrador'];

function Req({ children }) {
  return <span>{children} <span className="required-mark">*</span></span>;
}

const initialForm = {
  rol: 'UsuarioGen',
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
  numero_legajo: '',
  nombre_pais: '',
  fecha_asignacion: '',
};

export default function ModalRegistroUsuario({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const { registrarAdmin, loading, error, limpiarError } = useRegistroAdmin();

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'rol') limpiarError();
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const datos = {
      rol: form.rol,
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
      telefonos: form.telefonos.split(',').map((t) => t.trim()).filter(Boolean),
      ...(form.rol === 'Funcionario' && {
        numero_legajo: form.numero_legajo,
        nombre_pais: form.nombre_pais,
      }),
      ...(form.rol === 'Administrador' && {
        fecha_asignacion: form.fecha_asignacion || undefined,
        nombre_pais: form.nombre_pais,
      }),
    };

    try {
      await registrarAdmin(datos);
      onSuccess();
      onClose();
    } catch {
      // el error ya está en el estado del hook
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar usuario</h2>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <Req>Rol</Req>
            <select name="rol" value={form.rol} onChange={handleChange}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

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
              <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="off" required />
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
                placeholder="+598 99 111 222, +54 11 5555 6666"
                required
              />
            </label>
          </div>

          {form.rol === 'Funcionario' && (
            <>
              <h2>Datos de funcionario</h2>
              <div className="form-grid">
                <label>
                  <Req>Numero de legajo</Req>
                  <input name="numero_legajo" value={form.numero_legajo} onChange={handleChange} required />
                </label>
                <label>
                  <Req>Pais de asociacion</Req>
                  <input name="nombre_pais" value={form.nombre_pais} onChange={handleChange} required />
                </label>
              </div>
            </>
          )}

          {form.rol === 'Administrador' && (
            <>
              <h2>Datos de administrador</h2>
              <div className="form-grid">
                <label>
                  <Req>Pais de jurisdiccion</Req>
                  <input name="nombre_pais" value={form.nombre_pais} onChange={handleChange} required />
                </label>
                <label>
                  Fecha de asignacion
                  <input type="date" name="fecha_asignacion" value={form.fecha_asignacion} onChange={handleChange} />
                </label>
              </div>
            </>
          )}

          {error && <p className="form-error">{error.message}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
