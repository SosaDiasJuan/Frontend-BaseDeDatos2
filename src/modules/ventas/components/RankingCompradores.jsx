import { useRankingCompradores } from '../hooks/useVentas.js';

import React from 'react';

export default function RankingCompradores() {
  const { ranking, loading, error } = useRankingCompradores();

  return (
    <section className="ranking-panel" aria-labelledby="buyers-ranking-title">
      <p className="eyebrow">Compras pagas</p>
      <h2 id="buyers-ranking-title">Mayores compradores</h2>
      {loading ? (
        <p className="table-empty">Cargando ranking...</p>
      ) : error ? (
        <p className="form-error">{error.message}</p>
      ) : ranking.length === 0 ? (
        <p className="table-empty">Todavía no hay compras pagas.</p>
      ) : (
        <ol className="ranking-list">
          {ranking.map((comprador, index) => (
            <li key={comprador.email_usuario}>
              <span className="ranking-position">{index + 1}</span>
              <span className="ranking-name">
                <strong>{comprador.nombre} {comprador.apellido}</strong>
                <small>{comprador.email_usuario} · {Number(comprador.entradas_compradas)} entradas</small>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
