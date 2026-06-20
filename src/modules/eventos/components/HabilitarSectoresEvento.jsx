import React, { useState } from 'react';
import { estadiosApi } from '../../estadios/api/estadiosApi.js';
import { eventosApi } from '../api/eventosApi.js';
import { sectoresNoHabilitados } from '../utils/eventos.js';
import SelectorSectores from './SelectorSectores.jsx';

export default function HabilitarSectoresEvento({ evento, onActualizado }) {
  const [abierto, setAbierto] = useState(false);
  const [disponibles, setDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function abrir() {
    setAbierto(true);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const sectoresEstadio = await estadiosApi.sectores(evento.id_estadio);
      setDisponibles(sectoresNoHabilitados(sectoresEstadio, evento.sectores));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function alternar(idSector) {
    setSeleccionados((actuales) => actuales.includes(idSector)
      ? actuales.filter((id) => id !== idSector)
      : [...actuales, idSector]);
  }

  async function guardar() {
    if (seleccionados.length === 0) {
      setError('Selecciona al menos un sector adicional.');
      return;
    }
    setGuardando(true);
    setError('');
    setSuccess('');
    try {
      await eventosApi.habilitarSectores(evento.id, seleccionados);
      setSuccess('Sectores habilitados correctamente.');
      setDisponibles((actuales) => actuales.filter((sector) => (
        !seleccionados.includes(Number(sector.id))
      )));
      setSeleccionados([]);
      onActualizado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!abierto) {
    return (
      <button className="event-manage-button" type="button" onClick={abrir}>
        + Habilitar sectores
      </button>
    );
  }

  return (
    <div className="enable-sectors-panel">
      <div className="enable-sectors-header">
        <strong>Sectores adicionales</strong>
        <button type="button" onClick={() => setAbierto(false)}>Cerrar</button>
      </div>
      <SelectorSectores
        sectores={disponibles}
        seleccionados={seleccionados}
        onAlternar={alternar}
        loading={loading}
        mensajeVacio="Todos los sectores del estadio ya están habilitados."
      />
      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}
      {disponibles.length > 0 && !loading && (
        <button
          className="primary-button"
          type="button"
          disabled={guardando}
          onClick={guardar}
        >
          {guardando ? 'Guardando...' : 'Habilitar seleccionados'}
        </button>
      )}
    </div>
  );
}
