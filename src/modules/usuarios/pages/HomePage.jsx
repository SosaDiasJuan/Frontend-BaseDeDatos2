import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useListaUsuarios, usePerfil } from '../hooks/useUsuarios.js';
import ModalRegistroUsuario from '../components/ModalRegistroUsuario.jsx';
import { useEventos } from '../../eventos/hooks/useEventos.js';
import { agruparEventos, banderaPais, formatearFecha, formatearHora } from '../../eventos/utils/eventos.js';
import { useEntradasMias } from '../../entradas/hooks/useEntradas.js';
import { useTransferenciasDeUsuario } from '../../transferencias/hooks/useTransferencias.js';
import RankingCompradores from '../../ventas/components/RankingCompradores.jsx';
import BrandLockup from '../../../components/BrandLockup.jsx';
import React from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { perfil } = usePerfil(usuario?.email);
  const usuarioActual = perfil || usuario;
  const [showModal, setShowModal] = useState(false);
  const { usuarios, loading: loadingUsuarios, recargar } = useListaUsuarios();
  const { eventos: filasEventos } = useEventos();
  const { entradas } = useEntradasMias(usuarioActual?.rol === 'UsuarioGen');
  const eventos = useMemo(() => agruparEventos(filasEventos), [filasEventos]);
  const categorias = useMemo(
    () => categorizarEventos(eventos, usuarioActual?.nombre_pais, entradas),
    [eventos, usuarioActual?.nombre_pais, entradas]
  );
  const cantidadEventos = eventos.length;
  const { transferencias } = useTransferenciasDeUsuario(usuario?.email);
  const transferenciasPendientes = transferencias.filter(
    t => t.estado === 'pendiente' && t.email_receptor === usuario?.email
  ).length;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="home-layout">
      <section className="home-panel">
        <div className="home-hero">
          <div className="home-hero-copy">
            <BrandLockup eyebrow="Copa Mundial de la FIFA 2026" />
          </div>
          <aside className="home-profile-menu" aria-label="Perfil personal">
            <div className="profile-avatar" aria-hidden="true">
              {iniciales(usuarioActual)}
            </div>
            <div>
              <strong>{usuarioActual?.nombre} {usuarioActual?.apellido}</strong>
              <span>{usuarioActual?.email}</span>
              <small>{usuarioActual?.rol}</small>
            </div>
            <div className="profile-menu-actions">
              {usuarioActual?.rol === 'UsuarioGen' && <Link to="/perfil">Editar perfil</Link>}
              <button type="button" onClick={handleLogout}>Cerrar sesion</button>
            </div>
          </aside>
        </div>

        <section className="home-actions-section" aria-labelledby="home-actions-title">
          <div className="home-actions-heading">
            <div>
              <p className="eyebrow">Cuenta y torneo</p>
              <h2 id="home-actions-title">Accesos rápidos</h2>
            </div>
            <span>{cantidadEventos} partidos cargados</span>
          </div>
          <nav className="home-actions" aria-label="Accesos principales">
            <Link to="/eventos">
              <span>Eventos</span>
              {cantidadEventos > 0 && <span className="nav-badge">{cantidadEventos}</span>}
            </Link>
            {usuarioActual?.rol === 'UsuarioGen' && <Link to="/mis-entradas">Mis entradas</Link>}
            {usuarioActual?.rol === 'UsuarioGen' && <Link to="/mis-compras">Mis compras</Link>}
            {usuarioActual?.rol === 'UsuarioGen' && (
              <Link to="/mis-transferencias">
                <span>Mis transferencias</span>
                {transferenciasPendientes > 0 && <span className="nav-badge">{transferenciasPendientes}</span>}
              </Link>
            )}
            {usuarioActual?.rol === 'Administrador' && <Link to="/admin/eventos">Administrar eventos</Link>}
            {usuarioActual?.rol === 'Administrador' && <Link to="/admin/estadios">Administrar estadios</Link>}
            {usuarioActual?.rol === 'Administrador' && <Link to="/admin/funcionarios">Administrar funcionarios</Link>}
            {usuarioActual?.rol === 'Funcionario' && <Link to="/validar">Validar entrada</Link>}
          </nav>
        </section>

        {usuarioActual?.rol === 'Administrador' && (
          <div className="admin-section">
            <div className="admin-dashboard-grid">
              <div className="admin-users-panel">
                <div className="admin-section-header">
                  <h2>Usuarios</h2>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setShowModal(true)}
                  >
                    + Agregar usuario
                  </button>
                </div>

                {loadingUsuarios ? (
                  <p className="table-empty">Cargando...</p>
                ) : usuarios.length === 0 ? (
                  <p className="table-empty">No hay usuarios registrados.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>Rol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u) => (
                          <tr key={u.email}>
                            <td>{u.email}</td>
                            <td>{u.nombre}</td>
                            <td>{u.apellido}</td>
                            <td>
                              <span className={`rol-badge ${u.rol}`}>{u.rol}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <RankingCompradores />
            </div>
          </div>
        )}

        <section className="home-events-section" aria-labelledby="home-events-title">
          <div className="home-section-header">
            <div>
              <h2 id="home-events-title">Partidos</h2>
            </div>
            <Link className="home-section-link" to="/eventos">Ver todos</Link>
          </div>

          {cantidadEventos === 0 ? (
            <p className="table-empty">No hay eventos disponibles.</p>
          ) : (
            <div className="home-match-sections">
              <HomeMatchSection
                title="Tus partidos"
                emptyText="Todavia no tenes entradas para ningun partido."
                eventos={categorias.tuyos}
                limit={6}
                showTicketCount
                usuario={usuarioActual}
              />
              <HomeMatchSection
                title="Partidos destacados"
                emptyText="Todavía no hay partidos destacados próximos."
                eventos={categorias.destacados}
                limit={3}
                usuario={usuarioActual}
              />
              <HomeMatchSection
                title="Partidos futuros"
                emptyText="No hay más partidos futuros."
                eventos={categorias.futuros}
                limit={6}
                usuario={usuarioActual}
              />
              <HomeMatchSection
                title="Finalizados"
                emptyText="Todavía no hay partidos finalizados."
                eventos={categorias.finalizados}
                limit={6}
                usuario={usuarioActual}
              />
            </div>
          )}
        </section>
      </section>

      {showModal && (
        <ModalRegistroUsuario
          onClose={() => setShowModal(false)}
          onSuccess={recargar}
        />
      )}
    </main>
  );
}

