import React, { useEffect, useRef, useState } from 'react';
import { estadiosApi } from '../../estadios/api/estadiosApi.js';
import { useActualizarEvento } from '../hooks/useActualizarEvento.js';
import { useCrearEvento } from '../hooks/useCrearEvento.js';
import SelectorSectores from './SelectorSectores.jsx';

const formularioInicial = (evento) => evento ? ({
  id_equipo_local: String(evento.id_equipo_local),
  id_equipo_visitante: String(evento.id_equipo_visitante),
  id_estadio: String(evento.id_estadio),
  fecha: String(evento.fecha || '').slice(0, 10),
  hora: String(evento.hora || '').slice(0, 5),
  ids_sectores: evento.sectores.map((sector) => Number(sector.id)),
}) : ({
  id_equipo_local: '',
  id_equipo_visitante: '',
  id_estadio: '',
  fecha: '',
  hora: '',
  ids_sectores: [],
});

export default function EventoForm({
  equipos,
  estadios,
  jurisdiccion,
  loadingDatos,
  errorDatos,
  eventoEditar = null,
  onGuardado,
  onCancelar,
}) {
  const editando = Boolean(eventoEditar);
  const idEstadioEditar = eventoEditar?.id_estadio;
  const [form, setForm] = useState(() => formularioInicial(eventoEditar));
  const [sectores, setSectores] = useState([]);
  const [loadingSectores, setLoadingSectores] = useState(editando);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const solicitudSectores = useRef(0);
  const {
    crear,
    creando,
    error: crearError,
    limpiarResultado: limpiarCreacion,
  } = useCrearEvento();
  const {
    actualizar,
    actualizando,
    error: actualizarError,
    limpiarResultado: limpiarActualizacion,
  } = useActualizarEvento();

  useEffect(() => {
    if (!idEstadioEditar) return undefined;
    let cancelado = false;
    estadiosApi.sectores(idEstadioEditar)
      .then((recibidos) => { if (!cancelado) setSectores(recibidos); })
      .catch((error) => { if (!cancelado) setFormError(error.message); })
      .finally(() => { if (!cancelado) setLoadingSectores(false); });
    return () => { cancelado = true; };
  }, [idEstadioEditar]);

  async function seleccionarEstadio(idEstadio) {
    const solicitudActual = solicitudSectores.current + 1;
    solicitudSectores.current = solicitudActual;
    setForm((actual) => ({ ...actual, id_estadio: idEstadio, ids_sectores: [] }));
    setSectores([]);
    setFormError('');
    if (!idEstadio) {
      setLoadingSectores(false);
      return;
    }

    setLoadingSectores(true);
    try {
      const recibidos = await estadiosApi.sectores(idEstadio);
      if (solicitudSectores.current === solicitudActual) setSectores(recibidos);
    } catch (error) {
      if (solicitudSectores.current === solicitudActual) setFormError(error.message);
    } finally {
      if (solicitudSectores.current === solicitudActual) setLoadingSectores(false);
    }
  }

  function alternarSector(idSector) {
    setForm((actual) => ({
      ...actual,
      ids_sectores: actual.ids_sectores.includes(idSector)
        ? actual.ids_sectores.filter((id) => id !== idSector)
        : [...actual.ids_sectores, idSector],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    limpiarCreacion();
    limpiarActualizacion();

    if (form.id_equipo_local === form.id_equipo_visitante) {
      setFormError('El equipo local y el visitante deben ser distintos.');
      return;
    }
    if (form.ids_sectores.length === 0) {
      setFormError('Selecciona al menos un sector.');
      return;
    }

    try {
      const payload = {
        ...form,
        id_equipo_local: Number(form.id_equipo_local),
        id_equipo_visitante: Number(form.id_equipo_visitante),
        id_estadio: Number(form.id_estadio),
      };
      const guardado = editando
        ? await actualizar(eventoEditar.id, payload)
        : await crear(payload);
      setForm(formularioInicial());
      setSectores([]);
      setSuccess(editando
        ? 'Evento actualizado correctamente.'
        : 'Evento creado y sectores habilitados correctamente.');
      onGuardado(guardado, editando);
    } catch {
      // El hook conserva y expone el mensaje enviado por el backend.
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">{editando ? 'Editar evento' : 'Nuevo evento'}</p>
        <h2>{editando ? `Evento #${eventoEditar.id}` : 'Partido y ubicación'}</h2>
      </div>

      {loadingDatos ? (
        <p className="table-empty">Cargando equipos y estadios...</p>
      ) : errorDatos ? (
        <p className="form-error" role="alert">{errorDatos.message}</p>
      ) : (
        <>
          <div className="event-form-columns">
            <label>
              Equipo local <span className="required-mark">*</span>
              <select
                value={form.id_equipo_local}
                onChange={(event) => setForm((actual) => ({
                  ...actual,
                  id_equipo_local: event.target.value,
                }))}
                required
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
                ))}
              </select>
            </label>

            <label>
              Equipo visitante <span className="required-mark">*</span>
              <select
                value={form.id_equipo_visitante}
                onChange={(event) => setForm((actual) => ({
                  ...actual,
                  id_equipo_visitante: event.target.value,
                }))}
                required
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Estadio en {jurisdiccion} <span className="required-mark">*</span>
            <select
              value={form.id_estadio}
              onChange={(event) => seleccionarEstadio(event.target.value)}
              required
            >
              <option value="">Seleccionar estadio</option>
              {estadios.map((estadio) => (
                <option key={estadio.id} value={estadio.id}>
                  {estadio.nombre} · {estadio.ciudad}
                </option>
              ))}
            </select>
          </label>

          {estadios.length === 0 && (
            <p className="form-hint">Primero debes registrar un estadio en tu jurisdicción.</p>
          )}

          <div className="event-form-columns">
            <label>
              Fecha <span className="required-mark">*</span>
              <input
                type="date"
                value={form.fecha}
                onChange={(event) => setForm((actual) => ({ ...actual, fecha: event.target.value }))}
                required
              />
            </label>
            <label>
              Hora exacta <span className="required-mark">*</span>
              <input
                type="time"
                value={form.hora}
                onChange={(event) => setForm((actual) => ({ ...actual, hora: event.target.value }))}
                required
              />
            </label>
          </div>

          <fieldset className="sector-selector">
            <legend>Sectores habilitados <span className="required-mark">*</span></legend>
            {!form.id_estadio ? (
              <p className="form-hint">Selecciona un estadio para ver sus sectores.</p>
            ) : (
              <SelectorSectores
                sectores={sectores}
                seleccionados={form.ids_sectores}
                onAlternar={alternarSector}
                loading={loadingSectores}
                mensajeVacio="Este estadio no tiene sectores disponibles."
              />
            )}
          </fieldset>
        </>
      )}

      {(formError || crearError || actualizarError) && (
        <p className="form-error" role="alert">
          {formError || crearError?.message || actualizarError?.message}
        </p>
      )}
      {success && <p className="form-success" role="status">{success}</p>}

      <div className="event-form-actions">
        {editando && (
          <button className="secondary-button" type="button" onClick={onCancelar}>
            Cancelar edición
          </button>
        )}
        <button
          className="primary-button"
          type="submit"
          disabled={creando || actualizando || loadingDatos || estadios.length === 0}
        >
          {creando
            ? 'Creando evento...'
            : actualizando
              ? 'Guardando cambios...'
              : editando ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </form>
  );
}
