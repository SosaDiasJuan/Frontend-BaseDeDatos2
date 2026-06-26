import React from 'react';
import { Link } from 'react-router-dom';
import { formatearFecha, formatearHora, formatearPrecio } from '../utils/eventos.js';
import BanderaPais from './BanderaPais.jsx';
import SectoresEvento from './SectoresEvento.jsx';

export default function EventoCard({ evento, children, puedeComprar = false, variant = 'default' }) {
  if (variant === 'purchase') {
    const disponibilidad = disponibilidadTotal(evento);
    const precioMinimo = precioDesde(evento);
    const finalizado = estaFinalizado(evento);
    return (
      <article className={`event-card event-card-purchase ${finalizado ? 'event-card-finished' : ''}`}>
        <div className="event-match-visual" aria-hidden="true">
          <BanderaPais pais={evento.equipo_local} />
          <strong>VS</strong>
          <BanderaPais pais={evento.equipo_visitante} />
        </div>

        <div className="event-purchase-main">
          <p className="event-date">{formatearFecha(evento.fecha)} · {formatearHora(evento.hora)}</p>
          <h2>{evento.equipo_local} <span>vs.</span> {evento.equipo_visitante}</h2>
          <p>{evento.estadio} · {evento.pais}</p>
          <div className="event-purchase-meta">
            <span>{evento.sectores.length} sectores</span>
            <span>{finalizado ? 'Finalizado' : `${disponibilidad.toLocaleString('es-UY')} disponibles`}</span>
            <span>Desde {formatearPrecio(precioMinimo)}</span>
          </div>
        </div>

        <div className="event-purchase-side">
          <SectoresEvento sectores={evento.sectores} compact />
          {puedeComprar && !finalizado ? (
            <Link className="event-buy-button" to={`/comprar/${evento.id}`}>
              Comprar entradas
            </Link>
          ) : finalizado ? (
            <span className="event-unavailable">Partido finalizado</span>
          ) : null}
        </div>
        {children}
      </article>
    );
  }

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
      {puedeComprar && (
        <Link className="event-buy-button" to={`/comprar/${evento.id}`}>
          Comprar entradas
        </Link>
      )}
      {children}
    </article>
  );
}

function disponibilidadTotal(evento) {
  return evento.sectores.reduce((total, sector) => total + Number(sector.disponibilidad || 0), 0);
}

function precioDesde(evento) {
  return Math.min(...evento.sectores.map((sector) => Number(sector.precio || 0)));
}

function estaFinalizado(evento) {
  const fecha = String(evento.fecha || '').slice(0, 10);
  const hora = formatearHora(evento.hora) || '00:00';
  return Boolean(evento.cerrado) || new Date(`${fecha}T${hora}:00Z`) < new Date();
}
