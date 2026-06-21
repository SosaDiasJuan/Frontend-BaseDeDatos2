import { useState } from 'react';
import { eventosApi } from '../api/eventosApi.js';
import React from 'react';

const clave = (email, sector) => `${email}|${sector}`;

export default function AsignacionesEvento({ evento, onActualizado }) {
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [cobertura, setCobertura] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const [gestion, estado] = await Promise.all([
        eventosApi.asignaciones(evento.id),
        eventosApi.coberturaValidacion(evento.id),
      ]);
      setDatos(gestion);
      setCobertura(estado);
      setSeleccionadas(new Set(gestion.asignaciones.map((item) => clave(item.email_funcionario, item.id_sector))));
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }

  async function alternarPanel() {
    const siguiente = !abierto;
    setAbierto(siguiente);
    if (siguiente) await cargar();
  }

  function alternar(email, idSector) {
    const id = clave(email, idSector);
    setSeleccionadas((actuales) => {
      const copia = new Set(actuales);
      if (copia.has(id)) copia.delete(id); else copia.add(id);
      return copia;
    });
  }

  async function guardar() {
    setLoading(true);
    setError(null);
    setMensaje('');
    try {
      const asignaciones = [...seleccionadas].map((item) => {
        const [email_funcionario, idSector] = item.split('|');
        return { email_funcionario, id_sector: Number(idSector) };
      });
      await eventosApi.guardarAsignaciones(evento.id, asignaciones);
      setMensaje('Asignaciones guardadas.');
      await cargar();
    } catch (err) { setError(err); setLoading(false); }
  }

  async function cerrar() {
    setLoading(true);
    setError(null);
    setMensaje('');
    try {
      await eventosApi.cerrar(evento.id);
      setMensaje('Evento cerrado correctamente.');
      await cargar();
      onActualizado?.();
    } catch (err) { setError(err); setLoading(false); }
  }

  return (
    <div className="assignments-wrapper">
      <button className="event-manage-button" type="button" onClick={alternarPanel}>
        {abierto ? 'Ocultar control de acceso' : 'Asignaciones y cierre'}
      </button>
      {abierto && (
        <section className="assignments-panel">
          {loading && !datos && <p>Cargando...</p>}
          {error && <p className="form-error" role="alert">{error.message}</p>}
          {mensaje && <p className="form-success" role="status">{mensaje}</p>}
          {datos && (
            <>
              <h3>Funcionarios por sector</h3>
              {datos.funcionarios.length === 0 ? <p className="table-empty">No hay funcionarios del país.</p> : (
                <div className="assignment-grid">
                  {datos.sectores.map((sector) => (
                    <fieldset key={sector.id} disabled={datos.cerrado || loading}>
                      <legend>{sector.codigo}</legend>
                      {datos.funcionarios.map((funcionario) => (
                        <label key={funcionario.email}>
                          <input type="checkbox" checked={seleccionadas.has(clave(funcionario.email, sector.id))} onChange={() => alternar(funcionario.email, sector.id)} />
                          {funcionario.nombre} {funcionario.apellido}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              )}
              {!datos.cerrado && <button className="secondary-button" type="button" onClick={guardar} disabled={loading}>Guardar asignaciones</button>}
              <h3>Cobertura</h3>
              {cobertura?.asignaciones.length ? (
                <ul className="coverage-list">
                  {cobertura.asignaciones.map((item) => (
                    <li key={clave(item.email_funcionario, item.id_sector)}>
                      <span>{item.nombre} {item.apellido} · {item.sector}</span>
                      <strong className={item.validado ? 'coverage-ok' : 'coverage-pending'}>{item.validado ? 'Validado' : 'Pendiente'}</strong>
                    </li>
                  ))}
                </ul>
              ) : <p className="table-empty">No hay asignaciones.</p>}
              {datos.cerrado ? <p className="form-success">Evento cerrado.</p> : (
                <button className="primary-button" type="button" onClick={cerrar} disabled={loading}>Cerrar evento</button>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
