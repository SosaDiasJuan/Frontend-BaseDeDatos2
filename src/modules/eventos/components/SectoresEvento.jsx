import React from 'react';
import { formatearPrecio } from '../utils/eventos.js';

export default function SectoresEvento({ sectores }) {
  return (
    <div className="event-sectors" aria-label="Sectores habilitados">
      {sectores.map((sector) => (
        <div className="event-sector" key={sector.id}>
          <strong>{sector.codigo}</strong>
          <span>{formatearPrecio(sector.precio)}</span>
          <small>{sector.disponibilidad.toLocaleString('es-UY')} disponibles</small>
        </div>
      ))}
    </div>
  );
}
