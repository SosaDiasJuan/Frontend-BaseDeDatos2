import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import EventoCard from '../components/EventoCard.jsx';
import RankingEventos from '../components/RankingEventos.jsx';
import RankingCompradores from '../../ventas/components/RankingCompradores.jsx';
import { useEventos } from '../hooks/useEventos.js';
import {
  agruparEventos,
  formatearHora,
  puedeVerRanking,
  puedeVerRankingCompradores,
} from '../utils/eventos.js';
import BrandLockup from '../../../components/BrandLockup.jsx';

export default function EventosPage() {
  const { usuario } = useAuth();
  const { eventos: filas, loading, error } = useEventos();
  const eventos = useMemo(() => agruparEventos(filas), [filas]);
  const [pais, setPais] = useState('');
  const [sede, setSede] = useState('');
  const opcionesPaises = useMemo(() => paisesDeEventos(eventos), [eventos]);
  const opcionesSedes = useMemo(() => sedesDeEventos(eventos), [eventos]);
  const eventosFiltrados = useMemo(
    () => filtrarEventos(eventos, { pais, sede }),
    [eventos, pais, sede]
  );
  const proximos = eventosFiltrados.filter((evento) => !estaFinalizado(evento));
  const finalizados = eventosFiltrados.filter(estaFinalizado);
  const mostrarRankingEventos = puedeVerRanking(usuario?.rol);
  const mostrarRankingCompradores = puedeVerRankingCompradores(usuario?.rol);
  const mostrarRankings = mostrarRankingEventos || mostrarRankingCompradores;

  return (
    <main className="events-layout">
      <div className="events-shell">
        <header className="page-header">
          <div>
            <BrandLockup compact eyebrow="Partidos y entradas" />
            <h1>Eventos</h1>
              <p>Buscá partidos, compará disponibilidad por sector y comprá entradas para los encuentros próximos.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>

        <div className={mostrarRankings ? 'events-grid' : 'events-grid events-grid-single'}>
          <section className="events-list-panel" aria-labelledby="events-title">
            <div className="events-shop-toolbar">
              <div className="events-filters" aria-label="Filtros de eventos">
                <label>
                  País / equipo
                  <select value={pais} onChange={(event) => setPais(event.target.value)}>
                    <option value="">Todos</option>
                    {opcionesPaises.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                  </select>
                </label>
                <label>
                  Sede
                  <select value={sede} onChange={(event) => setSede(event.target.value)}>
                    <option value="">Todas</option>
                    {opcionesSedes.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="list-heading">
              <div>
                <p className="eyebrow">Programación</p>
                <h2 id="events-title">Entradas disponibles</h2>
              </div>
              <span className="count-label">
                {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {loading ? (
              <p className="table-empty">Cargando eventos...</p>
            ) : error ? (
              <p className="form-error" role="alert">{error.message}</p>
            ) : eventosFiltrados.length === 0 ? (
              <p className="table-empty">No hay partidos que coincidan con la búsqueda.</p>
            ) : (
              <div className="events-shop-sections">
                <EventSection
                  title="Próximos partidos"
                  eventos={proximos}
                  puedeComprar={usuario?.rol === 'UsuarioGen'}
                />
                {finalizados.length > 0 && (
                  <EventSection
                    title="Finalizados"
                    eventos={finalizados}
                    puedeComprar={false}
                  />
                )}
              </div>
            )}
          </section>

          {mostrarRankings && (
            <aside className="rankings-column">
              {mostrarRankingEventos && <RankingEventos />}
              {mostrarRankingCompradores && <RankingCompradores />}
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function EventSection({ title, eventos, puedeComprar }) {
  if (eventos.length === 0) return <p className="table-empty">No hay partidos para mostrar.</p>;
  return (
    <section className="events-shop-section">
      <div className="events-shop-section-header">
        <h3>{title}</h3>
        <span className="count-label">{eventos.length}</span>
      </div>
      <div className="event-cards event-cards-shop">
        {eventos.map((evento) => (
          <EventoCard
            evento={evento}
            key={evento.id}
            puedeComprar={puedeComprar}
            variant="purchase"
          />
        ))}
      </div>
    </section>
  );
}

function filtrarEventos(eventos, filtros) {
  return eventos.filter((evento) => {
    const coincidePais = !filtros.pais || [evento.equipo_local, evento.equipo_visitante].includes(filtros.pais);
    const coincideSede = !filtros.sede || evento.pais === filtros.sede;
    return coincidePais && coincideSede;
  });
}

function paisesDeEventos(eventos) {
  return [...new Set(eventos.flatMap((evento) => [evento.equipo_local, evento.equipo_visitante]))].sort();
}

function sedesDeEventos(eventos) {
  return [...new Set(eventos.map((evento) => evento.pais))].sort();
}

function estaFinalizado(evento) {
  const fecha = String(evento.fecha || '').slice(0, 10);
  const hora = formatearHora(evento.hora) || '00:00';
  return Boolean(evento.cerrado) || new Date(`${fecha}T${hora}:00Z`) < new Date();
}