function HomeMatchSection({ title, emptyText, eventos, limit, showTicketCount = false, usuario }) {
  const visibles = eventos.slice(0, limit);
  return (
    <section className="home-match-section" aria-labelledby={`home-${slug(title)}`}>
      <div className="home-match-section-header">
        <h3 id={`home-${slug(title)}`}>{title}</h3>
        <span className="count-label">{eventos.length}</span>
      </div>
      {visibles.length === 0 ? (
        <p className="table-empty">{emptyText}</p>
      ) : (
        <div className="home-match-grid">
          {visibles.map((evento) => (
            <HomeMatchCard
              evento={evento}
              key={evento.id}
              showTicketCount={showTicketCount}
              usuario={usuario}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HomeMatchCard({ evento, showTicketCount = false, usuario }) {
  return (
    <Link className={`home-match-card ${estaFinalizado(evento) ? 'home-match-card-finished' : ''}`} to={rutaEventoHome(evento, usuario)}>
      <div className="match-flags" aria-hidden="true">
        <span>{banderaPais(evento.equipo_local)}</span>
        <strong>VS</strong>
        <span>{banderaPais(evento.equipo_visitante)}</span>
      </div>
      <div className="match-teams">
        <strong>{evento.equipo_local}</strong>
        <span>vs.</span>
        <strong>{evento.equipo_visitante}</strong>
      </div>
      <p>{formatearFecha(evento.fecha)} · {formatearHora(evento.hora)}</p>
      {showTicketCount && (
        <span className="ticket-count">{evento.cantidadEntradas} {evento.cantidadEntradas === 1 ? 'entrada' : 'entradas'}</span>
      )}
      <small>{evento.estadio} · {evento.pais}</small>
    </Link>
  );
}

function rutaEventoHome(evento, usuario) {
  if (usuario?.rol === 'UsuarioGen') return `/comprar/${evento.id}`;
  if (usuario?.rol === 'Administrador') return '/admin/eventos';
  if (usuario?.rol === 'Funcionario') return '/validar';
  return '/eventos';
}

function categorizarEventos(eventos, paisUsuario, entradas = []) {
  const ordenados = [...eventos].sort((a, b) => fechaEvento(a) - fechaEvento(b));
  const entradasPorEvento = entradas.reduce((acc, entrada) => {
    const id = Number(entrada.id_evento);
    if (!id) return acc;
    acc.set(id, (acc.get(id) || 0) + 1);
    return acc;
  }, new Map());
  const tuyos = ordenados
    .filter((evento) => entradasPorEvento.has(evento.id))
    .map((evento) => ({ ...evento, cantidadEntradas: entradasPorEvento.get(evento.id) }))
    .sort((a, b) => Number(estaFinalizado(a)) - Number(estaFinalizado(b)) || fechaEvento(a) - fechaEvento(b));
  const tuyosIds = new Set(tuyos.map((evento) => evento.id));
  const finalizados = ordenados
    .filter((evento) => estaFinalizado(evento) && !tuyosIds.has(evento.id))
    .sort((a, b) => fechaEvento(b) - fechaEvento(a));
  const destacados = ordenados
    .filter((evento) => !estaFinalizado(evento))
    .sort((a, b) => Number(b.entradas_vendidas || 0) - Number(a.entradas_vendidas || 0) || fechaEvento(a) - fechaEvento(b))
    .slice(0, 3);
  const destacadosIds = new Set(destacados.map((evento) => evento.id));
  const futuros = ordenados.filter((evento) => !estaFinalizado(evento) && !tuyosIds.has(evento.id) && !destacadosIds.has(evento.id));
  return { tuyos, destacados, futuros, finalizados };
}

function estaFinalizado(evento) {
  return Boolean(evento.cerrado) || fechaEvento(evento) < new Date();
}

function fechaEvento(evento) {
  const fecha = String(evento.fecha || '').slice(0, 10);
  const hora = formatearHora(evento.hora) || '00:00';
  return new Date(`${fecha}T${hora}:00Z`);
}

function slug(texto) {
  return String(texto).toLowerCase().replace(/\s+/g, '-');
}

function iniciales(usuario) {
  const nombre = String(usuario?.nombre || '').trim();
  const apellido = String(usuario?.apellido || '').trim();
  return `${nombre[0] || 'U'}${apellido[0] || ''}`.toUpperCase();
}
