import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useListaUsuarios } from '../hooks/useUsuarios.js';
import ModalRegistroUsuario from '../components/ModalRegistroUsuario.jsx';
import { useEventos } from '../../eventos/hooks/useEventos.js';
import { agruparEventos } from '../../eventos/utils/eventos.js';
import { useTransferenciasDeUsuario } from '../../transferencias/hooks/useTransferencias.js';
import React from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { usuarios, loading: loadingUsuarios, recargar } = useListaUsuarios();
  const { eventos: filasEventos } = useEventos();
  const cantidadEventos = agruparEventos(filasEventos).length;
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
        <div className="home-header">
          <div>
            <p className="eyebrow">Mundial 2026</p>
            <h1>Hola, {usuario?.nombre || 'usuario'}</h1>
            <p>Sesion iniciada como {usuario?.rol || 'sin rol'}.</p>
          </div>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>

        <nav className="home-actions" aria-label="Accesos principales">
          <Link to="/eventos" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Eventos
            {cantidadEventos > 0 && <span className="nav-badge">{cantidadEventos}</span>}
          </Link>
          {usuario?.rol === 'UsuarioGen' && <Link to="/mis-entradas">Mis entradas</Link>}
          {usuario?.rol === 'UsuarioGen' && <Link to="/mis-compras">Mis compras</Link>}
          {usuario?.rol === 'UsuarioGen' && (
            <Link to="/mis-transferencias" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Mis transferencias
              {transferenciasPendientes > 0 && <span className="nav-badge">{transferenciasPendientes}</span>}
            </Link>
          )}
          {usuario?.rol === 'Administrador' && <Link to="/admin/eventos">Admin eventos</Link>}
          {usuario?.rol === 'Administrador' && <Link to="/admin/estadios">Admin estadios</Link>}
          {usuario?.rol === 'Funcionario' && <Link to="/validar">Validar entrada</Link>}
        </nav>

        {usuario?.rol === 'Administrador' && (
          <div className="admin-section">
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
        )}
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
