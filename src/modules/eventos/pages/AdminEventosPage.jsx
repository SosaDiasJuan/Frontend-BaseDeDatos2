import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { estadiosApi } from '../../estadios/api/estadiosApi.js';
import { equiposApi } from '../api/equiposApi.js';
import EventoCard from '../components/EventoCard.jsx';
import EventoForm from '../components/EventoForm.jsx';
import HabilitarSectoresEvento from '../components/HabilitarSectoresEvento.jsx';
import { useEventos } from '../hooks/useEventos.js';
import { agruparEventos, filtrarPorJurisdiccion } from '../utils/eventos.js';

export default function AdminEventosPage() {
  const { usuario } = useAuth();
  const jurisdiccion = usuario?.nombre_pais || '';
  const [equipos, setEquipos] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState(null);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const {
    eventos: filasEventos,
    loading: loadingEventos,
    error: errorEventos,
    recargar,
  } = useEventos();

  useEffect(() => {
    let cancelado = false;
    Promise.all([equiposApi.listar(), estadiosApi.listar()])
      .then(([equiposRecibidos, estadiosRecibidos]) => {
        if (cancelado) return;
        setEquipos(equiposRecibidos);
        setEstadios(filtrarPorJurisdiccion(estadiosRecibidos, jurisdiccion));
      })
      .catch((error) => { if (!cancelado) setErrorDatos(error); })
      .finally(() => { if (!cancelado) setLoadingDatos(false); });
    return () => { cancelado = true; };
  }, [jurisdiccion]);

  const eventosJurisdiccion = filtrarPorJurisdiccion(
    agruparEventos(filasEventos),
    jurisdiccion
  );

  function editarEvento(evento) {
    setEventoEditar(evento);
    setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function eventoGuardado(_evento, fueEdicion) {
    recargar();
    if (fueEdicion) {
      setEventoEditar(null);
      setMensaje('Evento actualizado correctamente.');
    }
  }

  return (
    <main className="events-layout">
      <div className="events-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Administración · RF-EV01 a RF-EV03</p>
            <h1>Gestionar eventos</h1>
            <p>Crea partidos y habilita sectores dentro de {jurisdiccion || 'tu jurisdicción'}.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>

        <div className="admin-events-grid">
          <EventoForm
            key={eventoEditar?.id || 'nuevo'}
            equipos={equipos}
            estadios={estadios}
            jurisdiccion={jurisdiccion}
            loadingDatos={loadingDatos}
            errorDatos={errorDatos}
            eventoEditar={eventoEditar}
            onGuardado={eventoGuardado}
            onCancelar={() => setEventoEditar(null)}
          />

          <section className="events-list-panel" aria-labelledby="jurisdiction-events-title">
            <div className="list-heading">
              <div>
                <p className="eyebrow">Tu jurisdicción</p>
                <h2 id="jurisdiction-events-title">Eventos en {jurisdiccion}</h2>
              </div>
              <span className="count-label">
                {eventosJurisdiccion.length}{' '}
                {eventosJurisdiccion.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {mensaje && <p className="form-success event-list-message" role="status">{mensaje}</p>}

            {loadingEventos ? (
              <p className="table-empty">Cargando eventos...</p>
            ) : errorEventos ? (
              <p className="form-error" role="alert">{errorEventos.message}</p>
            ) : eventosJurisdiccion.length === 0 ? (
              <p className="table-empty">Todavía no hay eventos en {jurisdiccion}.</p>
            ) : (
              <div className="event-cards">
                {eventosJurisdiccion.map((evento) => (
                  <EventoCard evento={evento} key={evento.id}>
                    <div className="event-admin-actions">
                      <button
                        className="edit-event-button"
                        type="button"
                        onClick={() => editarEvento(evento)}
                      >
                        Editar evento
                      </button>
                      <HabilitarSectoresEvento evento={evento} onActualizado={recargar} />
                    </div>
                  </EventoCard>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
