import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLockup from '../../../components/BrandLockup.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { usuariosApi } from '../api/usuariosApi.js';
import { useFuncionariosAdmin, useGuardarFuncionarioAdmin } from '../hooks/useUsuarios.js';
import React from 'react';

const formInicial = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  numero_legajo: '',
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

export default function AdminFuncionariosPage() {
  const { usuario } = useAuth();
  const { funcionarios, loading, error, recargar } = useFuncionariosAdmin();
  const { guardar, loading: guardando, error: errorGuardar, limpiarError } = useGuardarFuncionarioAdmin();
  const [form, setForm] = useState(() => ({ ...formInicial, pais: usuario?.nombre_pais || '' }));
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const tituloFormulario = editando ? 'Editar funcionario' : 'Nuevo funcionario';
  const funcionariosOrdenados = useMemo(
    () => [...funcionarios].sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)),
    [funcionarios]
  );

  useEffect(() => {
    if (!editando) setForm((actual) => ({ ...actual, pais: usuario?.nombre_pais || actual.pais }));
  }, [usuario?.nombre_pais, editando]);

  function handleChange(event) {
    const { name, value } = event.target;
    limpiarError();
    setMensaje('');
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  function editar(funcionario) {
    setEditando(funcionario.email);
    setMensaje('');
    limpiarError();
    setForm({
      email: funcionario.email,
      password: '',
      nombre: funcionario.nombre || '',
      apellido: funcionario.apellido || '',
      numero_legajo: funcionario.numero_legajo || '',
      pais: funcionario.direccion?.pais || funcionario.nombre_pais || usuario?.nombre_pais || '',
      localidad: funcionario.direccion?.localidad || '',
      calle: funcionario.direccion?.calle || '',
      numero: funcionario.direccion?.numero || '',
      codigo_postal: funcionario.direccion?.codigo_postal || '',
      documento: funcionario.documento?.documento || '',
      documento_pais: funcionario.documento?.pais || '',
      documento_tipo: funcionario.documento?.tipo || '',
      telefonos: (funcionario.telefonos || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nuevo() {
    setEditando(null);
    setMensaje('');
    limpiarError();
    setForm({ ...formInicial, pais: usuario?.nombre_pais || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const datos = {
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      apellido: form.apellido,
      numero_legajo: form.numero_legajo,
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
      telefonos: form.telefonos.split(',').map((telefono) => telefono.trim()).filter(Boolean),
    };

    try {
      await guardar(datos, editando);
      setMensaje(editando ? 'Funcionario actualizado.' : 'Funcionario creado.');
      recargar();
      if (!editando) setForm({ ...formInicial, pais: usuario?.nombre_pais || '' });
    } catch {
      // El hook expone el error para renderizarlo debajo del formulario.
    }
  }

  async function confirmarBorrado() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await usuariosApi.eliminarFuncionario(deleteTarget.email);
      setDeleteTarget(null);
      if (editando === deleteTarget.email) nuevo();
      recargar();
    } catch (err) {
      setDeleteError(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="stadiums-layout">
      <section className="page-shell">
        <header className="page-header">
          <div>
            <BrandLockup compact eyebrow="Administración de personal" />
            <h1>Funcionarios</h1>
            <p>Creá y mantené los funcionarios de acceso de {usuario?.nombre_pais || 'tu jurisdicción'}.</p>
          </div>
          <Link className="secondary-button" to="/home">Volver al inicio</Link>
        </header>

        <div className={`officials-grid ${editando ? 'officials-grid-editing' : ''}`}>
          <form className="stadium-form official-form" onSubmit={handleSubmit}>
            <p className="eyebrow">{tituloFormulario}</p>
            <div className="form-title-row">
              <h2>Datos principales</h2>
              {editando && (
                <button type="button" className="text-button" onClick={nuevo}>Nuevo funcionario</button>
              )}
            </div>

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
                <input name="email" type="email" value={form.email} onChange={handleChange} disabled={Boolean(editando)} required />
              </label>
              <label>
                <Req>{editando ? 'Password actual' : 'Password'}</Req>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required={!editando}
                  disabled={Boolean(editando)}
                  placeholder={editando ? 'No se modifica desde esta pantalla' : ''}
                />
              </label>
              <label>
                <Req>Numero de legajo</Req>
                <input name="numero_legajo" value={form.numero_legajo} onChange={handleChange} required />
              </label>
              <label>
                Pais de asociación
                <input value={usuario?.nombre_pais || ''} disabled />
              </label>
            </div>

            <h2>Dirección</h2>
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
                <select name="documento_tipo" value={form.documento_tipo} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="Cedula">Cedula</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </label>
              <label>
                <Req>Telefonos</Req>
                <input name="telefonos" value={form.telefonos} onChange={handleChange} placeholder="+1 202 555 0101, +1 202 555 0102" required />
              </label>
            </div>

            {mensaje && <p className="form-success">{mensaje}</p>}
            {errorGuardar && <p className="form-error">{errorGuardar.message}</p>}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear funcionario'}
              </button>
              {editando && (
                <button type="button" className="secondary-button" onClick={nuevo}>Cancelar edición</button>
              )}
            </div>
          </form>

          <section className="stadiums-list officials-list" aria-labelledby="officials-title">
            <div className="list-heading">
              <div>
                <p className="eyebrow">Registro actual</p>
                <h2 id="officials-title">Funcionarios registrados</h2>
              </div>
              <span className="count-badge">{funcionariosOrdenados.length}</span>
            </div>

            {loading ? (
              <p className="table-empty">Cargando funcionarios...</p>
            ) : error ? (
              <p className="form-error">{error.message}</p>
            ) : funcionariosOrdenados.length === 0 ? (
              <p className="table-empty">Todavía no hay funcionarios registrados.</p>
            ) : (
              <div className="official-cards">
                {funcionariosOrdenados.map((funcionario) => (
                  <article className="stadium-card official-card" key={funcionario.email}>
                    <div>
                      <h3>{funcionario.nombre} {funcionario.apellido}</h3>
                      <p>{funcionario.email}</p>
                      <strong>{funcionario.numero_legajo} · {funcionario.nombre_pais}</strong>
                      <small>{funcionario.dispositivos} dispositivos · {funcionario.asignaciones} asignaciones · {funcionario.validaciones} validaciones</small>
                    </div>
                    <div className="stadium-card-buttons">
                      <button type="button" className="secondary-button" onClick={() => editar(funcionario)}>Editar</button>
                      <button type="button" className="delete-stadium-button" onClick={() => setDeleteTarget(funcionario)}>Borrar</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-panel delete-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Confirmación</p>
                <h2>Borrar funcionario</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <p>
              Vas a borrar a <strong>{deleteTarget.nombre} {deleteTarget.apellido}</strong>.
              Si tiene validaciones registradas, el sistema no permitirá eliminarlo.
            </p>
            {deleteError && <p className="form-error">{deleteError.message}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button type="button" className="danger-button" onClick={confirmarBorrado} disabled={deleteLoading}>
                {deleteLoading ? 'Borrando...' : 'Confirmar borrado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
