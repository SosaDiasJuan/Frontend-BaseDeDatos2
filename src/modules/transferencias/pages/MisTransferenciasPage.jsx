import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  useTransferenciasDeUsuario,
  useResponderTransferencia,
} from '../hooks/useTransferencias.js';

import React from 'react';

const ESTADO_LABEL = {
  pendiente: { label: 'Pendiente', color: '#a16207', bg: '#fefce8' },
  aceptada:  { label: 'Aceptada',  color: '#166534', bg: '#f0fdf4' },
  rechazada: { label: 'Rechazada', color: '#b91c1c', bg: '#fff1f2' },
};

export default function MisTransferenciasPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const email = usuario?.email;
  const { transferencias, loading, error, recargar } = useTransferenciasDeUsuario(email);
  const { responder, loading: respondiendo } = useResponderTransferencia();

  async function handleResponder(id, accion) {
    try {
      await responder(id, accion);
      recargar();
    } catch (err) {
      alert(err.message);
    }
  }

  if (!email) return <p>Inicia sesion para ver tus transferencias.</p>;

  const enviadas = transferencias.filter(t => t.email_emisor === email);
  const recibidas = transferencias.filter(t => t.email_receptor === email);

  return (
    <div className="events-layout">
      <div className="events-shell">
        <div className="page-header">
          <div>
            <p className="eyebrow">Copa Mundial 2026</p>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Mis Transferencias</h1>
            <p style={{ fontSize: '0.95rem' }}>Historial de entradas enviadas y recibidas.</p>
          </div>
          <button className="back-link" onClick={() => navigate(-1)}>← Volver</button>
        </div>

        {loading && <p>Cargando transferencias...</p>}
        {error && <p className="form-error">Error: {error.message}</p>}

        {!loading && !error && transferencias.length === 0 && (
          <div className="events-list-panel">
            <p className="table-empty">No tenés transferencias todavia.</p>
          </div>
        )}

        {recibidas.length > 0 && (
          <div className="events-list-panel">
            <h2>Recibidas ({recibidas.length})</h2>
            <TablaTransferencias
              filas={recibidas}
              mostrarAcciones={true}
              email={email}
              respondiendo={respondiendo}
              onResponder={handleResponder}
            />
          </div>
        )}

        {enviadas.length > 0 && (
          <div className="events-list-panel">
            <h2>Enviadas ({enviadas.length})</h2>
            <TablaTransferencias filas={enviadas} mostrarAcciones={false} email={email} />
          </div>
        )}
      </div>
    </div>
  );
}

function TablaTransferencias({ filas, mostrarAcciones, email, respondiendo = false, onResponder }) {
  return (
    <div className="table-wrapper" style={{ marginTop: 16 }}>
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Entrada</th>
            {mostrarAcciones ? <th>Emisor</th> : <th>Receptor</th>}
            <th>Fecha solicitud</th>
            <th>Estado</th>
            {mostrarAcciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((transferencia) => {
            const cfg = ESTADO_LABEL[transferencia.estado]
              ?? { label: transferencia.estado, color: '#475569', bg: '#f1f5f9' };
            const esPendienteParaMi = transferencia.estado === 'pendiente'
              && transferencia.email_receptor === email;
            return (
              <tr key={transferencia.id}>
                <td>{transferencia.id}</td>
                <td>#{transferencia.id_entrada}</td>
                <td style={{ fontSize: '0.88rem' }}>
                  {mostrarAcciones ? transferencia.email_emisor : transferencia.email_receptor}
                </td>
                <td style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                  {new Date(transferencia.fecha_solicitud).toLocaleDateString('es-UY')}
                </td>
                <td>
                  <span className="rol-badge" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </td>
                {mostrarAcciones && (
                  <td>
                    {esPendienteParaMi ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="primary-button"
                          style={{ minHeight: 30, fontSize: '0.82rem', padding: '0 10px' }}
                          disabled={respondiendo}
                          onClick={() => onResponder(transferencia.id, 'aceptar')}
                        >
                          Aceptar
                        </button>
                        <button
                          className="secondary-button"
                          style={{ minHeight: 30, fontSize: '0.82rem', padding: '0 10px' }}
                          disabled={respondiendo}
                          onClick={() => onResponder(transferencia.id, 'rechazar')}
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
