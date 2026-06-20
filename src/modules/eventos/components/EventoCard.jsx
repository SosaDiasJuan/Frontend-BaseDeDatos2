import React from 'react';
import { formatearFecha, formatearHora } from '../utils/eventos.js';
import SectoresEvento from './SectoresEvento.jsx';

export default function EventoCard({ evento, children }) {
  return (
    <article className="event-card">
      <header className="event-card-header">
        <div>
          <p className="event-date">{formatearFecha(evento.fecha)} · {formatearHora(evento.hora)}</p>
          <h2>{evento.equipo_local} <span>vs.</span> {evento.equipo_visitante}</h2>
          <p>{evento.estadio} · {evento.pais}</p>
        </div>
        <span className="count-label">
          {evento.sectores.length} {evento.sectores.length === 1 ? 'sector' : 'sectores'}
        </span>
      </header>

      <SectoresEvento sectores={evento.sectores} />
      {children}
    </article>
  );
}
