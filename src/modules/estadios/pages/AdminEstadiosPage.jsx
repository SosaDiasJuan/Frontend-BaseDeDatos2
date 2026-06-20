import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { estadiosApi } from '../api/estadiosApi.js';

const nuevoSector = () => ({ codigo: '', capacidad_maxima: '', costo_entrada: '' });
const nuevoFormulario = () => ({ nombre: '', ciudad: '', sectores: [nuevoSector()] });

export default function AdminEstadiosPage() {
  const { usuario } = useAuth();
  const [estadios, setEstadios] = useState([]);
  const [form, setForm] = useState(nuevoFormulario);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const jurisdiccion = usuario?.nombre_pais || '';

  function actualizarSector(index, campo, valor) {
    setForm((actual) => ({
      ...actual,
      sectores: actual.sectores.map((sector, sectorIndex) => (
        sectorIndex === index ? { ...sector, [campo]: valor } : sector
      )),
    }));
  }

  function agregarSector() {
    setForm((actual) => ({ ...actual, sectores: [...actual.sectores, nuevoSector()] }));
  }

  function quitarSector(index) {
    setForm((actual) => ({
      ...actual,
      sectores: actual.sectores.filter((_, sectorIndex) => sectorIndex !== index),
    }));
  }

  function cancelarEdicion() {
    setEditingId(null);
    setForm(nuevoFormulario());
    setError(null);
    setSuccess('');
  }

  async function editarEstadio(estadio) {
    setLoadingEdit(true);
    setError(null);
    setSuccess('');
    try {
      const sectores = await estadiosApi.sectores(estadio.id);
      setEditingId(estadio.id);
      setForm({
        nombre: estadio.nombre,
        ciudad: estadio.ciudad,
        sectores: sectores.map((sector) => ({
          id: sector.id,
          codigo: sector.codigo,
          capacidad_maxima: sector.capacidad_maxima,
          costo_entrada: sector.costo_entrada,
        })),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEdit(false);
    }
  }

  useEffect(() => {
    let cancelado = false;
    estadiosApi.listar()
      .then((data) => { if (!cancelado) setEstadios(data); })
      .catch((err) => { if (!cancelado) setError(err.message); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess('');
    try {
      const payload = {
        nombre: form.nombre,
        ciudad: form.ciudad,
        pais: jurisdiccion,
        sectores: form.sectores,
      };
      const guardado = editingId
        ? await estadiosApi.actualizar(editingId, payload)
        : await estadiosApi.crear(payload);
      setEstadios((actuales) => {
        const siguientes = editingId
          ? actuales.map((estadio) => estadio.id === editingId ? guardado : estadio)
          : [...actuales, guardado];
        return siguientes.sort((a, b) => (
          `${a.pais}${a.ciudad}${a.nombre}`.localeCompare(`${b.pais}${b.ciudad}${b.nombre}`)
        ));
      });
      setEditingId(null);
      setForm(nuevoFormulario());
      setSuccess(`${guardado.nombre} se ${editingId ? 'actualizo' : 'registro'} correctamente.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="stadiums-layout">
      <section className="stadiums-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Administracion · RF-08</p>
            <h1>Estadios</h1>
            <p>Registra y consulta los estadios de tu pais sede.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>

        <div className="stadiums-grid">
          <form className="stadium-form" onSubmit={handleSubmit}>
            <div>
              <p className="eyebrow">{editingId ? 'Editar estadio' : 'Nuevo estadio'}</p>
              <h2>Datos principales</h2>
            </div>

            <label>
              Nombre <span className="required-mark">*</span>
              <input
                value={form.nombre}
                onChange={(e) => setForm((actual) => ({ ...actual, nombre: e.target.value }))}
                placeholder="Ej. MetLife Stadium"
                required
              />
            </label>

            <label>
              Pais de jurisdiccion
              <input value={jurisdiccion} disabled aria-describedby="jurisdiction-help" />
              <small id="jurisdiction-help">Asignado a tu cuenta de Admin Pais.</small>
            </label>

            <label>
              Ciudad <span className="required-mark">*</span>
              <input
                value={form.ciudad}
                onChange={(e) => setForm((actual) => ({ ...actual, ciudad: e.target.value }))}
                placeholder="Ej. East Rutherford"
                required
              />
            </label>

            <div className="sectors-heading">
              <div>
                <p className="eyebrow">Distribucion</p>
                <h2>Sectores</h2>
              </div>
              <button className="add-sector-button" type="button" onClick={agregarSector}>
                + Agregar
              </button>
            </div>

            <div className="sector-rows">
              {form.sectores.map((sector, index) => (
                <fieldset className="sector-row" key={index}>
                  <div className="sector-row-header">
                    <legend>Sector {index + 1}</legend>
                    {form.sectores.length > 1 && (
                      <button
                        className="remove-sector-button"
                        type="button"
                        onClick={() => quitarSector(index)}
                        aria-label={`Quitar sector ${index + 1}`}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <label>
                    Codigo <span className="required-mark">*</span>
                    <input
                      value={sector.codigo}
                      onChange={(e) => actualizarSector(index, 'codigo', e.target.value)}
                      placeholder="Ej. A"
                      maxLength="10"
                      required
                    />
                  </label>
                  <div className="sector-values">
                    <label>
                      Capacidad <span className="required-mark">*</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={sector.capacidad_maxima}
                        onChange={(e) => actualizarSector(index, 'capacidad_maxima', e.target.value)}
                        placeholder="100"
                        required
                      />
                    </label>
                    <label>
                      Costo <span className="required-mark">*</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sector.costo_entrada}
                        onChange={(e) => actualizarSector(index, 'costo_entrada', e.target.value)}
                        placeholder="120.00"
                        required
                      />
                    </label>
                  </div>
                </fieldset>
              ))}
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p className="form-success" role="status">{success}</p>}

            <div className="stadium-form-actions">
              {editingId && (
                <button className="secondary-button" type="button" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              )}
              <button className="primary-button" type="submit" disabled={saving || !jurisdiccion}>
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar estadio'}
              </button>
            </div>
          </form>

          <section className="stadiums-list" aria-labelledby="stadiums-title">
            <div className="list-heading">
              <div>
                <p className="eyebrow">Registro actual</p>
                <h2 id="stadiums-title">Estadios registrados</h2>
              </div>
              <span className="count-badge">{estadios.length}</span>
            </div>

            {loading ? (
              <p className="table-empty">Cargando estadios...</p>
            ) : estadios.length === 0 ? (
              <p className="table-empty">Todavia no hay estadios registrados.</p>
            ) : (
              <div className="stadium-cards">
                {estadios.map((estadio) => (
                  <article className="stadium-card" key={estadio.id}>
                    <div>
                      <h3>{estadio.nombre}</h3>
                      <p>{estadio.ciudad}, {estadio.pais}</p>
                      <p className="stadium-stats">
                        {estadio.cantidad_sectores} sectores · Capacidad {Number(estadio.capacidad_total).toLocaleString('es-UY')}
                      </p>
                    </div>
                    <div className="stadium-card-actions">
                      <span className={estadio.pais === jurisdiccion ? 'jurisdiction-badge' : 'country-badge'}>
                        {estadio.pais === jurisdiccion ? 'Tu jurisdiccion' : estadio.pais}
                      </span>
                      {estadio.pais === jurisdiccion && (
                        <button
                          className="edit-stadium-button"
                          type="button"
                          disabled={loadingEdit}
                          onClick={() => editarEstadio(estadio)}
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
