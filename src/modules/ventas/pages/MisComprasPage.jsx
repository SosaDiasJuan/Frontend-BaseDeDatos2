import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatearFecha, formatearHora, formatearPrecio } from '../../eventos/utils/eventos.js';
import { ventasApi } from '../api/ventasApi.js';
import { useVentasMias } from '../hooks/useVentas.js';
import BrandLockup from '../../../components/BrandLockup.jsx';

import React from 'react';

const ESTADOS = {
  pendiente: ['Pendiente', 'status-pending'],
  confirmada: ['Confirmada', 'status-confirmed'],
  paga: ['Paga', 'status-paid'],
  cancelada: ['Cancelada', 'status-cancelled'],
};

export default function MisComprasPage() {
  const { ventas, loading, error } = useVentasMias();
  const [detalles, setDetalles] = useState({});
  const [errorAccion, setErrorAccion] = useState(null);

  async function alternarDetalle(id) {
    if (detalles[id]) {
      setDetalles((actual) => ({ ...actual, [id]: null }));
      return;
    }
    try {
      const detalle = await ventasApi.obtener(id);
      setDetalles((actual) => ({ ...actual, [id]: detalle }));
    } catch (err) {
      setErrorAccion(err);
    }
  }

  return (
    <main className="events-layout">
      <div className="events-shell">
        <header className="page-header">
          <div>
            <BrandLockup compact eyebrow="Historial de compra" />
            <h1>Mis compras</h1>
            <p>Consultá el historial y el estado de tus compras.</p>
          </div>
          <Link className="back-link" to="/home">Volver al inicio</Link>
        </header>

        {errorAccion && <p className="form-error">{errorAccion.message}</p>}
        <section className="events-list-panel">
          {loading ? (
            <p className="table-empty">Cargando compras...</p>
          ) : error ? (
            <p className="form-error">{error.message}</p>
          ) : ventas.length === 0 ? (
            <div className="empty-state">
              <p>Todavía no realizaste compras.</p>
              <Link className="primary-button button-link" to="/eventos">Explorar eventos</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table sales-table">
                <thead>
                  <tr>
                    <th>#</th><th>Fecha compra</th><th>Partido</th><th>Estado</th>
                    <th>Entradas</th><th>Total</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => {
                    const [label, clase] = ESTADOS[venta.estado] || [venta.estado, ''];
                    const detalle = detalles[venta.id];
                    return (
                      <Fragment key={venta.id}>
                        <tr>
                          <td>#{venta.id}</td>
                          <td>{formatearFechaHora(venta.fecha)}</td>
                          <td>
                            <strong>{venta.equipo_local} vs. {venta.equipo_visitante}</strong>
                            <small className="table-subtext">
                              {formatearFecha(venta.evento_fecha)} · {formatearHora(venta.evento_hora)}
                              {' · '}
                              {venta.estadio} · {venta.evento_pais}
                            </small>
                          </td>
                          <td><span className={`sale-status ${clase}`}>{label}</span></td>
                          <td>{Number(venta.cantidad_entradas)}</td>
                          <td>{formatearPrecio(venta.monto_total)}</td>
                          <td>
                            <div className="table-actions sales-actions">
                              <button className="purchase-action purchase-action-detail" type="button" onClick={() => alternarDetalle(venta.id)}>
                                {detalle ? 'Ocultar' : 'Detalle'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {detalle && (
                          <tr className="sale-detail-row">
                            <td colSpan="7">
                              <div className="sale-expanded">
                                <div>
                                  <strong>Detalle</strong>
                                  {detalle.items.map((item) => (
                                    <p key={item.id_sector}>
                                      {item.sector || `Sector ${item.id_sector}`} × {item.cantidad} · {formatearPrecio(item.precio_unitario)} c/u
                                    </p>
                                  ))}
                                </div>
                                <div>
                                  <strong>Entradas emitidas</strong>
                                  {detalle.entradas.length === 0
                                    ? <p>Aún no se emitieron entradas.</p>
                                    : (
                                      <p>
                                        {detalle.entradas
                                          .map((entrada) => `#${entrada.id} · ${entrada.sector || `Sector ${entrada.id_sector}`} (${entrada.estado})`)
                                          .join(', ')}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatearFechaHora(valor) {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(valor));
}
