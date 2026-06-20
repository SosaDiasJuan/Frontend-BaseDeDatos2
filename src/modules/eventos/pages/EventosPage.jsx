import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import EventoCard from '../components/EventoCard.jsx';
import RankingEventos from '../components/RankingEventos.jsx';
import { useEventos } from '../hooks/useEventos.js';
import { agruparEventos, puedeVerRanking } from '../utils/eventos.js';

export default function EventosPage() {
  const { usuario } = useAuth();
  const { eventos: filas, loading, error } = useEventos();
  const eventos = agruparEventos(filas);
  const mostrarRanking = puedeVerRanking(usuario?.rol);

  return (
    <main className="events-layout">
      <div className="events-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Mundial 2026 · RF-EV04</p>
            <h1>Eventos</h1>
            <p>Consulta partidos, sectores habilitados, precios y lugares disponibles.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>

        <div className={mostrarRanking ? 'events-grid' : 'events-grid events-grid-single'}>
          <section className="events-list-panel" aria-labelledby="events-title">
            <div className="list-heading">
              <div>
                <p className="eyebrow">Programación</p>
                <h2 id="events-title">Próximos partidos</h2>
              </div>
              <span className="count-label">
                {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {loading ? (
              <p className="table-empty">Cargando eventos...</p>
            ) : error ? (
              <p className="form-error" role="alert">{error.message}</p>
            ) : eventos.length === 0 ? (
              <p className="table-empty">Todavía no hay eventos con sectores habilitados.</p>
            ) : (
              <div className="event-cards">
                {eventos.map((evento) => <EventoCard evento={evento} key={evento.id} />)}
              </div>
            )}
          </section>

          {mostrarRanking && <RankingEventos />}
        </div>
      </div>
    </main>
  );
}
