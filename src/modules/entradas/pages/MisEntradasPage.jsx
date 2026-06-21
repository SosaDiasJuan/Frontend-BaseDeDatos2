import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useEntradasMias } from '../hooks/useEntradas.js';
import { puedeTransferirEntrada } from '../../ventas/utils/ventas.js';
import EntradaQrModal from '../components/EntradaQrModal.jsx';
import { useState } from 'react';
import { useTransferenciasDeUsuario } from '../../transferencias/hooks/useTransferencias.js';

import React from 'react';

export default function MisEntradasPage() {
  const { usuario } = useAuth();
  const email = usuario?.email;
  const { entradas, loading, error } = useEntradasMias(Boolean(email));
  const [entradaQr, setEntradaQr] = useState(null);
  const { transferencias } = useTransferenciasDeUsuario(email);

  function tienePendienteComoEmisor(idEntrada) {
    return transferencias.some(
      t => t.id_entrada === idEntrada && t.estado === 'pendiente' && t.email_emisor === email
    );
  }

  if (!email) return <p>Inicia sesion para ver tus entradas.</p>;

  return (
    <div className="events-layout">
      <div className="events-shell">
        <div className="page-header">
          <div>
            <p className="eyebrow">Copa Mundial 2026</p>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Mis Entradas</h1>
            <p style={{ fontSize: '0.95rem' }}>Entradas que posees actualmente.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" className="back-link">← Home</Link>
            <Link to="/mis-transferencias" className="back-link">Ver transferencias</Link>
          </div>
        </div>

        {loading && <p>Cargando entradas...</p>}
        {error && <p className="form-error">Error: {error.message}</p>}

        {!loading && !error && entradas.length === 0 && (
          <div className="events-list-panel">
            <p className="table-empty">No tenés entradas todavia.</p>
          </div>
        )}

        {entradas.length > 0 && (
          <div className="events-list-panel">
            <h2>Entradas ({entradas.length})</h2>
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Estado</th>
                    <th>Evento</th>
                    <th>Sector</th>
                    <th>Transferencias</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map(e => {
                    const puedeTransferir = puedeTransferirEntrada(e);
                    return (
                      <tr key={e.id}>
                        <td>#{e.id}</td>
                        <td>
                          <span
                            className="rol-badge"
                            style={e.estado === 'consumida'
                              ? { background: '#f1f5f9', color: '#64748b' }
                              : { background: '#f0fdf4', color: '#166534' }
                            }
                          >
                            {e.estado}
                          </span>
                        </td>
                        <td>{e.id_evento}</td>
                        <td>{e.id_sector}</td>
                        <td style={{ textAlign: 'center' }}>{e.nro_transferencias}/3</td>
                        <td>
                          <div className="table-actions">
                            {e.estado === 'emitida' && e.estado_venta === 'paga' && (
                              <button
                                className="primary-button"
                                type="button"
                                style={{
                                  minHeight: 30,
                                  fontSize: '0.82rem',
                                  padding: '0 10px',
                                  ...(tienePendienteComoEmisor(e.id) && { background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed' })
                                }}
                                onClick={() => setEntradaQr(e)}
                                disabled={tienePendienteComoEmisor(e.id)}
                              >
                                Ver QR
                              </button>
                            )}
                            {puedeTransferir && tienePendienteComoEmisor(e.id) ? (
                              <span
                                className="rol-badge"
                                style={{ background: '#f1f5f9', color: '#64748b', cursor: 'default' }}
                              >
                                Pendiente
                              </span>
                            ) : puedeTransferir ? (
                              <Link
                                to={`/transferir/${e.id}`}
                                className="primary-button"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 30, fontSize: '0.82rem', padding: '0 10px', textDecoration: 'none', lineHeight: 1 }}
                              >
                                Transferir
                              </Link>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                {e.estado_venta !== 'paga' ? 'Pago pendiente' : '—'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {entradaQr && <EntradaQrModal entrada={entradaQr} onClose={() => setEntradaQr(null)} />}
      </div>
    </div>
  );
}
