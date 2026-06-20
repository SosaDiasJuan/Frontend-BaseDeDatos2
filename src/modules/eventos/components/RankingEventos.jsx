import React from 'react';
import { useRankingEventos } from '../hooks/useRankingEventos.js';

export default function RankingEventos() {
  const { ranking, loading, error } = useRankingEventos();

  return (
    <section className="ranking-panel" aria-labelledby="ranking-title">
      <div className="list-heading">
        <div>
          <p className="eyebrow">Entradas vendidas</p>
          <h2 id="ranking-title">Eventos más populares</h2>
        </div>
      </div>

      {loading ? (
        <p className="table-empty">Cargando ranking...</p>
      ) : error ? (
        <p className="form-error" role="alert">{error.message}</p>
      ) : ranking.length === 0 ? (
        <p className="table-empty">Todavía no hay eventos para clasificar.</p>
      ) : (
        <ol className="ranking-list">
          {ranking.map((evento, index) => (
            <li key={evento.id}>
              <span className="ranking-position">{index + 1}</span>
              <span className="ranking-name">
                <strong>{evento.equipo_local} vs. {evento.equipo_visitante}</strong>
                <small>{Number(evento.entradas_vendidas)} entradas</small>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
