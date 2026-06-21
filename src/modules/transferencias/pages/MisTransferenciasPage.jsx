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

        {transferencias.length > 0 && (
          <div className="events-list-panel">
            <h2>Transferencias ({transferencias.length})</h2>
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Entrada</th>
                    <th>Emisor</th>
                    <th>Receptor</th>
                    <th>Fecha solicitud</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transferencias.map(t => {
                    const cfg = ESTADO_LABEL[t.estado] ?? { label: t.estado, color: '#475569', bg: '#f1f5f9' };
                    const esPendienteParaMi = t.estado === 'pendiente' && t.email_receptor === email;
                    return (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>#{t.id_entrada}</td>
                        <td style={{ fontSize: '0.88rem' }}>{t.email_emisor}</td>
                        <td style={{ fontSize: '0.88rem' }}>{t.email_receptor}</td>
                        <td style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {new Date(t.fecha_solicitud).toLocaleDateString('es-UY')}
                        </td>
                        <td>
                          <span
                            className="rol-badge"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td>
                          {esPendienteParaMi ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="primary-button"
                                style={{ minHeight: 30, fontSize: '0.82rem', padding: '0 10px' }}
                                disabled={respondiendo}
                                onClick={() => handleResponder(t.id, 'aceptar')}
                              >
                                Aceptar
                              </button>
                              <button
                                className="secondary-button"
                                style={{ minHeight: 30, fontSize: '0.82rem', padding: '0 10px' }}
                                disabled={respondiendo}
                                onClick={() => handleResponder(t.id, 'rechazar')}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
